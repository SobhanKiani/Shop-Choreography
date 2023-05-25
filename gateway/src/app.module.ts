import { Module } from '@nestjs/common';
import { UserManagementController } from './user-management/controllers/user-management.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CLIENTS_ENUM } from '@sobhankiani/shopc-common-lib';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.gurad';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CLIENTS_ENUM.USER_MANAGEMENT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.USER_MANAGEMENT_HOST,
          port: Number(process.env.USER_MANAGEMENT_PORT),
        },
      },
    ])
  ],
  controllers: [UserManagementController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }
