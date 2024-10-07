// file: /app/api/assistant/route.ts

import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { Configuration, OpenAIApi } from "openai-edge";
import OpenAI from "openai";

// Initialize OpenAI instance
// const config = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// API route for creating an OpenAI assistant
export async function POST(req: Request) {
    try {
        const assistant = await openai.beta.assistants.create({
            name: "MediReader",
            instructions: "You are a medical assistant AI trained to analyze patient lab reports. Your task is to summarize the key findings of the lab report. Based on the results, provide a detailed health summary followed by a health score between 1 and 10, where 1 indicates poor health and 10 indicates excellent health. The response should be react- markdown compatible. (!!! do not add this into the response that here is the react markdown formatted response).",
            model: "gpt-4-turbo",
            tools: [{ type: "file_search" }],
        });

        // Return the assistant details in the response
        return NextResponse.json({ assistant }, { status: 201 });

    } catch (error) {
        console.error("Error creating assistant:", error);
        // Return an error response
        return NextResponse.json({ error: "Failed to create assistant" }, { status: 500 });
    }
}
