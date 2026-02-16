import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Availability } from '../../availability/entities/availability.entity';
import { BookingLink } from '../../booking-link/entities/booking-link.entity';

@ObjectType()
@Entity()
export class User {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Availability, (availability) => availability.user)
    availabilities: Availability[];

    @OneToMany(() => BookingLink, (bookingLink) => bookingLink.user)
    bookingLinks: BookingLink[];
}
