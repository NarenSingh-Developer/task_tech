import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { Booking } from './entities/booking.entity';
import { BookingLinkModule } from '../booking-link/booking-link.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    forwardRef(() => BookingLinkModule)
  ],
  providers: [BookingService, BookingResolver],
  exports: [BookingService],
})
export class BookingModule { }
