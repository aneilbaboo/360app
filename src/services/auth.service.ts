import prisma from '../utils/db';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair } from '../utils/jwt';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors';

export class AuthService {
  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async findOrCreateOAuthUser(
    email: string,
    oauthProvider: string,
    oauthId: string
  ) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { oauthProvider, oauthId },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          oauthProvider,
          oauthId,
        },
      });
    } else if (!user.oauthProvider || !user.oauthId) {
      // Link OAuth to existing email account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { oauthProvider, oauthId },
      });
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async refreshToken(userId: string, email: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    return tokens;
  }
}

export default new AuthService();
