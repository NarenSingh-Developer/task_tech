import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../booking/entities/booking.entity';

@ObjectType()
@Entity()
export class BookingLink {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column({ unique: true })
    slug: string;

    @Field()
    @Column({ default: true })
    isActive: boolean;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.bookingLinks, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => Booking, (booking) => booking.bookingLink)
    bookings: Booking[];
}
