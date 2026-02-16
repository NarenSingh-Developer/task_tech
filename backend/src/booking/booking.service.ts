import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookSlotInput } from './dto/book-slot.input';
import { BookingLinkService } from '../booking-link/booking-link.service';
import { addMinutes, format, parse } from 'date-fns';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
        @Inject(forwardRef(() => BookingLinkService))
        private bookingLinkService: BookingLinkService,
        private dataSource: DataSource,
    ) { }

    async bookSlot(bookSlotInput: BookSlotInput): Promise<Booking> {
        const { slug, date, startTime, visitorName, visitorEmail } = bookSlotInput;

        // Validate Slug
        const bookingLink = await this.bookingLinkService.findOneBySlug(slug);

        // Calculate End Time (30 mins duration)
        const startDate = parse(startTime, 'HH:mm:ss', new Date());
        const endDate = addMinutes(startDate, 30);
        const endTime = format(endDate, 'HH:mm:ss');

        // Transactional Booking
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction('SERIALIZABLE'); // Serializable for strict consistency

        try {
            // Check for existing booking in this transaction
            const existing = await queryRunner.manager.findOne(Booking, {
                where: {
                    bookingLink: { id: bookingLink.id },
                    date,
                    startTime,
                },
                lock: { mode: 'pessimistic_write' }, // Lock the row (effectively locking the slot index)
            });

            if (existing) {
                throw new ConflictException('Slot already booked');
            }

            const booking = queryRunner.manager.create(Booking, {
                date,
                startTime,
                endTime,
                visitorName,
                visitorEmail,
                bookingLink,
            });

            const savedBooking = await queryRunner.manager.save(booking);
            await queryRunner.commitTransaction();
            return savedBooking;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            if (err instanceof ConflictException) {
                throw err;
            }
            // Handle unique constraint violation just in case
            if (err.code === '23505') {
                throw new ConflictException('Slot already booked');
            }
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findByBookingLink(bookingLinkId: string, date: string): Promise<Booking[]> {
        return this.bookingRepository.find({
            where: { bookingLink: { id: bookingLinkId }, date },
        });
    }
}
