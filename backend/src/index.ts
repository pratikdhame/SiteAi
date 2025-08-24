import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import express from 'express';
import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/template', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    
    // Create model instance for project type detection
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // System instruction for project type detection
    const systemInstruction = "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";
    
    // Create the full prompt with system instruction
    const fullPrompt = `${systemInstruction}\n\nUser request: ${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const answer = response.text().trim().toLowerCase();
    
    if (answer === "react") {
      res.json({
        prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
        uiPrompts: [reactBasePrompt]
      });
      return;
    }
    
    if (answer === "node") {
      res.json({
        prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
        uiPrompts: [nodeBasePrompt]
      });
      return;
    }
    
    res.status(403).json({ message: "You cant access this" });
  } catch (error) {
    console.error('Error in /template:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const messages = req.body.messages;
    
    // Validate input
    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "No messages provided" });
    }
    
    // Create model instance for chat
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // Convert messages to Gemini format
    // Gemini expects alternating user/model messages
    let conversationHistory = [];
    let systemPrompt = getSystemPrompt();
    
    // Add system prompt as the first user message if needed
    if (systemPrompt) {
      conversationHistory.push({
        role: "user",
        parts: [{ text: systemPrompt }]
      });
      conversationHistory.push({
        role: "model", 
        parts: [{ text: "I understand. I'll follow these instructions." }]
      });
    }
    
    // Convert and add the actual messages
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      conversationHistory.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      });
    }
    
    // Ensure we have at least one message
    if (conversationHistory.length === 0) {
      return res.status(400).json({ message: "No valid messages to process" });
    }
    
    // Get the last message
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    
    // Type guard to ensure lastMessage exists and has the expected structure
    if (!lastMessage || !lastMessage.parts || !lastMessage.parts[0] || !lastMessage.parts[0].text) {
      return res.status(400).json({ message: "Invalid message format" });
    }
    
    // Start chat with history (excluding the last message)
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1)
    });
    
    // Send the last message
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = await result.response;
    
    res.json({
      response: response.text()
    });
    
  } catch (error) {
    console.error('Error in /chat:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log('Server is running on https://site-ai-ra3l.vercel.app');
}); 