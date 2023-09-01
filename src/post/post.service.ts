import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Connection, getRepository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
import { ResponseDto } from 'src/common/res.dto';
import { messages } from 'src/common/messages';
import { Post } from './entities/post.entity';
import { FileUploadService } from 'src/common/file-upload.service';
import { CommentDto } from './dto/comment.dto';
import { Comment } from './entities/comment.entity';
import { AuthService } from 'src/auth/auth.service';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
    constructor(
        private readonly connection: Connection,

        private readonly authService: AuthService,

        private readonly fileUploadService: FileUploadService,

        @Inject(REQUEST)
        private readonly request: Request,

    ) { }

    async create(createPostDto: CreatePostDto, file: Express.Multer.File): Promise<ResponseDto> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            createPostDto.created_by = await this.request['user'].id;

            if (file) {
                const uploadRes = await this.fileUploadService.singleFileUpload(file, 'post_images/')
                createPostDto.image_url = uploadRes.url;
            } else {
                createPostDto.image_url = null;
            }
            const postRepo = queryRunner.manager.getRepository(Post);

            const post = await postRepo.save(createPostDto);
            await queryRunner.commitTransaction();
            return {
                message: messages.created,
                data: post
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        } finally {
            await queryRunner.release();
        }
    }

    async get(options: IPaginationOptions): Promise<ResponseDto> {
        try {
            let user_id = await this.request['user'].id; // my id
            let filter = [];
            filter.push(user_id) // cus i can view my posts

            let fd = (await this.authService.followed()).data;
            fd.forEach((f) => {
                filter.push(f.followed_id);
            })

            const postRepo = getRepository(Post);
            const query = postRepo.createQueryBuilder('p')
                .where('p.created_by IN (:...filter)', { filter })
                .leftJoin('p.created_by_user', 'u')
                .leftJoin('p.comments', 'c')
                .leftJoin('c.created_by_user', 'cu')
                .select([
                    'p.id',
                    'p.title',
                    'p.description',
                    'p.category',
                    'p.image_url',
                    'u.name',
                    'c.comment',
                    'cu.name',
                ])
                .orderBy('p.id', 'DESC')

            const Data = await paginate<Post>(query, options);

            return {
                message: messages.get,
                data: Data
            };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async update(id: number, updatePostDto: UpdatePostDto, file: Express.Multer.File): Promise<ResponseDto> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            updatePostDto.created_by = await this.request['user'].id;
            const postRepo = queryRunner.manager.getRepository(Post);

            const post = await postRepo.findOne({
                where: {
                    id,
                    created_by: updatePostDto.created_by
                }
            })

            if (!post) throw new UnauthorizedException(messages.unauthorised)

            if (file) {
                const uploadRes = await this.fileUploadService.singleFileUpload(file, 'post_images/')
                updatePostDto.image_url = uploadRes.url;
            } else {
                updatePostDto.image_url = post.image_url;
            }

            await postRepo.update({ id: post.id }, { ...updatePostDto })

            await queryRunner.commitTransaction();
            return {
                message: messages.updated,
                data: null
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        } finally {
            await queryRunner.release();
        }
    }

    async delete(id: number): Promise<ResponseDto> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let created_by = await this.request['user'].id;
            const postRepo = queryRunner.manager.getRepository(Post);
            const commentRepo = queryRunner.manager.getRepository(Comment);

            const post = await postRepo.createQueryBuilder('p')
                .where('p.id = :id', { id })
                .leftJoin('p.created_by_user', 'u')
                .leftJoin('p.comments', 'c')
                .select([
                    'p.id',
                    'p.title',
                    'p.description',
                    'p.category',
                    'p.image_url',
                    'u.name',
                    'c.id',
                    'c.comment',
                ])
                .getOne()
            if (!post) throw new NotFoundException(messages.not_found_or_not_belongs)

            for(let i = 0; i< post.comments.length; i++) {
                await commentRepo.delete({ id: post.comments[i].id }); 
            }

            await postRepo.delete({ id: post.id })

            await queryRunner.commitTransaction();
            return {
                message: messages.deleted,
                data: null
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        } finally {
            await queryRunner.release();
        }
    }

    async comment(commentDto: CommentDto): Promise<ResponseDto> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            commentDto.created_by = await this.request['user'].id;

            const postRepo = queryRunner.manager.getRepository(Post);
            const post = await postRepo.findOne({
                where: {
                    id: commentDto.post_id
                }
            });

            let follow_status = false;
            if (commentDto.created_by == post.created_by) { // if own post
                follow_status = true;
            } else { // else followed user post
                let fd = (await this.authService.followed()).data;
                fd.forEach((f) => {
                    if (f.followed_id == post.created_by) {
                        follow_status = true;
                    }
                })
            }
            if (!follow_status) {
                throw new BadRequestException(messages.unfollowed)
            }

            const commentRepo = queryRunner.manager.getRepository(Comment);
            const comment = await commentRepo.save(commentDto);

            await queryRunner.commitTransaction();
            return {
                message: messages.created,
                data: comment
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        } finally {
            await queryRunner.release();
        }
    }
}