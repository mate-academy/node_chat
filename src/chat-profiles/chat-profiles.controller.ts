import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ChatProfilesService } from './chat-profiles.service';
import { CreateChatProfileDto } from './dto/create-chat-profile.dto';
// eslint-disable-next-line max-len
import { SearchChatProfilesQueryDto } from './dto/search-chat-profiles-query.dto';
import { UpdateChatProfileDto } from './dto/update-chat-profile.dto';

@Controller('chat-profiles')
export class ChatProfilesController {
  constructor(private readonly chatProfilesService: ChatProfilesService) {}

  @Post()
  create(@Body() data: CreateChatProfileDto) {
    return this.chatProfilesService.create(data);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatProfilesService.findOne(id);
  }

  @Get()
  findAll(@Query() query: SearchChatProfilesQueryDto) {
    return this.chatProfilesService.findAll(query.search);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateChatProfileDto,
  ) {
    return this.chatProfilesService.update(id, data);
  }
}
