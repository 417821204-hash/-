
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateSolution(prompt: string, context?: string) {
    const systemInstruction = `
      你是一个面向企业售前与解决方案场景的专业级AI系统。
      你的职责是生成标准化、可落地的项目方案。
      
      约束：
      1. 语言风格：正式、公文/政策化表达。避免口语，多使用指标化表述。
      2. 基于提供的背景信息生成，禁止虚构无法验证的内容。
      3. 显著提升表述深度，如将"提高效率"替换为"显著提升运行效率"。
    `;

    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `需求描述：${prompt}\n\n知识背景：${context || '通用企业数字化知识'}`,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  }

  async analyzePolicy(policyName: string) {
    const ai = this.getClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `请对以下政策文件进行深度解析：${policyName}。
        输出内容包括：
        1. 核心要点总结
        2. 对相关企业/项目的机会分析
        3. 建议在方案中引用的关键术语
        4. 落地实施的风险提示`,
        config: {
          systemInstruction: "你是一个资深的政策分析专家，擅长从晦涩的公文中提炼对业务有直接指导意义的干货。"
        }
      });
      return response.text;
    } catch (e) {
      return "政策解析服务暂时不可用，请稍后重试。";
    }
  }

  async evaluateSolution(content: string, standard?: string) {
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        scores: {
          type: Type.OBJECT,
          properties: {
            policy: { type: Type.NUMBER, description: '政策/标准匹配度 (0-100)' },
            requirement: { type: Type.NUMBER, description: '需求契合度 (0-100)' },
            product: { type: Type.NUMBER, description: '产品适配度 (0-100)' },
            logic: { type: Type.NUMBER, description: '逻辑完整度 (0-100)' },
            business: { type: Type.NUMBER, description: '商务价值度 (0-100)' }
          }
        },
        suggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dimension: { type: Type.STRING },
              advice: { type: Type.STRING },
              basis: { type: Type.STRING, description: '对应的标准原文或逻辑依据' }
            }
          }
        }
      }
    };

    const prompt = standard 
      ? `请将以下【待评审方案】与【编制标准】进行深度比对。找出方案中不符合标准、内容缺失或质量不佳的地方：\n\n【待评审方案】：\n${content}\n\n【编制标准】：\n${standard}`
      : `请评估以下方案内容并给出专业建议：\n\n${content}`;

    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any,
          systemInstruction: "你是一个专业的解决方案质量评审专家，擅长将方案与行业/政府编制标准进行精准比对。评分必须严苛且客观。",
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Evaluation Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
