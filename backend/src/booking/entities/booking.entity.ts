import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Unique, Index } from 'typeorm';
import { BookingLink } from '../../booking-link/entities/booking-link.entity';

@ObjectType()
@Entity()
@Unique(['bookingLink', 'date', 'startTime']) // Constraint to prevent double booking
@Index(['bookingLink', 'date']) // Index for fast lookups
export class Booking {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column({ type: 'date' })
    date: string;

    @Field()
    @Column({ type: 'time' })
    startTime: string;

    @Field()
    @Column({ type: 'time' })
    endTime: string;

    @Field()
    @Column()
    visitorName: string;

    @Field()
    @Column()
    visitorEmail: string;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => BookingLink)
    @ManyToOne(() => BookingLink, (bookingLink) => bookingLink.bookings, { onDelete: 'CASCADE' })
    bookingLink: BookingLink;
}
