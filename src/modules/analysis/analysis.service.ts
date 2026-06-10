import Groq from 'groq-sdk';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { buildAnalysisPrompt } from './analysis.prompts';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const citationSchema = z.object({
  timestamp: z.string().regex(/^\d{2}:\d{2}$/),
});

const insightSchema = z.object({
  text: z.string().optional(),
  task: z.string().optional(),
  assignee: z.string().optional(),
  citations: z.array(citationSchema).default([]),
});

const analysisResultSchema = z.object({
  summary: z.array(insightSchema).default([]),
  actionItems: z.array(insightSchema).default([]),
  decisions: z.array(insightSchema).default([]),
  followUpSuggestions: z.array(insightSchema).default([]),
});

type AnalysisResult = z.infer<typeof analysisResultSchema>;

function normalizeInsights(items: AnalysisResult['summary'], validTimestamps: Set<string>) {
  return items
    .map((item) => ({
      ...item,
      citations: item.citations.filter((citation) => validTimestamps.has(citation.timestamp)),
    }))
    .filter((item) => item.citations.length > 0 && (item.text || item.task));
}

export class AnalysisService {
  async analyzeMeeting(meetingId: string, userId: string) {
    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, userId },
      include: { transcript: { orderBy: { timestamp: 'asc' } }, analysis: true },
    });

    if (!meeting) {
      throw Object.assign(new Error('Meeting not found'), { code: 'NOT_FOUND', status: 404 });
    }

    if (meeting.transcript.length === 0) {
      throw Object.assign(new Error('Meeting has no transcript to analyze'), {
        code: 'NO_TRANSCRIPT',
        status: 422,
      });
    }

    const prompt = buildAnalysisPrompt(meeting.transcript);
    logger.info('Starting AI analysis', { meetingId, transcriptLines: meeting.transcript.length });

    let rawContent: string;
    try {
      const completion = await groq.chat.completions.create({
        model: env.GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });
      rawContent = completion.choices[0].message.content || '{}';
    } catch (error) {
      logger.error('Groq API error', { meetingId, error });
      throw Object.assign(new Error('AI analysis failed. Please try again.'), {
        code: 'AI_ERROR',
        status: 502,
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      logger.error('AI returned invalid JSON', { meetingId, rawContent });
      throw Object.assign(new Error('AI returned invalid response format'), {
        code: 'AI_PARSE_ERROR',
        status: 502,
      });
    }

    const validationResult = analysisResultSchema.safeParse(parsed);
    if (!validationResult.success) {
      logger.error('AI response failed schema validation', {
        meetingId,
        errors: validationResult.error.flatten().fieldErrors,
      });
      throw Object.assign(new Error('AI returned invalid response format'), {
        code: 'AI_PARSE_ERROR',
        status: 502,
      });
    }

    const analysisResult = validationResult.data;
    const validTimestamps: Set<string> = new Set(
      meeting.transcript.map((entry: { timestamp: string }) => entry.timestamp)
    );

    const summary = normalizeInsights(analysisResult.summary, validTimestamps).map((item) => ({
      text: item.text || 'Summary item',
      citations: item.citations,
    }));

    const decisions = normalizeInsights(analysisResult.decisions, validTimestamps).map((item) => ({
      text: item.text || 'Decision item',
      citations: item.citations,
    }));

    const followUpSuggestions = normalizeInsights(analysisResult.followUpSuggestions, validTimestamps).map((item) => ({
      text: item.text || 'Follow-up item',
      citations: item.citations,
    }));

    const actionItems = normalizeInsights(analysisResult.actionItems, validTimestamps).map((item) => ({
      task: item.task || item.text || 'Unnamed task',
      assignee: item.assignee || 'Unassigned',
      citations: item.citations,
    }));

    const savedAnalysis = await prisma.meetingAnalysis.upsert({
      where: { meetingId },
      create: {
        meetingId,
        summary,
        decisions,
        followUpSuggestions,
        rawPrompt: prompt,
      },
      update: {
        summary,
        decisions,
        followUpSuggestions,
        rawPrompt: prompt,
      },
    });

    if (actionItems.length > 0) {
      await prisma.actionItem.createMany({
        data: actionItems.map((item) => ({
          task: item.task,
          assignee: item.assignee,
          citations: item.citations,
          meetingId,
          userId,
          status: 'PENDING',
        })),
        skipDuplicates: true,
      });
    }

    logger.info('AI analysis completed', {
      meetingId,
      summaryItems: summary.length,
      actionItems: actionItems.length,
      decisions: decisions.length,
      followUpSuggestions: followUpSuggestions.length,
    });

    return {
      analysis: savedAnalysis,
      generated: {
        summary,
        actionItems,
        decisions,
        followUpSuggestions,
      },
      actionItemsCreated: actionItems.length,
    };
  }
}
