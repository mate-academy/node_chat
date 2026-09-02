import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

type PrismaLifecycle = OnModuleInit & OnModuleDestroy;

@Injectable()
export class PrismaService extends PrismaClient implements PrismaLifecycle {
  constructor(configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('DATABASE_URL');

    const adapter = new PrismaPg({
      connectionString,
    });

    super({
      adapter,
      omit: {
        chatProfile: {
          email: true,
          phone: true,
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
