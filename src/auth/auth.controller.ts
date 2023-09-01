import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminSignUpDto, SignInDto, SignUpDto } from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptor';
import { FollowDto } from './dto/follow.dto';
import { hasRole } from './guards/permission.decorator';
import { Role } from './role.enum';

@Controller({
  version: '1',
  path: 'auth'
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiTags(Role.Admin)
  @UseInterceptors(TransformInterceptor)
  @Post('admin-signup')
  adminSignUp(@Body() adminSignUpDto: AdminSignUpDto) {
    return this.authService.adminSignUp(adminSignUpDto);
  }

  @ApiTags(Role.User)
  @UseInterceptors(TransformInterceptor)
  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @ApiTags(Role.Admin, Role.User)
  @UseInterceptors(TransformInterceptor)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @ApiTags(Role.Admin, Role.User)
  @hasRole(Role.Admin, Role.User)
  @UseInterceptors(TransformInterceptor)
  @Get()
  get(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    limit = limit > 10 ? 10 : limit;
    return this.authService.get({ page, limit });
  }

  @ApiTags(Role.User, Role.Admin)
  @hasRole(Role.User, Role.Admin)
  @UseInterceptors(TransformInterceptor)
  @Post('follow')
  followUser(@Body() followDto: FollowDto) {
    return this.authService.followUser(followDto);
  }

  @ApiTags(Role.User, Role.Admin)
  @hasRole(Role.User, Role.Admin)
  @UseInterceptors(TransformInterceptor)
  @Get('followed')
  followed() {
    return this.authService.followed();
  }

  @ApiTags(Role.User, Role.Admin)
  @hasRole(Role.User, Role.Admin)
  @UseInterceptors(TransformInterceptor)
  @Get('follower')
  follower() {
    return this.authService.follower();
  }
}
