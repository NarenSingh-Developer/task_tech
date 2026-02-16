import { InputType, Field } from '@nestjs/graphql';
import { IsDateString, IsString, Matches } from 'class-validator';

@InputType()
export class CreateAvailabilityInput {
    @Field()
    @IsDateString()
    date: string;

    @Field()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:MM format' })
    startTime: string;

    @Field()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:MM format' })
    endTime: string;
}
