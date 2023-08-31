import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { orm_config } from './config/db.config';
import { JwtModule } from '@nestjs/jwt';
import { jwt_config } from './config/jwt.config';
import { AuthService } from './auth/auth.service';
import { RolesGuard } from './auth/guards/role.guard';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { JwtStrategy } from './auth/guards/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot(orm_config),
    JwtModule.register(jwt_config),
    ConfigModule.forRoot(),
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AuthService,
    RolesGuard,
    JwtAuthGuard,
    JwtStrategy
  ],
  exports: [AuthService]
})
export class AppModule {}