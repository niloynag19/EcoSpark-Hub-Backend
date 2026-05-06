import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Mock response for demonstration if no API key is provided
      return res.status(200).json({
        success: true,
        data: {
          reply: "I'm currently in demo mode as no Gemini API key was found. Once configured, I'll be able to help you with all your sustainability questions!",
        },
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const systemPrompt = `You are "EcoBot", the friendly and expert AI assistant for EcoSpark Hub. 
    EcoSpark Hub is a community platform for sharing and discovering sustainable innovations.
    
    Platform Features you can explain:
    1. Share Ideas: Users can submit eco-friendly ideas with problem statements and solutions.
    2. Community Engagement: Users can upvote/downvote ideas and participate in nested discussions.
    3. Monetization: Premium ideas can be locked behind a paywall and sold using Stripe.
    4. Dashboards: There are specialized dashboards for both regular users and admins.
    5. Moderation: All ideas are reviewed by admins before becoming public.

    Your goal is to help users understand sustainability concepts, provide feedback on their green ideas, and guide them through these platform features.
    Always be encouraging, professional, and passionate about the environment.
    Keep your responses concise and helpful.`;

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: {
        reply: text,
      },
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get response from AI',
      error: error.message,
    });
  }
};
