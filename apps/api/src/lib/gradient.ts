import OpenAI from 'openai';

export interface DailySummaryResult {
  summaryText: string;
  insightsJson: {
    positives: string[];
    concerns: string[];
    flags: string[];
    behavioral_patterns?: string[];
  };
  modelName: string;
}

export interface InsightsResult {
  summaryText: string;
  insightsJson: {
    patterns: string[];
    correlations: string[];
    suggestions: string[];
  };
  modelName: string;
}

// Initialize OpenAI-compatible client for Gradient AI
const getClient = () => {
  const apiKey = process.env.GRADIENT_API_KEY;
  const baseURL = process.env.GRADIENT_BASE_URL || 'https://inference.do-ai.run/v1';
  
  if (!apiKey || apiKey === 'dev-key') {
    return null; // Will use mock responses
  }
  
  return new OpenAI({
    baseURL,
    apiKey,
  });
};

const DEFAULT_MODEL = 'llama3.3-70b-instruct';

export const generateDailySummary = async (
  careProfileName: string,
  date: string,
  entries: any[]
): Promise<DailySummaryResult> => {
  const client = getClient();
  
  // Use mock response for development without API key
  if (!client) {
    return generateMockDailySummary(careProfileName, date, entries);
  }

  const entriesText = entries.map(e => {
    const time = new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `[${time}] ${e.type}: ${e.freeText}${e.moodScore ? ` (mood: ${e.moodScore}/5)` : ''}`;
  }).join('\n');

  const prompt = `You are a caregiver assistant analyzing daily observations for ${careProfileName}.

Here are the entries for ${date}:
${entriesText}

Please provide:
1. A brief 2-4 sentence summary of the day
2. A JSON object with:
   - positives: array of 1-3 positive observations or wins
   - concerns: array of 0-2 concerns to monitor
   - flags: array of any urgent items requiring attention (usually empty)
   - behavioral_patterns: array of any notable patterns observed

Respond in this exact format:
SUMMARY: [your summary here]
JSON: {"positives": [...], "concerns": [...], "flags": [...], "behavioral_patterns": [...]}`;

  try {
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Parse response
    const summaryMatch = content.match(/SUMMARY:\s*(.+?)(?=JSON:|$)/s);
    const jsonMatch = content.match(/JSON:\s*(\{.+\})/s);
    
    let insightsJson = { positives: [], concerns: [], flags: [], behavioral_patterns: [] };
    try {
      if (jsonMatch) {
        insightsJson = JSON.parse(jsonMatch[1]);
      }
    } catch (e) {
      console.error('Failed to parse insights JSON:', e);
    }

    return {
      summaryText: summaryMatch ? summaryMatch[1].trim() : content.slice(0, 300),
      insightsJson,
      modelName: DEFAULT_MODEL,
    };
  } catch (error) {
    console.error('Gradient AI error:', error);
    // Fallback to mock on error
    return generateMockDailySummary(careProfileName, date, entries);
  }
};

export const generateInsights = async (params: {
  careProfileName: string;
  periodType: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  entries: any[];
}): Promise<InsightsResult> => {
  const client = getClient();
  
  if (!client) {
    return generateMockInsights(params);
  }

  const { careProfileName, periodType, startDate, endDate, entries } = params;
  
  // Summarize entries by type
  const byType: Record<string, number> = {};
  const moodScores: number[] = [];
  const symptoms: string[] = [];
  
  entries.forEach(e => {
    byType[e.type] = (byType[e.type] || 0) + 1;
    if (e.moodScore) moodScores.push(e.moodScore);
    if (e.type === 'SYMPTOM' && e.structuredPayload?.symptom) {
      symptoms.push(e.structuredPayload.symptom);
    }
  });

  const avgMood = moodScores.length > 0 
    ? (moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1) 
    : 'N/A';

  const prompt = `You are a caregiver assistant analyzing ${periodType} patterns for ${careProfileName}.

Period: ${startDate} to ${endDate}
Total entries: ${entries.length}
Entry breakdown: ${Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(', ')}
Average mood score: ${avgMood}/5
Symptoms reported: ${symptoms.length > 0 ? symptoms.join(', ') : 'None'}

Please analyze these patterns and provide:
1. A 2-3 sentence summary of the ${periodType} patterns
2. A JSON object with:
   - patterns: array of 2-3 notable patterns observed
   - correlations: array of any correlations (e.g., "poor sleep correlates with lower mood")
   - suggestions: array of 1-2 suggestions to discuss with clinicians

Respond in this exact format:
SUMMARY: [your summary here]
JSON: {"patterns": [...], "correlations": [...], "suggestions": [...]}`;

  try {
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';
    
    const summaryMatch = content.match(/SUMMARY:\s*(.+?)(?=JSON:|$)/s);
    const jsonMatch = content.match(/JSON:\s*(\{.+\})/s);
    
    let insightsJson = { patterns: [], correlations: [], suggestions: [] };
    try {
      if (jsonMatch) {
        insightsJson = JSON.parse(jsonMatch[1]);
      }
    } catch (e) {
      console.error('Failed to parse insights JSON:', e);
    }

    return {
      summaryText: summaryMatch ? summaryMatch[1].trim() : content.slice(0, 300),
      insightsJson,
      modelName: DEFAULT_MODEL,
    };
  } catch (error) {
    console.error('Gradient AI error:', error);
    return generateMockInsights(params);
  }
};

// Mock implementations for development
function generateMockDailySummary(careProfileName: string, date: string, entries: any[]): DailySummaryResult {
  const moodScores = entries.filter(e => e.moodScore).map(e => e.moodScore);
  const avgMoodNum = moodScores.length > 0 
    ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
    : null;
  const avgMood = avgMoodNum !== null ? avgMoodNum.toFixed(1) : 'varied';

  return {
    summaryText: `On ${date}, ${careProfileName} had a ${avgMoodNum === null ? 'varied' : avgMoodNum >= 3.5 ? 'good' : 'challenging'} day with ${entries.length} logged activities. ` +
      `The day included regular meals and activities${entries.some(e => e.type === 'SYMPTOM') ? ', with some symptoms noted' : ''}.`,
    insightsJson: {
      positives: [
        entries.some(e => e.type === 'MEAL') ? 'Maintained regular meal schedule' : 'Engaged in activities',
        entries.some(e => e.type === 'ACTIVITY') ? 'Participated in planned activities' : 'Day well documented'
      ],
      concerns: entries.some(e => e.type === 'SYMPTOM') 
        ? ['Some symptoms were observed - continue monitoring'] 
        : [],
      flags: [],
      behavioral_patterns: ['Regular daily routine maintained']
    },
    modelName: 'mock-model'
  };
}

function generateMockInsights(params: { periodType: string; entries: any[] }): InsightsResult {
  const { periodType, entries } = params;
  
  return {
    summaryText: `Over this ${periodType} period, ${entries.length} entries were logged showing consistent caregiving documentation. ` +
      `Mood patterns appear stable with regular activity engagement.`,
    insightsJson: {
      patterns: [
        'Consistent daily logging of activities and meals',
        'Regular sleep patterns documented',
        periodType === 'weekly' ? 'Week shows stable routine' : 'Month shows good consistency'
      ],
      correlations: [
        'Better mood scores tend to follow good sleep entries',
        'Activity engagement correlates with positive mood'
      ],
      suggestions: [
        'Continue documenting sleep quality for pattern analysis',
        'Consider noting environmental factors during symptom episodes'
      ]
    },
    modelName: 'mock-model'
  };
}
