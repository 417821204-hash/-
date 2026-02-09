
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
      2. **参考资源权威性**：所有技术参数、功能点、核心逻辑必须严格基于【参考源内容】。
      3. **缺失标注机制**：若所有参考资源中均不具备某章节所需的支撑素材，请在该章节正文处明确标注：“【待补充：当前关联资料未涵盖本章节所需业务逻辑，请补充原始文件】”。严禁凭空捏造技术指标或公司资质。
      4. **第三方专业语态**：
         - 采用正式、严谨、客观的政企公文风格。
         - 杜绝口语化表达，严禁出现“我们认为”、“我司”、“我们建议”、“本方案将”等主观第一人称。
         - 替换为：“本项目建设内容涵盖...”、“XX系统旨在支撑客户实现...”、“通过实施本项目，将有效解决...”等客观表述。
      5. **客户视角转换**：通篇以客户利益和项目成效为核心。侧重描述“该技术如何赋能客户业务”，而非“产品功能介绍”。
      6. **公文词汇偏好**：多使用“统筹、赋能、集约、耦合、闭环、顶层设计、降本增效、数字化底座、数据生产力、端到端”等专业语汇。
      7. **内容深度**：每个章节应逻辑严密，段落清晰，字数饱满。文字需具备厚重感，符合中国学校、政府机构对正式技术建议书的阅读习惯。

      输出要求：
      - 仅输出方案正文，各级章节标题前加 # 符号。
      - 严禁输出任何开场白（如“好的”、“已为您生成”）或结语。
    `;

    // 格式化结构化上下文，确保模型明确知道这些是“已解析的中间文本”
    const formattedContext = contextParts.length > 0 
      ? contextParts.map(p => `【已解析参考源：${p.name}】\n结构化文本内容：\n${p.content}`).join('\n\n---\n\n')
      : '【警告：当前无有效结构化参考资料】。请严格根据用户需求撰写，并对所有无资料支撑的章节标注“待补充”。';

    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
          【1. 强制执行模版架构】：
          ${prompt}

          【2. 结构化背景资源库（中间文本表示）】：
          ${formattedContext}
          
          【3. 用户生成需求补充】：
          请结合上述参考资源，针对用户的具体诉求进行深度撰写。若资源充足则详述，若资源缺失则标注。
          开始撰写方案正文。
        `,
        config: {
          systemInstruction,
          temperature: 0.2, // 降低随机性，确保生成内容的确定性与严谨性
        },
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  }

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
        contents: standard ? `比对基准：${standard}\n\n待评估方案：${content}` : content,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any,
          systemInstruction: "你是一个专业的解决方案质量评审专家，评分必须严苛且客观，直接针对不足之处给出修改建议。",
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) { return null; }
  }
}

export const geminiService = new GeminiService();
