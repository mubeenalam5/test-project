import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AdminSignUpDto, SignInDto, SignUpDto } from './dto/create-auth.dto';
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
import { Role } from './role.enum';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

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
      signUpDto.role = Role.User;
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

  async adminSignUp(adminSignUpDto: AdminSignUpDto): Promise<ResponseDto> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (adminSignUpDto?.email) {
        adminSignUpDto.email = adminSignUpDto?.email.toLocaleLowerCase();
      }

      adminSignUpDto.role = Role.Admin;
      const userRepo = queryRunner.manager.getRepository(User);

      const exist = await userRepo.findOne({
        where: { role: Role.Admin }
      });

      if (exist) throw new BadRequestException(messages.admin_already_exist)
      adminSignUpDto.password = await Crypt.hashString(adminSignUpDto.password);

      const admin = await userRepo.save(adminSignUpDto);
      await queryRunner.commitTransaction();

      return {
        message: messages.sign_up,
        data: admin
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

  async get(options: IPaginationOptions): Promise<ResponseDto> {
    try {
      let id = await this.request['user'].id;
      let role = await this.request['user'].role;

      const userRepo = getRepository(User);
      const query = userRepo.createQueryBuilder('u')
        .select([
          'u.id',
          'u.name',
          'u.email',
          'u.role',
        ])

        if(role == Role.User){
          query.where('u.role = :role', { role: Role.User })
          .andWhere('u.id != :id', { id })
          .orderBy('u.id', 'DESC')
        } else {
          query.andWhere('u.id != :id', { id })
          .orderBy('u.id', 'DESC')
        }

      const Data = await paginate<User>(query, options);

      return {
        message: messages.get,
        data: Data
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

      const check = followerRepo.findOne({
        where: {
          follower_id: followDto.follower_id,
          followed_id: followDto.follower_id
        }
      })

      if (check) throw new BadRequestException(messages.already_followed)

      const follow = await followerRepo.save(followDto);
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
          'f.followed_id',
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
          'f.follower_id',
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