import { GoogleGenerativeAI } from '@google/generative-ai';
import { BASE_PROMPT } from "../src/prompts.js";
import { basePrompt as nodeBasePrompt } from "../src/defaults/node.js";
import { basePrompt as reactBasePrompt } from "../src/defaults/react.js";

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

    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const systemInstruction = "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";
    const fullPrompt = `${systemInstruction}\n\nUser request: ${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const answer = response.text().trim().toLowerCase();
    
    if (answer === "react") {
      return res.json({
        prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
        uiPrompts: [reactBasePrompt]
      });
    }
    
    if (answer === "node") {
      return res.json({
        prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
        uiPrompts: [nodeBasePrompt]
      });
    }
    
    return res.status(403).json({ message: "You cant access this" });
  } catch (error) {
    console.error('Error in /template:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}