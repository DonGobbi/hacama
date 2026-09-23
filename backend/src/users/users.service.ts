import { ConflictException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
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
}
