import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ListRoomsQueryDto } from './dto/list-rooms-query.dto';
import { DeleteRoomDto } from './dto/delete-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ChatGateway } from '../messages/chat.gateway';
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  create(@Body() data: CreateRoomDto) {
    return this.roomsService.create(data);
  }

  @Get()
  findAll(@Query() query: ListRoomsQueryDto) {
    return this.roomsService.findAll(query.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.roomsService.findOne(id, userId);
  }

  @Post(':id/join')
  async join(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: JoinRoomDto,
  ) {
    const member = await this.roomsService.join(id, data);

    this.chatGateway.notifyRoomMembersChanged(id);

    return member;
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateRoomDto) {
    return this.roomsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Body() data: DeleteRoomDto) {
    return this.roomsService.remove(id, data);
  }

  @Delete(':id/members/:userId')
  async leave(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const member = await this.roomsService.leave(id, userId);

    this.chatGateway.notifyRoomMembersChanged(id);

    return member;
  }
}
