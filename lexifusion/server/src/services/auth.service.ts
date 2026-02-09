import { PrismaClient } from '@prisma/client';
import { signToken, JwtPayload } from '../middleware/auth';

const prisma = new PrismaClient();

export interface RegisterResult {
  token: string;
  user: {
    id: string;
    deviceId: string;
    nickname: string | null;
    email: string | null;
  };
  isNew: boolean;
}

/**
 * Register or login by device ID.
 * If the device already exists, return existing user + new token.
 * If not, create a new anonymous user.
 */
export async function registerOrLogin(deviceId: string): Promise<RegisterResult> {
  let user = await prisma.user.findUnique({ where: { deviceId } });
  let isNew = false;

  if (!user) {
    user = await prisma.user.create({
      data: {
        deviceId,
        nickname: null,
        email: null,
      },
    });
    isNew = true;
  } else {
    // Update last active time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });
  }

  const payload: JwtPayload = { userId: user.id, deviceId: user.deviceId };
  const token = signToken(payload);

  return {
    token,
    user: {
      id: user.id,
      deviceId: user.deviceId,
      nickname: user.nickname,
      email: user.email,
    },
    isNew,
  };
}

/**
 * Bind an email to an existing user.
 */
export async function bindEmail(userId: string, email: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { email },
  });
}
