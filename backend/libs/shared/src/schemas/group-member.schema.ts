// src/group/group-member.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum GroupRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

@Schema({ timestamps: { updatedAt: false } })
export class GroupMember extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  group: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ enum: GroupRole, default: GroupRole.MEMBER })
  role: GroupRole;
}

export const GroupMemberSchema = SchemaFactory.createForClass(GroupMember);
