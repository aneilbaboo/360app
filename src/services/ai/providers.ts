import axios from 'axios';
import { AIProviderConfig, FeedbackSynthesisResult } from '../../types';

export interface AIProvider {
  synthesizeFeedback(
    responses: Array<{ questionId: string; question: string; answer: string }>
  ): Promise<FeedbackSynthesisResult>;
}

export class ClaudeProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-sonnet-20240229') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async synthesizeFeedback(
    responses: Array<{ questionId: string; question: string; answer: string }>
  ): Promise<FeedbackSynthesisResult> {
    const prompt = this.buildSynthesisPrompt(responses);

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        timeout: 30000,
      }
    );

    return this.parseAIResponse(response.data.content[0].text);
  }

  private buildSynthesisPrompt(
    responses: Array<{ questionId: string; question: string; answer: string }>
  ): string {
    const responsesText = responses
      .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
      .join('\n\n');

    return `You are an expert at analyzing 360-degree feedback. You have been provided with anonymized responses from multiple reviewers. Your task is to:

1. Remove all personally identifying information from the feedback
2. Identify common themes and patterns
3. Perform sentiment analysis
4. Categorize feedback into skill areas
5. Extract strengths and areas for improvement
6. Generate actionable recommendations

Feedback Responses:
${responsesText}

Please provide your analysis in the following JSON format:
{
  "anonymizedSummary": "A comprehensive summary of the feedback with all identifying information removed",
  "themes": {
    "theme_name": {
      "frequency": number_of_mentions,
      "examples": ["example1", "example2"]
    }
  },
  "sentimentAnalysis": {
    "positive": percentage,
    "negative": percentage,
    "neutral": percentage,
    "distribution": {
      "very_positive": count,
      "positive": count,
      "neutral": count,
      "negative": count,
      "very_negative": count
    }
  },
  "skillCategories": {
    "leadership": ["point1", "point2"],
    "communication": ["point1", "point2"],
    "technical": ["point1", "point2"],
    "collaboration": ["point1", "point2"],
    "other": ["point1", "point2"]
  },
  "actionableItems": [
    {
      "category": "category_name",
      "item": "specific action to take",
      "priority": "high|medium|low"
    }
  ],
  "strengthsVsImprovements": {
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"]
  }
}

Respond with ONLY the JSON object, no additional text.`;
  }

  private parseAIResponse(responseText: string): FeedbackSynthesisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as FeedbackSynthesisResult;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }
}

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4-turbo') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async synthesizeFeedback(
    responses: Array<{ questionId: string; question: string; answer: string }>
  ): Promise<FeedbackSynthesisResult> {
    const prompt = this.buildSynthesisPrompt(responses);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at analyzing 360-degree feedback and providing anonymized insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4096,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 30000,
      }
    );

    return JSON.parse(response.data.choices[0].message.content) as FeedbackSynthesisResult;
  }

  private buildSynthesisPrompt(
    responses: Array<{ questionId: string; question: string; answer: string }>
  ): string {
    const responsesText = responses
      .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
      .join('\n\n');

    return `You are an expert at analyzing 360-degree feedback. Analyze the following anonymized responses and provide a comprehensive analysis in JSON format.

Feedback Responses:
${responsesText}

Provide your analysis in the following JSON structure:
{
  "anonymizedSummary": "A comprehensive summary with all identifying information removed",
  "themes": {
    "theme_name": {
      "frequency": number_of_mentions,
      "examples": ["example1", "example2"]
    }
  },
  "sentimentAnalysis": {
    "positive": percentage,
    "negative": percentage,
    "neutral": percentage,
    "distribution": {
      "very_positive": count,
      "positive": count,
      "neutral": count,
      "negative": count,
      "very_negative": count
    }
  },
  "skillCategories": {
    "leadership": ["point1", "point2"],
    "communication": ["point1", "point2"],
    "technical": ["point1", "point2"],
    "collaboration": ["point1", "point2"],
    "other": ["point1", "point2"]
  },
  "actionableItems": [
    {
      "category": "category_name",
      "item": "specific action to take",
      "priority": "high|medium|low"
    }
  ],
  "strengthsVsImprovements": {
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"]
  }
}`;
  }
}

export class PerplexityProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'llama-3.1-sonar-large-128k-online') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async synthesizeFeedback(
    responses: Array<{ questionId: string; question: string; answer: string }>
  ): Promise<FeedbackSynthesisResult> {
    const prompt = this.buildSynthesisPrompt(responses);

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at analyzing 360-degree feedback and providing anonymized insights. Respond only with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 30000,
      }
    );

    const responseText = response.data.choices[0].message.content;
    return this.parseAIResponse(responseText);
  }

  private buildSynthesisPrompt(
    responses: Array<{ questionId: string; question: string; answer: string }>
  ): string {
    const responsesText = responses
      .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
      .join('\n\n');

    return `Analyze these 360-degree feedback responses and provide a JSON analysis.

Feedback:
${responsesText}

JSON format required:
{
  "anonymizedSummary": "summary text",
  "themes": {"theme_name": {"frequency": 0, "examples": []}},
  "sentimentAnalysis": {
    "positive": 0,
    "negative": 0,
    "neutral": 0,
    "distribution": {"very_positive": 0, "positive": 0, "neutral": 0, "negative": 0, "very_negative": 0}
  },
  "skillCategories": {
    "leadership": [],
    "communication": [],
    "technical": [],
    "collaboration": [],
    "other": []
  },
  "actionableItems": [{"category": "", "item": "", "priority": ""}],
  "strengthsVsImprovements": {"strengths": [], "improvements": []}
}

Respond with ONLY valid JSON.`;
  }

  private parseAIResponse(responseText: string): FeedbackSynthesisResult {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as FeedbackSynthesisResult;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }
}

export function createAIProvider(
  provider: 'claude' | 'openai' | 'perplexity'
): AIProvider {
  switch (provider) {
    case 'claude':
      const claudeKey = process.env.ANTHROPIC_API_KEY;
      if (!claudeKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }
      return new ClaudeProvider(claudeKey);

    case 'openai':
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      return new OpenAIProvider(openaiKey);

    case 'perplexity':
      const perplexityKey = process.env.PERPLEXITY_API_KEY;
      if (!perplexityKey) {
        throw new Error('PERPLEXITY_API_KEY not configured');
      }
      return new PerplexityProvider(perplexityKey);

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
