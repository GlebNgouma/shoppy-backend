import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CreateUserRquest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { NoFilesInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(NoFilesInterceptor())
  createUser(@Body() createUserRequest: CreateUserRquest) {
    return this.usersService.createUser(createUserRequest);
  }
}
