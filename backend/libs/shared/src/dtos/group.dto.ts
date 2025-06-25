import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
    @IsNotEmpty()
    createdBy: string;

    @IsArray()
    @IsNotEmpty({ each: true })
    memberIds: string[];

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}

export class FetchGroupDto {
    @IsNotEmpty()
    _id: string;
}

export class GroupCreatedNotificationDto {
    @IsNotEmpty()
    groupId: string;

    @IsString()
    name: string | null;

    @IsString()
    createdBy: string;

    @IsArray()
    members: Array<{
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        profileUrl?: string;
    }>;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class UpdateGroupDto {
    @IsNotEmpty()
    groupId: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}