import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptor';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { hasRole } from 'src/auth/guards/permission.decorator';
import { Role } from 'src/auth/role.enum';
import { CommentDto } from './dto/comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller({
  version: '1',
  path: 'post'
})
export class PostController {
  constructor(private readonly postService: PostService) { }

  @ApiTags(Role.User, Role.Admin)
  @hasRole(Role.User, Role.Admin)
  @Post()
  @UseInterceptors(TransformInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreatePostDto
  })
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.postService.create(createPostDto, file);
  }

  @ApiTags(Role.User, Role.Admin)
  @hasRole(Role.User, Role.Admin)
  @Get()
  get(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    limit = limit > 10 ? 10 : limit;
    return this.postService.get({ page, limit });
  }

  @ApiTags(Role.User, Role.Admin)
  @hasRole(Role.User, Role.Admin)
  @Post('comment')
  @UseInterceptors(TransformInterceptor)
  comment(
    @Body() commentDto: CommentDto
  ) {
    return this.postService.comment(commentDto);
  }

  @ApiTags(Role.User, Role.Admin)
  @hasRole(Role.User, Role.Admin)
  @Patch(':id')
  @UseInterceptors(TransformInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdatePostDto
  })
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.postService.update(+id, updatePostDto, file);
  }

  @ApiTags(Role.User, Role.Admin)
  @hasRole(Role.User, Role.Admin)
  @Delete(':id')
  delete(
    @Param('id') id: string
  ) {
    return this.postService.delete(+id);
  }
}
