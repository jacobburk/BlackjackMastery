const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');
const { OpenAI } = require("openai");

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.CHAT_API_KEY });

router.post('/canned', async (req, res) => {
    try {
        // Extract values from the JSON body
        const { messageHistory } = req.body;

        // Validate the request body
        if (!messageHistory) {
            return res.status(400).json({ error: "messageHistory is required." });
        }

        // Add a system message to guide the AI's role as a Blackjack professional
        const updatedMessageHistory = [
            { 
                role: "system", 
                content: "You are a professional Blackjack card counter teaching basic strategy. Always give feedback on the hands based on standard Blackjack strategy. For example, if a user asks about whether to hit or stand, your advice should be based on the situation, such as the dealer's face-up card and the player's hand." 
            },
            ...messageHistory // Add the user's messages after the system context
        ];

        // Request to OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4", // Another model name: gpt-4
            messages: updatedMessageHistory,  // Use the updated message history with the system context
        });

        console.log('MSG: ' 
            + completion.choices[0].message.role + " "
            + completion.choices[0].message.content);

        // Add the AI's response to the messageHistory
        const finalMessageHistory = [
            ...updatedMessageHistory,
            completion.choices[0].message // Add the AI's response to the history
        ];

        return res.json({
            message: completion.choices[0].message,
            messageHistory: finalMessageHistory
        });

    } catch (error) {
        console.error("Error generating completion:", error);
        return res.status(500).json({ error: "An error occurred while generating the completion." });
    }
});

module.exports = router;
