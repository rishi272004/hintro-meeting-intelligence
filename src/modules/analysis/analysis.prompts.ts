export function buildAnalysisPrompt(transcript: Array<{ timestamp: string; speaker: string; text: string }>): string {
  const transcriptText = transcript
    .map((entry) => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
    .join('\n');

  return `You are a meeting analysis AI. Your job is to analyze the following meeting transcript and extract structured insights.

CRITICAL RULES — YOU MUST FOLLOW THESE EXACTLY:
1. ONLY use information that is EXPLICITLY stated in the transcript. Do NOT invent, infer, or add any information not present in the text.
2. Every item you generate MUST include at least one citation referencing the exact timestamp(s) from the transcript.
3. If the transcript does not contain enough information for a category, return an empty array for that category.
4. Do NOT invent attendees, action items, decisions, or outcomes not explicitly mentioned.
5. Citations must use the exact timestamp format shown in the transcript (e.g., "00:10").

TRANSCRIPT:
${transcriptText}

Return ONLY valid JSON (no markdown, no explanation, no code blocks) in this exact structure:
{
  "summary": [
    {
      "text": "Brief summary sentence derived directly from transcript",
      "citations": [{"timestamp": "MM:SS"}]
    }
  ],
  "actionItems": [
    {
      "task": "Specific task mentioned",
      "assignee": "Person assigned (use name from transcript, or 'Unassigned' if not specified)",
      "citations": [{"timestamp": "MM:SS"}]
    }
  ],
  "decisions": [
    {
      "text": "Decision that was made, as stated in transcript",
      "citations": [{"timestamp": "MM:SS"}]
    }
  ],
  "followUpSuggestions": [
    {
      "text": "Follow-up suggestion based on what was discussed",
      "citations": [{"timestamp": "MM:SS"}]
    }
  ]
}`;
}
