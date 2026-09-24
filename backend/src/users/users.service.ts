import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './user.schema';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.userModel.estimatedDocumentCount();
    if (count > 0) return;

    const email = this.config.get<string>('SEED_ADMIN_EMAIL');
    const password = this.config.get<string>('SEED_ADMIN_PASSWORD');
    if (!email || !password) {
      this.logger.warn('No users exist and SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD are not set.');
      return;
    }

    await this.create({
      name: this.config.get<string>('SEED_ADMIN_NAME', 'Hacama Admin'),
      email,
      password,
      role: UserRole.SuperAdmin,
    });
    this.logger.log(`Seeded super admin account: ${email}`);
  }

  findAll() {
    return this.userModel.find().sort({ createdAt: -1 }).lean();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  }

  async create(dto: CreateUserDto) {
    const exists = await this.userModel.exists({ email: dto.email.toLowerCase() });
    if (exists) throw new ConflictException('A user with this email already exists');

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? '',
      role: dto.role ?? UserRole.Admin,
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    return this.findById(user.id);
  }

  async update(id: string, dto: UpdateUserDto) {
    const { password, ...rest } = dto;
    const update: Partial<User> = { ...rest };
    if (password) update.passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return { deleted: true };
  }

  async updateProfile(id: string, dto: { name?: string; phone?: string }) {
    const patch: Record<string, string> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.phone !== undefined) patch.phone = dto.phone;
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true })
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(id).select('+passwordHash').exec();
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { changed: true };
  }

  async setResetToken(email: string, tokenHash: string, expires: Date) {
    const user = await this.userModel
      .findOneAndUpdate(
        { email: email.toLowerCase(), active: true },
        { $set: { resetTokenHash: tokenHash, resetTokenExpires: expires } },
        { new: true },
      )
      .lean();
    return user;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user = await this.userModel
      .findOne({ resetTokenHash: tokenHash, resetTokenExpires: { $gt: new Date() } })
      .select('+resetTokenHash +resetTokenExpires +passwordHash')
      .exec();
    if (!user) throw new BadRequestException('Reset link is invalid or has expired');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    return { reset: true };
  }

  touchLastLogin(id: string) {
    return this.userModel.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } }).exec();
  }
}
