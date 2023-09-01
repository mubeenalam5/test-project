import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwt_config } from 'src/config/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileUploadService } from 'src/common/file-upload.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwt_config),
  ],
  controllers: [PostController],
  providers: [
    PostService,
    AuthService,
    RolesGuard,
    JwtAuthGuard,
    FileUploadService
    // JwtStrategy
  ]
})
export class PostModule {}
