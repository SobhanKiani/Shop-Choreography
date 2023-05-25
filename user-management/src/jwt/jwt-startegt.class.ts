import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt/lib';
import { JWT_CONSTANT } from './constants';
import { JWTPayload } from './jwt-payload';
import { UserService } from 'services/user-services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
  ) {
    super({
      secretOrKey: JWT_CONSTANT.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JWTPayload) {
    const user = await this.userService.getUserById(payload.id);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
  }
}
