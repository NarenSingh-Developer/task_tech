import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { AvailabilityService } from './availability.service';
import { Availability } from './entities/availability.entity';
import { CreateAvailabilityInput } from './dto/create-availability.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Availability)
@UseGuards(GqlAuthGuard)
export class AvailabilityResolver {
    constructor(private readonly availabilityService: AvailabilityService) { }

    @Mutation(() => Availability)
    createAvailability(
        @Args('createAvailabilityInput') createAvailabilityInput: CreateAvailabilityInput,
        @CurrentUser() user: User,
    ) {
        return this.availabilityService.create(createAvailabilityInput, user);
    }

    @Query(() => [Availability], { name: 'myAvailability' })
    getMyAvailability(@CurrentUser() user: User) {
        return this.availabilityService.findAll(user);
    }

    @Mutation(() => Boolean)
    removeAvailability(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: User) {
        return this.availabilityService.remove(id, user);
    }
}
