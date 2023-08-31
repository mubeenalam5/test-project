import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptor';
import { FollowDto } from './dto/follow.dto';
import { hasRole } from './guards/permission.decorator';
import { Role } from './role.enum';

@ApiTags('User')
@Controller({
  version: '1',
  path: 'auth'
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseInterceptors(TransformInterceptor)
  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseInterceptors(TransformInterceptor)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @hasRole(Role.User)
  @UseInterceptors(TransformInterceptor)
  @Post('follow')
  followUser(@Body() followDto: FollowDto) {
    return this.authService.followUser(followDto);
  }

  @hasRole(Role.User)
  @UseInterceptors(TransformInterceptor)
  @Get('followed')
  followed() {
    return this.authService.followed();
  }

  @hasRole(Role.User)
  @UseInterceptors(TransformInterceptor)
  @Get('follower')
  follower() {
    return this.authService.follower();
  }
}
