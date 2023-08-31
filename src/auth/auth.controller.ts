import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptor';

@ApiTags('Auth')
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
}
