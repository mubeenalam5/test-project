import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/create-auth.dto';
import { Connection, getRepository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/auth.entity';
import { messages } from 'src/common/messages';
import { Crypt } from 'src/common/encrypt';
import { ResponseDto } from 'src/common/res.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly connection: Connection,
    private jwtService: JwtService,
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

      const checkExist = await userRepo.findOne({
        where: { email: signUpDto.email }
      });
      signUpDto.password = await Crypt.hashString(signUpDto.password);

      const user = await userRepo.save({
        name: signUpDto.password,
        email: signUpDto.email,
        cnic: signUpDto.password,
        role: signUpDto.role
      });
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

  async signIn(signInDto: SignInDto): Promise<ResponseDto>  {
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
}
