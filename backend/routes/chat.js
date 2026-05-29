import { Router } from "express";
import Thread from "../models/thread.js";
import OpenAI from "openai";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
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

        let selectedModel = "openai/gpt-oss-20b";

        switch (model) {
            case "gemini":
                selectedModel = "google/gemma-3n-e4b-it";
                break;
            case "claude":
                selectedModel = "microsoft/phi-3-mini-128k-instruct";
                break;
            case "deepseek":
                selectedModel = "deepseek/deepseek-chat";
                break;
            case "llama":
                selectedModel = "meta-llama/llama-3.2-3b-instruct";
                break;
        }

        const completion = await openai.chat.completions.create({
            model: selectedModel,
            messages: [{ role: "user", content: message }],
            max_tokens: 1000
        });

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