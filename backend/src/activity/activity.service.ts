import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtUser } from '../auth/current-user.decorator';
import { UserRole } from '../users/user.schema';
import { ActivityLog } from './activity.schema';
import { SiteVisit } from './visit.schema';

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

  constructor(
    @InjectModel(ActivityLog.name) private readonly logModel: Model<ActivityLog>,
    @InjectModel(SiteVisit.name) private readonly visitModel: Model<SiteVisit>,
  ) {}

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
    void this.resolveLocation(this.logModel, entry.id, ip);
    return entry;
  }

  /**
   * Record a public website visit, deduplicated per IP within a 30 minute
   * window so refreshes don't flood the log.
   */
  async logVisit(ip: string, userAgent: string, path: string) {
    const device = parseDevice(userAgent);
    const windowStart = new Date(Date.now() - 30 * 60 * 1000);
    const recent = await this.visitModel
      .findOne({ ip, device, createdAt: { $gt: windowStart } })
      .select('_id')
      .lean();
    if (recent) return null;

    const entry = await this.visitModel.create({
      ip,
      device,
      path: path || '/',
      location: '',
    });
    void this.resolveLocation(this.visitModel, entry.id, ip);
    return entry;
  }

  private async resolveLocation(model: Model<{ location?: string }>, id: string, ip: string) {
    if (isPrivateIp(ip)) {
      await model.findByIdAndUpdate(id, { location: 'Local network' }).exec();
      return;
    }
    try {
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country`, {
        signal: AbortSignal.timeout(4000),
      });
      const geo = (await res.json()) as GeoResponse;
      const location =
        geo.status === 'success' ? [geo.city, geo.regionName, geo.country].filter(Boolean).join(', ') : '';
      if (location) await model.findByIdAndUpdate(id, { location }).exec();
    } catch (err) {
      this.logger.warn(`Geo lookup failed for ${ip}: ${(err as Error).message}`);
    }
  }

  /** Superadmins see all logins; regular admins see only their own. */
  findFor(user: JwtUser) {
    const filter = user.role === UserRole.SuperAdmin ? {} : { user: user.sub };
    return this.logModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  }

  findVisits() {
    return this.visitModel.find().sort({ createdAt: -1 }).limit(200).lean();
  }

  /** Aggregated site-visit stats for the admin dashboard. */
  async visitStats() {
    const DAY = 24 * 60 * 60 * 1000;
    const since = new Date(Date.now() - 13 * DAY);
    since.setHours(0, 0, 0, 0);
    const weekStart = new Date(Date.now() - 7 * DAY);

    const [daily, topPages, devices, totals, week] = await Promise.all([
      this.visitModel.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      ]),
      this.visitModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      this.visitModel.aggregate<{ _id: string; count: number }>([
        {
          $project: {
            kind: {
              $cond: [
                { $regexMatch: { input: '$device', regex: 'Mobile' } },
                'Mobile',
                { $cond: [{ $regexMatch: { input: '$device', regex: 'Desktop' } }, 'Desktop', 'Other'] },
              ],
            },
          },
        },
        { $group: { _id: '$kind', count: { $sum: 1 } } },
      ]),
      this.visitModel.aggregate<{ total: number; uniqueIps: number }>([
        { $group: { _id: null, total: { $sum: 1 }, ips: { $addToSet: '$ip' } } },
        { $project: { _id: 0, total: 1, uniqueIps: { $size: '$ips' } } },
      ]),
      this.visitModel.countDocuments({ createdAt: { $gte: weekStart } }),
    ]);

    const byDay = new Map(daily.map((d) => [d._id, d.count]));
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(since.getTime() + i * DAY);
      const key = date.toISOString().slice(0, 10);
      return { date: key, count: byDay.get(key) ?? 0 };
    });

    return {
      days,
      topPages: topPages.map((p) => ({ path: p._id || '/', count: p.count })),
      devices: devices.map((d) => ({ label: d._id, count: d.count })),
      total: totals[0]?.total ?? 0,
      uniqueIps: totals[0]?.uniqueIps ?? 0,
      week,
    };
  }
}
