import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { DataSource } from 'typeorm';
import { RolesController } from './roles/roles.controller';
import { RolesModule } from './roles/roles.module';
import { RolesService } from './roles/roles.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    UsersModule,
    RolesModule,
    AuthModule,
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
