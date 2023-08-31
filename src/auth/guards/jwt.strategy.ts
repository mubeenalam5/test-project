import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, getRepository } from 'typeorm';
import { User } from '../entities/auth.entity';
import { jwtConfig } from 'src/config/jwt.config';
import { SignInDto } from '../dto/create-auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectConnection()
        private readonly connection: Connection,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfig.secret,
        });
    }

    async validate(payload: SignInDto): Promise<any> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { email } = payload;
            const userRepo = queryRunner.manager.getRepository(User);
            const user = await userRepo
                .createQueryBuilder('user')
                .where('user.email = :email', { email })
                .getOne();
            if (!user) {
                throw new UnauthorizedException();
            }
            await queryRunner.commitTransaction();
            return { ...user };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        } finally {
            await queryRunner.release();
        }
    }
}
