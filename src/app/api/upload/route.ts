import { NextResponse } from "next/server";
import OpenAI from "openai";
import path from "path";
import { writeFile } from "fs/promises";
import fs from "fs";

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Disable body parsing by Next.js to allow form data
export const config = {
    api: {
        bodyParser: false,
    },
};

// Upload file and save locally, then send to OpenAI
export const POST = async (req: Request) => {
    try {
        // Parse the form data
        const formData = await req.formData();
        const file = formData.get("file");

        // Check if the file exists
        if (!file) {
            return NextResponse.json({ error: "No files received." }, { status: 400 });
        }

        // Convert the file to a buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Replace spaces in the filename with underscores and define the save path
        const filename = file.name.replaceAll(" ", "_");
        const savePath = path.join(process.cwd(), "public/assets/" + filename);

        // Save the file to the public/assets directory
        await writeFile(savePath, buffer);

        // After saving the file locally, upload it to OpenAI
        const openAIFile = await openai.files.create({
            file: fs.createReadStream(savePath),
            purpose: "assistants",
        });

        // Respond with success
        return NextResponse.json({ message: "File uploaded successfully", openAIFile }, { status: 201 });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file to OpenAI" }, { status: 500 });
    }
};
