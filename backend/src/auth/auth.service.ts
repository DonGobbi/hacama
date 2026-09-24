import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { UserDocument } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { JwtUser } from './current-user.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.active) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  login(user: UserDocument) {
    const payload: JwtUser = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  /**
   * Always resolves with the same message so the endpoint can't be used to
   * enumerate which emails have admin accounts.
   */
  async forgotPassword(email: string) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const user = await this.usersService.setResetToken(email, tokenHash, expires);
    if (user) {
      const webUrl = (this.config.get<string>('WEB_URL') ?? this.config.get<string>('CORS_ORIGIN', ''))
        .split(',')[0]
        .replace(/\/$/, '');
      const resetUrl = `${webUrl}/admin/reset-password?token=${token}`;
      this.mailService.sendPasswordReset(user.email, user.name, resetUrl);
    } else {
      this.logger.log(`Password reset requested for unknown/inactive email: ${email}`);
    }
    return { message: 'If that email has an admin account, a reset link is on its way.' };
  }
}
