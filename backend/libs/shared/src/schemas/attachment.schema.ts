// src/message/attachment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false }) // Important: no _id for nested docs
export class Attachment {
  @Prop()
  url: string;

  @Prop()
  type: string;

  @Prop()
  name: string;

  @Prop()
  size?: number;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);