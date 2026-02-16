import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingLink } from './entities/booking-link.entity';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';
import { AvailabilityService } from '../availability/availability.service';
import { BookingService } from '../booking/booking.service';
import { TimeSlot } from './dto/time-slot.dto';
import { addMinutes, format, parse, isBefore } from 'date-fns';

@Injectable()
export class BookingLinkService {
    constructor(
        @InjectRepository(BookingLink)
        private bookingLinkRepository: Repository<BookingLink>,
        private availabilityService: AvailabilityService,
        @Inject(forwardRef(() => BookingService))
        private bookingService: BookingService,
    ) { }

    async create(user: User): Promise<BookingLink> {
        const slug = crypto.randomBytes(4).toString('hex');
        const bookingLink = this.bookingLinkRepository.create({
            slug,
            user,
        });
        return this.bookingLinkRepository.save(bookingLink);
    }

    async findOneBySlug(slug: string): Promise<BookingLink> {
        const bookingLink = await this.bookingLinkRepository.findOne({
            where: { slug, isActive: true },
            relations: ['user'],
        });
        if (!bookingLink) {
            throw new NotFoundException('Booking link not found');
        }
        return bookingLink;
    }

    async findAll(user: User): Promise<BookingLink[]> {
        return this.bookingLinkRepository.find({
            where: { user: { id: user.id } },
            order: { createdAt: 'DESC' },
        });
    }

    async getAvailableSlots(slug: string, date: string): Promise<TimeSlot[]> {
        const bookingLink = await this.findOneBySlug(slug);
        const user = bookingLink.user;

        // Get availability for the date
        const availabilities = await this.availabilityService.findAll(user);
        console.log("availabilities");
        const dayAvailability = availabilities.filter((a) => a.date === date);
        console.log("dayAvailability");

        // Get existing bookings
        const bookings = await this.bookingService.findByBookingLink(bookingLink.id, date);
        const bookedSlots = new Set(bookings.map((b) => b.startTime));

        const slots: TimeSlot[] = [];

        for (const availability of dayAvailability) {
            let current = parse(availability.startTime, 'HH:mm:ss', new Date());
            const end = parse(availability.endTime, 'HH:mm:ss', new Date());

            while (isBefore(current, end)) {
                const next = addMinutes(current, 30);
                if (isBefore(next, end) || next.getTime() === end.getTime()) {
                    const startTimeStr = format(current, 'HH:mm:ss');
                    const endTimeStr = format(next, 'HH:mm:ss');

                    if (!bookedSlots.has(startTimeStr)) {
                        slots.push({
                            startTime: startTimeStr,
                            endTime: endTimeStr,
                            isAvailable: true,
                        });
                    }
                }
                current = next;
            }
        }

        return slots;
    }
}
