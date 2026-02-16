import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BookingLinkService } from './booking-link.service';
import { BookingLink } from './entities/booking-link.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { TimeSlot } from './dto/time-slot.dto';

@Resolver(() => BookingLink)
export class BookingLinkResolver {
    constructor(private readonly bookingLinkService: BookingLinkService) { }

    @Mutation(() => BookingLink)
    @UseGuards(GqlAuthGuard)
    generateBookingLink(@CurrentUser() user: User) {
        return this.bookingLinkService.create(user);
    }

    @Query(() => [BookingLink], { name: 'myBookingLinks' })
    @UseGuards(GqlAuthGuard)
    getMyBookingLinks(@CurrentUser() user: User) {
        return this.bookingLinkService.findAll(user);
    }

    @Query(() => BookingLink, { name: 'bookingLink' })
    getBookingLink(@Args('slug') slug: string) {
        return this.bookingLinkService.findOneBySlug(slug);
    }

    @Query(() => [TimeSlot], { name: 'availableSlots' })
    getAvailableSlots(
        @Args('slug') slug: string,
        @Args('date') date: string,
    ) {
        return this.bookingLinkService.getAvailableSlots(slug, date);
    }
}
