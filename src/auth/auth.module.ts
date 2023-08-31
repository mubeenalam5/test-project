import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwt_config } from 'src/config/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './guards/role.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwt_config),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RolesGuard,
    JwtAuthGuard,
    JwtStrategy,
  ]
})
export class AuthModule {}
