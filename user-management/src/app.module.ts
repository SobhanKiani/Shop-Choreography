import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JWT_CONSTANT } from 'jwt/constants';
import { PrismaService } from 'services/prisma-service/prisma-service.service';
import { UserService } from 'services/user-services/user.service';
import { UserController } from './controllers/user/user.controller';
import { UserRepository } from 'repositories/user.repository';
import { PrometheusModule, makeHistogramProvider, makeSummaryProvider } from 'nestjs-prometheus';


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
          // servers: [process.env.NATS_URL]
          servers: ["nats://localhost:4222"]
        }
      },
    ]),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true
      },
      defaultLabels: {
        app: 'user-management'
      }

    })
  ],
  controllers: [UserController],
  providers: [
    PrismaService,
    UserService,
    UserRepository,
    makeSummaryProvider({
      name: 'request_duration_seconds',
      help: 'request_duration_seconds_help',
    })
  ],

})
export class AppModule { }
