import OpenAI from "openai";

import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({

    baseURL: "https://openrouter.ai/api/v1",

    apiKey: process.env.OPENROUTER_API_KEY
});


export const generateReply = async (
    message,
    model
) => {

    try {

        const completion =
            await client.chat.completions.create({

                model: model,

                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            });

        return completion
            .choices[0]
            .message
            .content;

    } catch (error) {

        console.error(error);

        return "Error generating reply";
    }
};