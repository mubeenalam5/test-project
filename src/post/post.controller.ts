import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptor';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@Controller({
  version: '1',
  path: 'post'
})
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseInterceptors(TransformInterceptor, FileInterceptor('file'))
  @Post()
  create(@Body() createPostDto: CreatePostDto, @UploadedFile() file: Express.Multer.File) {
    return this.postService.create(createPostDto, file.buffer, file.originalname);
  }
}
