"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var generative_ai_1 = require("@google/generative-ai");
var express_1 = require("express");
var prompts_js_1 = require("./prompts.js");
var node_js_1 = require("./defaults/node.js");
var react_js_1 = require("./defaults/react.js");
var cors_1 = require("cors");
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
var GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required');
}
var genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
app.post('/template', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var prompt_1, model, systemInstruction, fullPrompt, result, response, answer, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                prompt_1 = req.body.prompt;
                model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                systemInstruction = "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";
                fullPrompt = "".concat(systemInstruction, "\n\nUser request: ").concat(prompt_1);
                return [4 /*yield*/, model.generateContent(fullPrompt)];
            case 1:
                result = _a.sent();
                return [4 /*yield*/, result.response];
            case 2:
                response = _a.sent();
                answer = response.text().trim().toLowerCase();
                if (answer === "react") {
                    res.json({
                        prompts: [prompts_js_1.BASE_PROMPT, "Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n".concat(react_js_1.basePrompt, "\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n")],
                        uiPrompts: [react_js_1.basePrompt]
                    });
                    return [2 /*return*/];
                }
                if (answer === "node") {
                    res.json({
                        prompts: [prompts_js_1.BASE_PROMPT, "Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n".concat(node_js_1.basePrompt, "\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n")],
                        uiPrompts: [node_js_1.basePrompt]
                    });
                    return [2 /*return*/];
                }
                res.status(403).json({ message: "You cant access this" });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Error in /template:', error_1);
                res.status(500).json({ message: "Internal server error" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var messages, model, conversationHistory, systemPrompt, i, message, lastMessage, chat, result, response, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                messages = req.body.messages;
                // Validate input
                if (!messages || messages.length === 0) {
                    return [2 /*return*/, res.status(400).json({ message: "No messages provided" })];
                }
                model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                conversationHistory = [];
                systemPrompt = (0, prompts_js_1.getSystemPrompt)();
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
                for (i = 0; i < messages.length; i++) {
                    message = messages[i];
                    conversationHistory.push({
                        role: message.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: message.content }]
                    });
                }
                // Ensure we have at least one message
                if (conversationHistory.length === 0) {
                    return [2 /*return*/, res.status(400).json({ message: "No valid messages to process" })];
                }
                lastMessage = conversationHistory[conversationHistory.length - 1];
                // Type guard to ensure lastMessage exists and has the expected structure
                if (!lastMessage || !lastMessage.parts || !lastMessage.parts[0] || !lastMessage.parts[0].text) {
                    return [2 /*return*/, res.status(400).json({ message: "Invalid message format" })];
                }
                chat = model.startChat({
                    history: conversationHistory.slice(0, -1)
                });
                return [4 /*yield*/, chat.sendMessage(lastMessage.parts[0].text)];
            case 1:
                result = _a.sent();
                return [4 /*yield*/, result.response];
            case 2:
                response = _a.sent();
                res.json({
                    response: response.text()
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Error in /chat:', error_2);
                res.status(500).json({ message: "Internal server error" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.listen(3000, function () {
    console.log('Server is running on https://site-ai-ra3l.vercel.app');
});
