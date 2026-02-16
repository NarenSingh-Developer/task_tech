import { BadRequestException, Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { CreateAvailabilityInput } from './dto/create-availability.input';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AvailabilityService {
    constructor(
        @InjectRepository(Availability)
        private availabilityRepository: Repository<Availability>,
    ) { }

    async create(createAvailabilityInput: CreateAvailabilityInput, user: User): Promise<Availability> {
        const { date, startTime, endTime } = createAvailabilityInput;
        if (endTime <= startTime) {
            throw new BadRequestException('End time must be after start time');
        }

        const today = new Date().toISOString().split('T')[0];
        if (date < today) {
            throw new BadRequestException('Date must be in the future');
        }

        // Check for overlaps
        const existing = await this.availabilityRepository.createQueryBuilder('availability')
            .where('availability.userId = :userId', { userId: user.id })
            .andWhere('availability.date = :date', { date })
            .andWhere(
                '(availability.startTime < :endTime AND availability.endTime > :startTime)',
                { startTime, endTime }
            )
            .getOne();

        if (existing) {
            throw new ConflictException('Availability overlaps with an existing slot');
        }


        const availability = this.availabilityRepository.create({
            ...createAvailabilityInput,
            user,
        });

        console.log("availability save");
        return this.availabilityRepository.save(availability);
    }

    async findAll(user: User): Promise<Availability[]> {
        return this.availabilityRepository.find({
            where: { user: { id: user.id } },
            order: { date: 'ASC', startTime: 'ASC' },
        });
    }

    async remove(id: string, user: User): Promise<boolean> {
        const result = await this.availabilityRepository.delete({ id, user: { id: user.id } });
        return (result.affected ?? 0) > 0;
    }
}
