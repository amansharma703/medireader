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
            instructions: "You are a medical assistant AI trained to analyze patient lab reports. Your task is to summarize the key findings of the lab report, focusing on the patient's liver function, kidney function, lipid profile, iron levels, and thyroid function. Based on the results, provide a detailed health summary followed by a health score between 1 and 10, where 1 indicates poor health and 10 indicates excellent health. Liver Function: Analyze bilirubin, SGOT (AST), SGPT (ALT), alkaline phosphatase, and albumin levels. Comment on liver health based on any deviations from normal ranges. Kidney Function: Evaluate blood urea, creatinine, and electrolyte levels (sodium, potassium, chloride). Provide insights into kidney health. Lipid Profile: Review cholesterol levels (total cholesterol, LDL, HDL) and triglycerides to assess cardiovascular health risks. Iron Levels: Analyze serum iron, transferrin saturation, and TIBC to determine any iron metabolism issues. Thyroid Function: Examine T3, T4, and TSH levels to detect any thyroid dysfunction. After the summary, provide a health score between 1 and 10, based on how well the patient's results fit within the normal ranges and any potential risks or areas of concern.",
            model: "gpt-4-turbo",
        });

        // Return the assistant details in the response
        return NextResponse.json({ assistant }, { status: 201 });

    } catch (error) {
        console.error("Error creating assistant:", error);
        // Return an error response
        return NextResponse.json({ error: "Failed to create assistant" }, { status: 500 });
    }
}
