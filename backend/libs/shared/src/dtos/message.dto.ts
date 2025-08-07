import { Type } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min, Validate, ValidateIf, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'EitherContentOrAttachment', async: false })
export class EitherContentOrAttachmentConstraint implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments) {
    const dto = args.object as any;
    return Boolean(dto.content?.trim() || dto.attachment);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Message must have either non-empty content or an attachment.';
  }
}

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  attachment?: {
    url: string;
    type: string;
    name: string;
    size?: number;
  };

  @Validate(EitherContentOrAttachmentConstraint)
  _eitherContentOrAttachment: string;
}

export class MessageSeenDto {
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  lastMessageTimestamp: string
}

export class MessageDeleteDto {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;
}

export class FetchGroupMessagesDto {
  @IsString()
  groupId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ValidateIf(o => o.beforeTimestamp === undefined)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ValidateIf(o => o.page === undefined)
  @IsOptional()
  @IsISO8601()
  cursor?: string;
}

export class FetchGroupStatus {
  @IsString()
  groupId: string;
}

export class FetchUserStatus {
  @IsString()
  userId: string;
}
