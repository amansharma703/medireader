import { NextResponse } from "next/server";
import OpenAI from "openai";
import path from "path";
import { writeFile } from "fs/promises";
import fs from "fs";

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// API handler
export const POST = async (req: Request) => {
    try {
        // Parse the form data manually (since body parsing is disabled)
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
        const savePath = path.join(process.cwd(), "tmp/" + filename);

        // Save the file to the public/assets directory
        await writeFile(savePath, buffer);

        // After saving the file locally, upload it to OpenAI
        const openAIFile = await openai.files.create({
            file: fs.createReadStream(savePath),
            purpose: "assistants",
        });

        // Delete the file after uploading
        fs.unlink(savePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log(`File ${filename} deleted successfully.`);
            }
        });

        // Respond with success
        return NextResponse.json({ message: "File uploaded successfully", openAIFile }, { status: 201 });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file to OpenAI" }, { status: 500 });
    }
};
