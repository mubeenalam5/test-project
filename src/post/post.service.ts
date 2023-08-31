import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Connection, getRepository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
import { ResponseDto } from 'src/common/res.dto';
import { messages } from 'src/common/messages';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
    constructor(
        private readonly connection: Connection,
        private jwtService: JwtService,

        @Inject(REQUEST)
        private readonly request: Request,

    ) { }

    async create(createPostDto: CreatePostDto, dataBuffer: Buffer, file_name: string): Promise<ResponseDto> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {

            createPostDto.data = dataBuffer;
            createPostDto.file_name = file_name;
            createPostDto.created_by = await this.request['user'].id;
            const postRepo = queryRunner.manager.getRepository(Post);

            console.log({ createPostDto });
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
}