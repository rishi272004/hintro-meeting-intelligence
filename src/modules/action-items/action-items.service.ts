import { prisma } from '../../config/database';
import { CreateActionItemInput, ListActionItemsQuery, UpdateStatusInput } from './action-items.schema';

export class ActionItemsService {
  async createActionItem(input: CreateActionItemInput, userId: string) {
    const meeting = await prisma.meeting.findFirst({ where: { id: input.meetingId, userId } });
    if (!meeting) {
      throw Object.assign(new Error('Meeting not found'), { code: 'NOT_FOUND', status: 404 });
    }

    return prisma.actionItem.create({
      data: {
        task: input.task,
        assignee: input.assignee,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        citations: input.citations,
        meetingId: input.meetingId,
        userId,
        status: 'PENDING',
      },
    });
  }

  async updateStatus(id: string, input: UpdateStatusInput, userId: string) {
    const item = await prisma.actionItem.findFirst({ where: { id, userId } });
    if (!item) {
      throw Object.assign(new Error('Action item not found'), { code: 'NOT_FOUND', status: 404 });
    }

    return prisma.actionItem.update({
      where: { id },
      data: { status: input.status },
    });
  }

  async listActionItems(query: ListActionItemsQuery, userId: string) {
    const { page, limit, status, assignee, meetingId } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status ? { status } : {}),
      ...(assignee ? { assignee: { contains: assignee, mode: 'insensitive' as const } } : {}),
      ...(meetingId ? { meetingId } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.actionItem.count({ where }),
      prisma.actionItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { meeting: { select: { title: true, meetingDate: true } } },
      }),
    ]);

    return {
      actionItems: items,
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

  async getOverdueItems(userId: string) {
    const now = new Date();
    return prisma.actionItem.findMany({
      where: {
        userId,
        status: { not: 'COMPLETED' },
        dueDate: { lt: now, not: null },
      },
      include: {
        meeting: { select: { title: true, meetingDate: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
