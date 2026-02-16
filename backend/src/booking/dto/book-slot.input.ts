import { InputType, Field } from '@nestjs/graphql';
import { IsDateString, IsEmail, IsString, IsUUID, Matches } from 'class-validator';

@InputType()
export class BookSlotInput {
    @Field()
    @IsString()
    slug: string;

    @Field()
    @IsDateString()
    date: string;

    @Field()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    startTime: string;

    @Field()
    @IsString()
    visitorName: string;

    @Field()
    @IsEmail()
    visitorEmail: string;
}
