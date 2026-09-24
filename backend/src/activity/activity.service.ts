import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtUser } from '../auth/current-user.decorator';
import { UserRole } from '../users/user.schema';
import { ActivityLog } from './activity.schema';

interface GeoResponse {
  status: string;
  city?: string;
  regionName?: string;
  country?: string;
}

/** Best-effort device label parsed from a User-Agent string. */
function parseDevice(ua: string): string {
  if (!ua) return 'Unknown device';
  let browser = 'Unknown browser';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome\//i.test(ua)) browser = 'Chrome';
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';

  let os = 'Unknown OS';
  if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  const mobile = /mobile|iphone|android/i.test(ua) ? 'Mobile' : 'Desktop';
  return `${browser} · ${os} · ${mobile}`;
}

function isPrivateIp(ip: string): boolean {
  return (
    !ip ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('169.254.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith('::ffff:127.') ||
    ip.startsWith('fc') ||
    ip.startsWith('fe80')
  );
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(@InjectModel(ActivityLog.name) private readonly logModel: Model<ActivityLog>) {}

  /** Record a login event, then resolve its geo location in the background. */
  async logLogin(user: JwtUser & { name?: string }, ip: string, userAgent: string) {
    const entry = await this.logModel.create({
      user: user.sub,
      name: user.name ?? user.email,
      email: user.email,
      role: user.role,
      action: 'login',
      ip,
      device: parseDevice(userAgent),
      location: '',
    });
    void this.resolveLocation(entry.id, ip);
    return entry;
  }

  private async resolveLocation(id: string, ip: string) {
    if (isPrivateIp(ip)) {
      await this.logModel.findByIdAndUpdate(id, { location: 'Local network' }).exec();
      return;
    }
    try {
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country`, {
        signal: AbortSignal.timeout(4000),
      });
      const geo = (await res.json()) as GeoResponse;
      const location =
        geo.status === 'success' ? [geo.city, geo.regionName, geo.country].filter(Boolean).join(', ') : '';
      if (location) await this.logModel.findByIdAndUpdate(id, { location }).exec();
    } catch (err) {
      this.logger.warn(`Geo lookup failed for ${ip}: ${(err as Error).message}`);
    }
  }

  /** Superadmins see all logins; regular admins see only their own. */
  findFor(user: JwtUser) {
    const filter = user.role === UserRole.SuperAdmin ? {} : { user: user.sub };
    return this.logModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  }
}
