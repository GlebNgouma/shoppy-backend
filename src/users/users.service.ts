import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserRquest } from './dto/create-user.request';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserRquest) {
    try {
      const user = await this.prismaService.user.create({
        data: { ...data, password: await bcrypt.hash(data.password, 10) },
        select: { email: true, id: true },
      });
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new UnprocessableEntityException("L'email existe déjà");
      }
      throw error;
    }
  }

  async getUser(filter: Prisma.UserWhereUniqueInput) {
    return await this.prismaService.user.findUniqueOrThrow({ where: filter });
  }
}
