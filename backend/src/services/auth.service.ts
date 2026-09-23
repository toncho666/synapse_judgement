import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    logger.info('AuthService: Register attempt', { email: input.email });

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      logger.warn('AuthService: User already exists', { email: input.email });
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const referralCode = input.name.slice(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        avatar: '🚀',
        plan: 'FREE',
        credits: 50,
        referralCode,
      },
    });

    // Create welcome bonus transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'WELCOME_BONUS',
        amount: 50,
        description: 'Welcome bonus on signup',
      },
    });

    logger.info('AuthService: User registered successfully', { userId: user.id, email: user.email });

    return this.generateToken(user);
  }

  async login(input: LoginInput) {
    logger.info('AuthService: Login attempt', { email: input.email });

    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      logger.warn('AuthService: User not found', { email: input.email });
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      logger.warn('AuthService: Invalid password', { email: input.email });
      throw new Error('Invalid credentials');
    }

    logger.info('AuthService: Login successful', { userId: user.id });

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as string }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        referralCode: user.referralCode,
      },
    };
  }
}

export const authService = new AuthService();
