import { prisma } from '../../config/database';
import { CreateMeetingInput, ListMeetingsQuery } from './meetings.schema';

export class MeetingsService {
  async createMeeting(input: CreateMeetingInput, userId: string) {
    return prisma.meeting.create({
      data: {
        title: input.title,
        participants: input.participants,
        meetingDate: new Date(input.meetingDate),
        userId,
        transcript: {
          create: input.transcript.map((entry) => ({
            timestamp: entry.timestamp,
            speaker: entry.speaker,
            text: entry.text,
          })),
        },
      },
      include: {
        transcript: { orderBy: { timestamp: 'asc' } },
        analysis: true,
        _count: { select: { actionItems: true } },
      },
    });
  }

  async getMeetingById(id: string, userId: string) {
    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
      include: {
        transcript: { orderBy: { timestamp: 'asc' } },
        analysis: true,
        actionItems: true,
      },
    });

    if (!meeting) {
      throw Object.assign(new Error('Meeting not found'), { code: 'NOT_FOUND', status: 404 });
    }

    return meeting;
  }

  async listMeetings(query: ListMeetingsQuery, userId: string) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { participants: { has: search } },
            ],
          }
        : {}),
    };

    const [total, meetings] = await Promise.all([
      prisma.meeting.count({ where }),
      prisma.meeting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { meetingDate: 'desc' },
        include: {
          transcript: { orderBy: { timestamp: 'asc' } },
          analysis: { select: { id: true, createdAt: true } },
          _count: { select: { actionItems: true } },
        },
      }),
    ]);

    return {
      meetings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}
