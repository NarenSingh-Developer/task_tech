import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginInput, RegisterInput, AuthResponse } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<User | null> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return user;
        }
        return null;
    }

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        const user = await this.validateUser(loginInput.email, loginInput.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user,
        };
    }

    async register(registerInput: RegisterInput): Promise<AuthResponse> {
        const user = await this.usersService.create(
            registerInput.name,
            registerInput.email,
            registerInput.password,
        );
        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user,
        };
    }
}
