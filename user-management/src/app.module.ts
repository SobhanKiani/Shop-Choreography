import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JWT_CONSTANT } from 'jwt/constants';
import { PrismaService } from 'services/prisma-service/prisma-service.service';
import { UserService } from 'services/user-services/user.service';


@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: JWT_CONSTANT.secret,
      signOptions: {
        expiresIn: '30d',
      },
    }),
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL]
        }
      },
    ]),
  ],
  controllers: [],
  providers: [PrismaService, UserService],
})
export class AppModule { }
