const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');
const { OpenAI } = require("openai");

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.CHAT_API_KEY });

async function openConversationAndGenerateUserStory(command, messageHistory) {
    const messageHistoryWithRole = [
        { 
            role: "system", 
            content: 'You are a professional Blackjack card counter, teaching people basic strategy and providing feedback based on the hands they are in. Always analyze the hands and provide feedback, ensuring you teach proper basic strategy. For example, if a user asks, guide them on whether to hit or stand based on the situation.' 
        },
        { 
            role: "user", 
            content: command 
        }
    ];

    const completion = await openai.chat.completions.create({
        model: "gpt-4", // Or "gpt-4" depending on the API key you have
        messages: messageHistoryWithRole,
    });

    const aiLog = [
        ...messageHistoryWithRole,
        completion.choices[0].message // Add AI's response
    ];

    const answer = completion.choices[0].message.content;

    return { answer, aiLog };
}

async function askAI(command, messageHistory) {
    const messageHistoryResult = [
        ...messageHistory,
        { role: "user", content: command }
    ];

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Or "gpt-4" depending on the API key you have
        messages: messageHistoryResult,
    });

    const aiLog = [
        ...messageHistoryResult,
        completion.choices[0].message // Add AI's response
    ];

    const answer = completion.choices[0].message.content;

    return { answer, aiLog };
}

router.post('/create', async (req, res) => {
    try {
        // Extract values from the JSON body
        const { feedback, appContext } = req.body;

        // Validate the request body
        if (!feedback) {
            return res.status(400).json({ error: "User feedback is required." });
        }
        if (!appContext) {
            return res.status(400).json({ error: "Application context is required." });
        }

        let messageHistory = [];

        // Open the conversation with Blackjack card counter instructions
        const { answer, aiLog } = await openConversationAndGenerateUserStory(feedback, messageHistory);

        // Respond with the AI's feedback and the conversation history
        return res.status(200).json({
            answer,
            aiLog,
            message: "AI has provided feedback on your Blackjack strategy."
        });

    } catch (error) {
        console.error("Error generating completion:", error);
        return res.status(500).json({ error: "An error occurred while generating the completion." });
    }
});

module.exports = router;
