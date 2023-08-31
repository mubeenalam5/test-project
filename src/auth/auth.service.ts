import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/create-auth.dto';
import { Connection, getRepository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/auth.entity';
import { messages } from 'src/common/messages';
import { Crypt } from 'src/common/encrypt';
import { ResponseDto } from 'src/common/res.dto';
import { FollowDto } from './dto/follow.dto';
import { Follower } from './entities/follower.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly connection: Connection,
    private jwtService: JwtService,

    @Inject(REQUEST)
    private readonly request: Request,

  ) { }

  async signUp(signUpDto: SignUpDto): Promise<ResponseDto> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (signUpDto?.email) {
        signUpDto.email = signUpDto?.email.toLocaleLowerCase();
      }
      const userRepo = queryRunner.manager.getRepository(User);

      const exist = await userRepo.findOne({
        where: { email: signUpDto.email }
      });
      if (exist) throw new BadRequestException(messages.already_exist)
      signUpDto.password = await Crypt.hashString(signUpDto.password);

      const user = await userRepo.save(signUpDto);
      await queryRunner.commitTransaction();

      return {
        message: messages.sign_up,
        data: user
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async signIn(signInDto: SignInDto): Promise<ResponseDto> {
    try {
      if (signInDto?.email) {
        signInDto.email = signInDto?.email.toLocaleLowerCase();
      }

      const userRepo = getRepository(User);
      const user = await userRepo.findOne({
        where: { email: signInDto.email }
      });

      if (!user) throw new NotFoundException(messages.invalid_credentials)

      if (!await Crypt.compare(signInDto.password, user.password)) throw new NotFoundException(messages.invalid_credentials)

      let accessToken = await this.jwtService.sign({
        email: user.email,
        id: user.id,
      });

      return {
        message: messages.sign_in,
        data: {
          token: accessToken,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async followUser(followDto: FollowDto): Promise<ResponseDto> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      const followerRepo = queryRunner.manager.getRepository(Follower);
      followDto.follower_id = await this.request['user'].id;

      console.log({ followDto });
      const follow = await followerRepo.save(followDto);
      console.log({ follow });
      await queryRunner.commitTransaction();

      return {
        message: messages.followed,
        data: null
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async followed(): Promise<ResponseDto> {
    try {
      let follower_id = await this.request['user'].id;
      const followerRepo = getRepository(Follower);
      const followedUsers = await followerRepo.createQueryBuilder('f')
        .where('f.follower_id = :follower_id', { follower_id })
        .leftJoin('f.followedUser', 'fdu')
        .select([
          'f.id',
          'fdu.id',
          'fdu.name',
          'fdu.email'
        ])
        .getMany();

      return {
        message: messages.get,
        data: followedUsers
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async follower(): Promise<ResponseDto> {
    try {
      let followed_id = await this.request['user'].id;
      const followerRepo = getRepository(Follower);
      const followedUsers = await followerRepo.createQueryBuilder('f')
        .where('f.followed_id = :followed_id', { followed_id })
        .leftJoin('f.followerUser', 'fdu')
        .select([
          'f.id',
          'fdu.id',
          'fdu.name',
          'fdu.email'
        ])
        .getMany();

      return {
        message: messages.get,
        data: followedUsers
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}