import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from "../src/prompts.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is required' });
    }

    const { messages } = req.body;
    
    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "No messages provided" });
    }
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    let conversationHistory = [];
    let systemPrompt = getSystemPrompt();
    
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
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      conversationHistory.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      });
    }
    
    if (conversationHistory.length === 0) {
      return res.status(400).json({ message: "No valid messages to process" });
    }
    
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    
    if (!lastMessage || !lastMessage.parts || !lastMessage.parts[0] || !lastMessage.parts[0].text) {
      return res.status(400).json({ message: "Invalid message format" });
    }
    
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1)
    });
    
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = await result.response;
    
    return res.json({
      response: response.text()
    });
    
  } catch (error) {
    console.error('Error in /chat:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
