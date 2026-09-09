import Constants from 'expo-constants';
import { FaceRatingResult, RatingParams } from '../types/rating';
import { hashImageData, seededRandom } from '../utils/imageUtils';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash-vision-exp';

const DIMENSIONS = [
  { name: 'symmetry', label: '面部对称', desc: '左右脸平衡度' },
  { name: 'proportion', label: '五官比例', desc: '三庭五眼协调度' },
  { name: 'skin', label: '肤质状态', desc: '皮肤质感与均匀度' },
  { name: 'contour', label: '轮廓线条', desc: '下颌与颧骨线条' },
  { name: 'expression', label: '神态气质', desc: '表情自然与亲和力' },
] as const;

function getConfig() {
  const extra = Constants.expoConfig?.extra as
    | { openrouterApiKey?: string; aiModel?: string }
    | undefined;

  return {
    apiKey:
      process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ?? extra?.openrouterApiKey,
    model: process.env.EXPO_PUBLIC_AI_MODEL ?? extra?.aiModel ?? DEFAULT_MODEL,
  };
}

function clampScore(value: number): number {
  return Math.round(Math.min(10, Math.max(1, value)) * 10) / 10;
}

function buildLocalResult(seed: number): FaceRatingResult {
  const dimensions = DIMENSIONS.map((dim, i) => {
    const base = 5.5 + seededRandom(seed, i) * 3.5;
    const score = clampScore(base);
    return {
      name: dim.name,
      label: dim.label,
      score,
      description: `${dim.desc}：${score >= 8 ? '优秀' : score >= 6.5 ? '良好' : '一般'}`,
    };
  });

  const overallScore = clampScore(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length,
  );

  const summaries: Record<string, string> = {
    high: '整体面容协调，五官比例均衡，气质出众。',
    mid: '面容端正，整体观感良好，有提升空间。',
    low: '基础条件不错，注意光线与角度可更好展现。',
  };

  const tier = overallScore >= 8 ? 'high' : overallScore >= 6.5 ? 'mid' : 'low';

  const suggestions = [
    overallScore < 7 ? '尝试正面自然光拍摄，减少阴影干扰' : '保持当前拍摄角度，效果最佳',
    '适当护肤与充足睡眠有助于提升肤质评分',
    '微笑时面部线条更柔和，气质加分',
  ];

  return {
    overallScore,
    dimensions,
    summary: summaries[tier],
    suggestions,
    mode: 'local',
  };
}

async function rateWithOpenRouter(base64: string): Promise<FaceRatingResult> {
  const { apiKey, model } = getConfig();
  if (!apiKey) {
    throw new Error('未配置 OpenRouter API Key');
  }

  const prompt = `你是一位专业、客观、友善的面部美学分析师。请分析这张人脸照片，返回 JSON 格式（仅 JSON，无 markdown）：
{
  "overallScore": 1-10 的数字,
  "dimensions": [
    {"name":"symmetry","label":"面部对称","score":数字,"description":"简短说明"},
    {"name":"proportion","label":"五官比例","score":数字,"description":"简短说明"},
    {"name":"skin","label":"肤质状态","score":数字,"description":"简短说明"},
    {"name":"contour","label":"轮廓线条","score":数字,"description":"简短说明"},
    {"name":"expression","label":"神态气质","score":数字,"description":"简短说明"}
  ],
  "summary": "一句话总体评价",
  "suggestions": ["建议1","建议2","建议3"]
}
评分应客观公正，避免极端分数。若无法识别人脸，overallScore 设为 0 并在 summary 说明。`;

  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ai-face-rating.app',
      'X-Title': 'AI Face Rating',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI 分析失败: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 返回格式无效');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (parsed.overallScore === 0) {
    throw new Error(parsed.summary || '未检测到清晰人脸，请重新拍摄');
  }

  return {
    overallScore: clampScore(parsed.overallScore),
    dimensions: (parsed.dimensions ?? []).map(
      (d: { name: string; label: string; score: number; description: string }) => ({
        ...d,
        score: clampScore(d.score),
      }),
    ),
    summary: parsed.summary ?? '',
    suggestions: parsed.suggestions ?? [],
    mode: 'ai',
  };
}

/** 实时预览评分（本地快速计算，无网络延迟） */
export function rateFacePreview(base64: string): FaceRatingResult {
  return buildLocalResult(hashImageData(base64));
}

export async function rateFace(params: RatingParams): Promise<FaceRatingResult> {
  const { base64, imageUri } = params;
  const seedSource = base64 ?? imageUri;
  const seed = hashImageData(seedSource);

  const { apiKey } = getConfig();
  if (apiKey && base64) {
    try {
      return await rateWithOpenRouter(base64);
    } catch {
      // 降级到本地评分
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1500 + seededRandom(seed, 99) * 1000));

  return buildLocalResult(seed);
}

export function getRatingMode(): 'ai' | 'local' {
  return getConfig().apiKey ? 'ai' : 'local';
}

export function getModelName(): string {
  const { model } = getConfig();
  if (model.includes('deepseek')) return 'DeepSeek Vision';
  return model;
}
