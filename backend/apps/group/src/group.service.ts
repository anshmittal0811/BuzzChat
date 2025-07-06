import { Group, GroupMember, GroupRole, Message, User } from '@app/shared';
import { CreateGroupDto, FetchGroupDto, GroupCreatedNotificationDto, UpdateGroupDto } from '@app/shared/dtos/group.dto';
import { ChatMessageDto, MessageDeleteDto } from '@app/shared/dtos/message.dto';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class GroupService {
    constructor(
        @InjectModel(GroupMember.name)
        private groupMemberModel: Model<GroupMember>,
        @InjectModel(Group.name)
        private groupModel: Model<Group>,
        @InjectModel(User.name)
        private userModel: Model<User>,
        private readonly kafkaService: KafkaService,
    ) { }

    async handleChatMessage(message: ChatMessageDto | MessageDeleteDto) {
        const groupId = new Types.ObjectId(message.groupId);
        const members = await this.groupMemberModel
            .find({ group: groupId })
            .populate('user', '_id')
            .exec();

        for (const member of members) {
            if (member.user && member.user._id.toString() !== message.senderId) {
                this.kafkaService.produce('group.member.sent', {
                    receiverId: member.user._id,
                    message,
                });
            }
        }
    }

    async createGroup(createGroupDto: CreateGroupDto) {
        const { createdBy, name, memberIds } = createGroupDto;
        const allUserIds = Array.from(new Set([...memberIds, createdBy]));

        const users = await this.userModel.find({ _id: { $in: allUserIds } }).exec();
        if (users.length !== allUserIds.length) {
            throw new RpcException({
                statusCode: 404,
                message: 'Some users not found',
            });
        }

        const group = new this.groupModel({ name });
        const savedGroup = await group.save();

        const members = users.map((user) => ({
            group: savedGroup._id,
            user: user._id,
            role: user._id.toString() === createdBy ? GroupRole.ADMIN : GroupRole.MEMBER,
        }));

        await this.groupMemberModel.insertMany(members);

        // Publish group creation event to Kafka
        const groupNotification: GroupCreatedNotificationDto = {
            groupId: savedGroup._id.toString(),
            name: savedGroup.name || null,
            createdBy,
            members: users.map(user => ({
                _id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profileUrl: user.profileUrl || null,
            })),
            imageUrl: createGroupDto.imageUrl,
        };

        await this.kafkaService.produce('group.created', groupNotification);

        return {
            groupId: savedGroup._id,
            members: members.map((member) => member.user),
        };
    }

    /**
     * Creates aggregation pipeline to find groups where user is a member
     */
    private getUserGroupsMatchStage(userId: Types.ObjectId) {
        return [
            {
                $lookup: {
                    from: 'groupmembers',
                    localField: '_id',
                    foreignField: 'group',
                    as: 'memberships',
                },
            },
            {
                $match: {
                    'memberships.user': userId,
                },
            },
        ] as any[];
    }

    /**
     * Creates aggregation pipeline to get all group members with their details
     */
    private getGroupMembersStage() {
        return [
            {
                $lookup: {
                    from: 'groupmembers',
                    localField: '_id',
                    foreignField: 'group',
                    as: 'memberRelations',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'memberRelations.user',
                    foreignField: '_id',
                    as: 'members',
                },
            },
            {
                $addFields: {
                    // Remove password field from members
                    members: {
                        $map: {
                            input: '$members',
                            as: 'member',
                            in: {
                                _id: '$$member._id',
                                email: '$$member.email',
                                firstName: '$$member.firstName',
                                lastName: '$$member.lastName',
                                profileUrl: '$$member.profileUrl',
                                createdAt: '$$member.createdAt',
                                updatedAt: '$$member.updatedAt',
                            },
                        },
                    },
                },
            },
        ] as any[];
    }

    /**
     * Creates aggregation pipeline to get last 10 messages for each group
     */
    private getLastMessagesStage() {
        return [
            {
                $lookup: {
                    from: 'messages',
                    let: { groupId: '$_id' },
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { $eq: ['$group', '$$groupId'] } 
                            } 
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'sender',
                                foreignField: '_id',
                                as: 'senderDetails',
                            },
                        },
                        { 
                            $unwind: '$senderDetails' 
                        },
                        {
                            $addFields: {
                                sender: {
                                    _id: '$senderDetails._id',
                                    email: '$senderDetails.email',
                                    firstName: '$senderDetails.firstName',
                                    lastName: '$senderDetails.lastName',
                                    profileUrl: '$senderDetails.profileUrl',
                                },
                            },
                        },
                        {
                            $unset: 'senderDetails'
                        },
                    ] as any[],
                    as: 'lastMessages',
                },
            },
        ] as any[];
    }

    /**
     * Fetches user group contexts with members and last messages
     */
    async fetchUserGroupContexts(
        fetchGroupDto: FetchGroupDto
    ): Promise<
        { group: Group; members: Omit<User, 'password'>[]; lastMessages: Message[] }[]
    > {
        try {
            const userId = new Types.ObjectId(fetchGroupDto._id);
            
            // Build aggregation pipeline with readable stages
            const pipeline = [
                // Stage 1: Find groups where user is a member
                ...this.getUserGroupsMatchStage(userId),
                
                // Stage 2: Get all members for each group
                ...this.getGroupMembersStage(),
                
                // Stage 3: Get last 10 messages for each group
                ...this.getLastMessagesStage(),
                
                // Stage 4: Clean up and sort
                {
                    $unset: ['memberships', 'memberRelations']
                },
                {
                    $sort: { updatedAt: -1 }
                },
            ];

            const groups = await this.groupModel.aggregate(pipeline);
            return groups;
        } catch (error) {
            throw new RpcException({
                statusCode: 400,
                message: 'Invalid group ID',
                error: error.message,
            });
        }
    }

    async updateGroup(updateGroupDto: UpdateGroupDto) {
        const { groupId, name, imageUrl } = updateGroupDto;
        const group = await this.groupModel.findByIdAndUpdate(groupId, { name, imageUrl }, { new: true });
        return group;
    }
}
