import { Router } from "express";
import Thread from "../models/thread.js";
import OpenAI from "openai";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "dummy_key"
});


// ============================
// CREATE THREAD
// ============================
router.post('/', authMiddleware, async (req, res) => {
    try {

        if (!req.userId) {
            return res.status(401).json({ error: "Login required" });
        }

        const newThread = new Thread({
            userId: req.userId,
            threadId: Date.now().toString(), // ✅ FIX: real unique id
            title: "New conversation",
            messages: []
        });

        const saved = await newThread.save();

        res.json({ thread: saved });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});


// ============================
// GET THREADS (FIXED SAFE)
// ============================
router.get('/threads', authMiddleware, async (req, res) => {
    try {

        if (!req.userId) {
            return res.json([]);
        }

        const threads = await Thread.find({
            userId: req.userId
        }).sort({ createdAt: -1 });

        res.json(threads);

    } catch (error) {
        console.error(error);
        res.status(500).json([]);
    }
});


// ============================
// GET SINGLE THREAD
// ============================
router.get('/threads/:threadId', authMiddleware, async (req, res) => {
    try {

        const thread = await Thread.findOne({
            threadId: req.params.threadId,
            userId: req.userId
        });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.json(thread.messages);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch thread" });
    }
});


// ============================
// DELETE THREAD
// ============================
router.delete('/threads/:threadId', authMiddleware, async (req, res) => {
    try {

        const deleted = await Thread.findOneAndDelete({
            threadId: req.params.threadId,
            userId: req.userId
        });

        if (!deleted) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.json({ message: "Deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Delete failed" });
    }
});


// ============================
// CHAT GENERATION
// ============================
router.post("/chats", authMiddleware, async (req, res) => {

    const { threadId, message, model } = req.body || {};

    if (!threadId || !message) {
        return res.status(400).json({
            error: "threadId and message required"
        });
    }

    try {

        let selectedModel = "openai/gpt-4o-mini";

        switch (model) {
            case "gpt":
                selectedModel = "openai/gpt-4o-mini";
                break;
            case "gemini":
                selectedModel = "google/gemini-2.5-flash";
                break;
            case "claude":
                selectedModel = "anthropic/claude-haiku-4.5";
                break;
            case "grok":
                selectedModel = "x-ai/grok-4.5";
                break;
            case "deepseek":
                selectedModel = "deepseek/deepseek-chat";
                break;
            case "llama":
                selectedModel = "meta-llama/llama-3.3-70b-instruct";
                break;
            case "qwen":
                selectedModel = "qwen/qwen-2.5-72b-instruct";
                break;
            default:
                selectedModel = "openai/gpt-4o-mini";
        }

        let completion;
        try {
            completion = await openai.chat.completions.create({
                model: selectedModel,
                messages: [{ role: "user", content: message }],
                max_tokens: 1000
            });
        } catch (modelErr) {
            console.warn(`Model ${selectedModel} failed (${modelErr?.message}), falling back to openai/gpt-4o-mini...`);
            completion = await openai.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: message }],
                max_tokens: 1000
            });
        }

        const aiResponse =
            completion?.choices?.[0]?.message?.content ||
            "No response";

        // SAVE THREAD (ONLY IF LOGGED IN)
        if (req.userId) {

            let thread = await Thread.findOne({
                threadId,
                userId: req.userId
            });

            if (!thread) {
                thread = new Thread({
                    userId: req.userId,   // 🔥 MUST BE HERE
                    threadId,
                    title: message.slice(0, 35),
                    messages: []
                });
            }

            thread.messages.push(
                { role: "user", content: message },
                { role: "assistant", content: aiResponse }
            );

            thread.updatedAt = new Date();

            await thread.save();
        }

        res.json({ reply: aiResponse });

    } catch (error) {
        console.error("CHAT ERROR:", error);
        res.status(500).json({
            error: "AI generation failed"
        });
    }
});

export default router;