import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class TimeSlot {
    @Field()
    startTime: string;

    @Field()
    endTime: string;

    @Field()
    isAvailable: boolean;
}
