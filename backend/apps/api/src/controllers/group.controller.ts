import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  TimeoutError,
  catchError,
  firstValueFrom,
  throwError,
  timeout,
} from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateGroupDto, UpdateGroupDto } from '@app/shared/dtos/group.dto';
import { FetchGroupMessagesDto } from '@app/shared/dtos/message.dto';

@Controller('groups')
export class GroupController {
  constructor(
    @Inject('GROUP_SERVICE') private groupService: ClientProxy,
    @Inject('MESSAGE_SERVICE') private messageService: ClientProxy,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async createGroup(
    @Body() body: Omit<CreateGroupDto, 'createdBy'>,
    @Req() req: Request,
  ) {
    const createGroupDto: CreateGroupDto = {
      ...body,
      createdBy: req['user'].sub,
    };
    const response = await firstValueFrom(
      this.groupService.send({ cmd: 'group.create' }, createGroupDto).pipe(
        timeout(7000),
        catchError((error) => {
          if (error instanceof TimeoutError) {
            return throwError(
              () =>
                new ServiceUnavailableException(
                  'Group service unavailable or timed out',
                ),
            );
          }
          return throwError(() => error);
        }),
      ),
    );
    return {
      statusCode: 201,
      message: 'Group created successfully',
      data: response,
    };
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async fetchAllGroups(@Req() req: Request) {
    const response = await firstValueFrom(
      this.groupService
        .send({ cmd: 'groups.list' }, { _id: req['user']?.sub })
        .pipe(
          timeout(7000),
          catchError((error) => {
            console.log(error, 'error');
            if (error instanceof TimeoutError) {
              return throwError(
                () =>
                  new ServiceUnavailableException(
                    'Group service unavailable or timed out',
                  ),
              );
            }
            return throwError(() => error);
          }),
        ),
    );
    return {
      statusCode: 200,
      message: 'Groups retrieved successfully',
      data: response,
    };
  }

  @Post(':groupId/messages')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async fetchGroupMessages(
    @Param('groupId') groupId: string,
    @Body() paginationOptions: Omit<FetchGroupMessagesDto, 'groupId'>,
  ) {
    const response = await firstValueFrom(
      this.messageService
        .send(
          { cmd: 'group.messages' },
          { ...paginationOptions, groupId: groupId },
        )
        .pipe(
          timeout(20000),
          catchError((error) => {
            if (error instanceof TimeoutError) {
              return throwError(
                () =>
                  new ServiceUnavailableException(
                    'Message service unavailable or timed out',
                  ),
              );
            }
            return throwError(() => error);
          }),
        ),
    );
    return {
      statusCode: 200,
      message: 'Group Messages retrieved successfully',
      data: response,
    };
  }

  @Patch(':groupId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async updateGroup(@Param('groupId') groupId: string, @Body() body: Partial<UpdateGroupDto>) {
    const response = await firstValueFrom(
      this.groupService.send({ cmd: 'group.update' }, { groupId, ...body }).pipe(
        timeout(7000),
        catchError((error) => {
          if (error instanceof TimeoutError) {
            return throwError(
              () =>
                new ServiceUnavailableException(
                  'Group service unavailable or timed out',
                ),
            );
          }
          return throwError(() => error);
        }),
      ),
    );
    return {
      statusCode: 200,
      message: 'Group updated successfully',
      data: response,
    };
  }
} 