const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/chat', async (req, res) => {
  try {
    const { history, prompt } = req.body;
    
    // Check if API key exists in environment
    if (!process.env.GEMINI_API_KEY) {
      return res.status(401).json({ 
        error: "GEMINI_API_KEY is missing from backend/.env! Please add your free Google AI Studio key to use AskBro." 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use gemini-2.0-flash — fast and available on the free tier
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "You are AskBro, an elite and enthusiastic cinema expert chatbot for the FilmyBro app. " +
        "You recommend movies, drops trivia, give spoiler-free synopses, and act like a cinephile 'bro'. " +
        "Keep responses punchy, highly engaging, very concise, and format them nicely in Markdown. " +
        "Use cinematic emojis liberally. If asked about TV shows, redirect to movies slightly but answer anyway.",
    });

    // Gemini requires alternating history beginning strictly with `user`
    const cleanHistory = [];
    let expectedRole = 'user';

    for (const msg of history) {
      if (msg.role === 'error') continue; // Don't feed frontend errors into LLM context
      
      const mappedRole = msg.role === 'bot' ? 'model' : 'user';
      
      // Enforce strict alternation padding
      if (mappedRole === expectedRole) {
        cleanHistory.push({ role: mappedRole, parts: [{ text: msg.text }] });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }

    const chat = model.startChat({ history: cleanHistory });

    const result = await chat.sendMessage([{ text: prompt }]);
    const responseText = result.response.text();

    res.json({ message: responseText });
  } catch (err) {
    console.error("AI Error:", err.message);
    const isQuota = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('Too Many Requests');
    const isInvalidKey = err.message?.includes('400') || err.message?.includes('API_KEY_INVALID') || err.message?.includes('401');
    const errorMsg = isQuota
      ? "AskBro hit the free API quota limit for today. 😔 Get a new Gemini API key at ai.google.dev and update backend/.env"
      : isInvalidKey
        ? "AskBro's API key is invalid. Please update GEMINI_API_KEY in backend/.env"
        : "AskBro's cinematic brain experienced a glitch. The API Key might be invalid or overloaded.";
    res.status(500).json({ error: errorMsg });
  }
});

module.exports = router;
