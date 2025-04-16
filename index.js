import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup OpenAI-compatible Gemini API
const openai = new OpenAI({
    apiKey: "AIzaSyBkQHM69kQlYv0EfCbAkMzK8JURlxDk6-A",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

app.get("/parse-command", async (req, res) => {
    const command = req.query.command;

    if (!command || typeof command !== "string") {
        return res.status(400).json({ error: 'Missing or invalid "command" query parameter' });
    }

    const prompt = `
You are a command parser. If the input is a WhatsApp message instruction like:
"send hello how are you to abhisek on whatsapp", extract:

- event: "whatsapp"
- name: the person's name
- message: the message to send

Respond ONLY as JSON (no markdown, no backticks). Example:
{"event":"whatsapp", "name":"abhisek", "message":"hello how are you"}

If it's not a WhatsApp command, respond:
{"event":"unknown"}

Input: "${command}"
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ]
        });

        let text = response.choices[0].message.content.trim();
        text = text.replace(/```json|```/g, '').trim(); // Clean if markdown wrapped

        const parsed = JSON.parse(text);
        res.json(parsed);
    } catch (err) {
        console.error("Gemini Error:", err.message);
        res.status(500).json({
            error: "Failed to process command",
            details: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
