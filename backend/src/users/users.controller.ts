import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🟢 Public — anyone can register
  @Post('register')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  // 🔐 Protected — only logged-in users with a valid JWT can access
  @Get()
 @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }
}
