import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class AuthResponse {
    @Field()
    accessToken: string;

    @Field(() => User)
    user: User;
}

@InputType()
export class LoginInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsString()
    password: string;
}

@InputType()
export class RegisterInput {
    @Field()
    @IsString()
    @MinLength(2)
    name: string;

    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsString()
    @MinLength(6)
    password: string;
}
