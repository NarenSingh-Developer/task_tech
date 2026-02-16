import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingLinkService } from './booking-link.service';
import { BookingLinkResolver } from './booking-link.resolver';
import { BookingLink } from './entities/booking-link.entity';
import { AuthModule } from '../auth/auth.module';
import { AvailabilityModule } from '../availability/availability.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingLink]),
    AuthModule,
    AvailabilityModule,
    forwardRef(() => BookingModule),
  ],
  providers: [BookingLinkService, BookingLinkResolver],
  exports: [BookingLinkService],
})
export class BookingLinkModule { }
