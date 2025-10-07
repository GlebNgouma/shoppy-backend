import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import ms from 'ms';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async veryfyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({ email });
      const authenticated = await bcrypt.compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Les identifiants ne sont pas valides');
    }
  }

  async login(user: User, response: Response) {
    //Determiné quand le cookie expire
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(
          this.configService.getOrThrow<string>(
            'JWT_EXPIRATION',
          ) as ms.StringValue,
        ),
    );

    //Pour qui le jeton  a été emis
    const tokenPayload: TokenPayload = { userId: user.id };
    const token = this.jwtService.sign(tokenPayload);
    //Ajouter le cookie à la réponse
    response.cookie('Authentication', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      expires,
    });

    return { tokenPayload };
  }

  verifyToken(jwt: string) {
    this.jwtService.verify(jwt);
  }
}
