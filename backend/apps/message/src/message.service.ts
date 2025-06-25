import { Injectable, NotFoundException } from '@nestjs/common';
import { Group, Message, User } from '@app/shared';
import { ChatMessageDto, FetchGroupMessagesDto } from '@app/shared/dtos/message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,
  ) { }

  async handleSaveMessage(chatMessageDto: ChatMessageDto) {
    const { senderId, groupId, content, attachment } = chatMessageDto;
    const user = await this.userModel.findById(senderId).exec();
    const group = await this.groupModel.findById(groupId).exec();

    if (!user || !group) {
      throw new NotFoundException('User or group not found');
    }

    const message = new this.messageModel({
      attachment,
      content,
      sender: new Types.ObjectId(senderId),
      group: new Types.ObjectId(groupId),
    });
    const savedMessage = await message.save();

    return savedMessage;
  }

  async fetchGroupMessages(fetchGroupMessagesDto: FetchGroupMessagesDto) {
    const { groupId, limit = 10, page, cursor } = fetchGroupMessagesDto;

    if (page && cursor) {
      throw new Error('Provide either page or beforeTimestamp, not both.');
    }

    const group = await this.groupModel.findById(groupId).exec();
    if (!group) throw new NotFoundException('Group not found');

    const query: any = { group: new Types.ObjectId(groupId) };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const skip = page && !cursor ? (page - 1) * limit : 0;

    const messages = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName email')
      .exec();

    let canLoadMore = false;

    if (cursor) {
      const oldestMessage = messages[messages.length - 1];
      if (oldestMessage) {
        const moreCount = await this.messageModel.countDocuments({
          group: new Types.ObjectId(groupId),
          createdAt: { $lt: oldestMessage.createdAt },
        });
        canLoadMore = moreCount > 0;
      }
    } else {
      const total = await this.messageModel.countDocuments({
        group: new Types.ObjectId(groupId),
      });
      canLoadMore = skip + messages.length < total;
    }

    return {
      messages,
      canLoadMore,
    };
  }

}
