import { z } from "zod";

export const publishSchema = z.object({
  authorId: z.string().min(1).max(200),
  authorName: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  category: z.string().max(50).optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  prompt: z.string().min(1).max(50000),
});

export const eventSchema = z.object({
  type: z.string().min(1).max(50),
  templateId: z.string().max(200).optional(),
  userId: z.string().max(200).optional(),
  userName: z.string().max(100).optional(),
  lang: z.string().max(10).optional(),
  timestamp: z.number().optional(),
});

export const generateSchema = z.object({
  model: z.string().max(100).optional(),
  messages: z.array(z.object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string().min(1).max(100000),
  })).min(1).max(50),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(100000).optional(),
  stream: z.boolean().optional(),
});

export const feedbackSchema = z.object({
  userId: z.string().min(1).max(200),
  value: z.enum(["up", "down"]),
});

export const commentSchema = z.object({
  userId: z.string().min(1).max(200),
  userName: z.string().max(100).optional(),
  content: z.string().min(1).max(1000),
});

