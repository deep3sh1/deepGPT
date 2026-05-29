import { Router } from "express";
import Thread from "../models/thread.js";
import OpenAI from "openai";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
});

router.post(
    '/chats',
    authMiddleware,
    async (req, res) => {

        const { threadId, message, model } = req.body || {};

        if (!threadId || !message) {
            return res.status(400).json({
                error: 'threadId and message are required'
            });
        }

        try {

            let selectedModel;

            switch (model) {
                case "gpt":
                    selectedModel = "openai/gpt-oss-20b";
                    break;
                case "gemini":
                    selectedModel = "google/gemma-3n-e4b-it";
                    break;
                case "claude":
                    selectedModel = "microsoft/phi-3-mini-128k-instruct";
                    break;
                case "grok":
                    selectedModel = "mistralai/mistral-small-3.1-24b-instruct";
                    break;
                case "deepseek":
                    selectedModel = "deepseek/deepseek-chat";
                    break;
                case "llama":
                    selectedModel = "meta-llama/llama-3.2-3b-instruct";
                    break;
                case "qwen":
                    selectedModel = "qwen/qwen2.5-7b-instruct";
                    break;
                default:
                    selectedModel = "openai/gpt-oss-20b";
            }

            const completion = await openai.chat.completions.create({
                model: selectedModel,
                max_tokens: 1000,
                messages: [{ role: "user", content: message }]
            });

            const aiResponse =
                completion?.choices?.[0]?.message?.content ||
                "No response generated";

            // SAVE
            if (req.userId) {

                let thread = await Thread.findOne({
                    threadId,
                    userId: req.userId
                });

                if (!thread) {
                    thread = new Thread({
                        userId: req.userId,
                        threadId,
                        title:
                            message.length > 35
                                ? message.substring(0, 35) + "..."
                                : message,
                        messages: [
                            { role: 'user', content: message },
                            { role: 'assistant', content: aiResponse }
                        ]
                    });
                } else {
                    thread.messages.push(
                        { role: 'user', content: message },
                        { role: 'assistant', content: aiResponse }
                    );
                }

                thread.updatedAt = new Date();
                await thread.save();
            }

            return res.json({ reply: aiResponse });

        } catch (error) {
            console.error("CHAT ERROR:", error);
            return res.status(500).json({
                error: error?.message || "Failed generating response"
            });
        }
    }
);

export default router;