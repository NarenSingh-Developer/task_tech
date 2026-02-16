import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { BookSlotInput } from './dto/book-slot.input';

@Resolver(() => Booking)
export class BookingResolver {
    constructor(private readonly bookingService: BookingService) { }

    @Mutation(() => Booking)
    async bookSlot(@Args('bookSlotInput') bookSlotInput: BookSlotInput) {
        return this.bookingService.bookSlot(bookSlotInput);
    }
}
