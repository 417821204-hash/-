
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateSolution(prompt: string, contextParts: { name: string, content: string }[]) {
    const systemInstruction = `
      你是一名服务于中国顶级咨询机构的【企业级解决方案专家】。
      你的任务是基于用户提供的【结构化参考资源】和【选定方案模板】，撰写一份极具专业深度、符合政企采购标准的项目建议书。

      严格执行准则：
      1. **模板绝对遵从**：必须完全按照用户给定的章节名称和顺序输出。禁止自行增加、合并或删除任何章节。每个章节必须产生实质性内容。
      2. **素材强相关性**：所有专业参数、功能描述、成功案例必须来源于【结构化参考资源】。
      3. **缺失标注机制**：若参考资源中完全不具备某章节所需的支撑素材，请在该章节正文处明确标注：“【待补充：参考资源中缺少相关业务支撑信息】”。严禁凭空捏造技术指标或资质。
      4. **第三方专业语态**：
         - 采用正式、严谨的政企公文风格。
         - 杜绝口语化表达，严禁出现“我们认为”、“我司打算”、“本方案将”等主观第一人称。
         - 替换为：“本项目建设内容涵盖...”、“XX系统旨在支撑客户实现...”、“通过实施本项目，将有效解决...”等客观表述。
      5. **客户视角转换**：通篇以客户利益和项目成效为核心。侧重描述“如何赋能客户业务”，而非“我方产品有多强”。
      6. **公文词汇偏好**：多使用“统筹、赋能、集约、耦合、闭环、顶层设计、降本增效、数字化底座、数据生产力”等专业语汇。
      7. **内容饱满度**：章节内容需逻辑严密，段落清晰。文字需具备一定的厚重感，符合中国学校、政府机构对正式文件的阅读习惯。

      输出要求：
      - 仅输出方案正文，各级章节标题前加 # 符号。
      - 严禁在开头或结尾出现“好的”、“以下是方案”等废话。
    `;

    // 将结构化内容转化为提示词
    const formattedContext = contextParts.length > 0 
      ? contextParts.map(p => `【参考源：${p.name}】\n内容摘要：${p.content}`).join('\n\n')
      : '暂无特定结构化参考资料。请根据行业通用标准撰写，但必须对不确定部分标注“待补充”。';

    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
          【选定模版章节结构】：
          ${prompt}

          【结构化背景资源库】：
          ${formattedContext}
          
          请以此为唯一依据，开始撰写方案正文。
        `,
        config: {
          systemInstruction,
          temperature: 0.25, // 极低随机性，确保严谨性
        },
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  }

  // 其他方法保持逻辑一致...
  async evaluateSolution(content: string, standard?: string) {
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        scores: {
          type: Type.OBJECT,
          properties: {
            policy: { type: Type.NUMBER },
            requirement: { type: Type.NUMBER },
            product: { type: Type.NUMBER },
            logic: { type: Type.NUMBER },
            business: { type: Type.NUMBER }
          }
        },
        suggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dimension: { type: Type.STRING },
              advice: { type: Type.STRING },
              basis: { type: Type.STRING }
            }
          }
        }
      }
    };

    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: standard ? `标准：${standard}\n内容：${content}` : content,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any,
          systemInstruction: "你是一个专业的解决方案质量评审专家，评分必须严苛且客观。",
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) { return null; }
  }
}

export const geminiService = new GeminiService();
