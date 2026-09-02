import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatProfileDto } from './dto/create-chat-profile.dto';
import { UpdateChatProfileDto } from './dto/update-chat-profile.dto';

@Injectable()
export class ChatProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateChatProfileDto) {
    const email = data.email?.trim().toLowerCase();
    const phone = data.phone?.trim();

    if (Boolean(email) === Boolean(phone)) {
      throw new BadRequestException(
        'Provide exactly one identifier: email or phone',
      );
    }

    const profileData = {
      displayName: data.displayName.trim(),
      avatarUrl: data.avatarUrl,
    };

    if (email) {
      const profile = await this.prisma.chatProfile.upsert({
        where: {
          email,
        },
        update: {},
        create: {
          ...profileData,
          email,
        },
      });

      return {
        ...profile,
        identifier: email,
      };
    }

    if (phone) {
      const profile = await this.prisma.chatProfile.upsert({
        where: {
          phone,
        },
        update: {},
        create: {
          ...profileData,
          phone,
        },
      });

      return {
        ...profile,
        identifier: phone,
      };
    }

    throw new BadRequestException('Email or phone is required');
  }

  async update(id: string, data: UpdateChatProfileDto) {
    const profile = await this.prisma.chatProfile.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Chat profile not found');
    }

    return this.prisma.chatProfile.update({
      where: {
        id,
      },
      data: {
        displayName: data.displayName.trim(),
      },
    });
  }

  findAll(search?: string) {
    const normalizedSearch = search?.trim();

    return this.prisma.chatProfile.findMany({
      where: {
        deletedAt: null,
        displayName: normalizedSearch
          ? {
              contains: normalizedSearch,
              mode: 'insensitive',
            }
          : undefined,
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
      },
      orderBy: {
        displayName: 'asc',
      },
      take: 20,
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.chatProfile.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundException('Chat profile not found');
    }

    return profile;
  }
}
