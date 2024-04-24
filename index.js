const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = `${process.env.GEMINI_API_KEY}`;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 1,
  topK: 0,
  topP: 0.95,
  maxOutputTokens: 8192,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

const chat = model.startChat({
  generationConfig,
  safetySettings,
  history: [
    {
      role: "user",
      parts: [{ text: "Hii" }],
    },
    {
      role: "model",
      parts: [{ text: "Hi! I am GEM, personal BOT of Subhranshu!" }],
    },
  ],
});

app.post("/api/message", async (req, res) => {
  const { message } = req.body.query;
  if (!message)
    return res.status(400).json({
      replies: [
        {
          message: "Please provide a message to send to the bot",
        },
      ],
    });
  try {
    const result = await chat.sendMessage(message);
    const response = result.response;
    res.status(200).json({
      replies: [
        {
          message: response.text(),
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      replies: [
        {
          message: "Sorry, I am unable to process your request at the moment",
        },
      ],
    });
  }
});

// ***

const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
