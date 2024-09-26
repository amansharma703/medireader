import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(req: Request, res: Response) {
  console.log("_____________123_______________");

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log(file_key, file_name);
    const thread = await openai.beta.threads.create();
    // const thread = await openai.beta.threads.create({
    //   messages: [
    //     {
    //       role: "user",
    //       content: "Review the provided lab report, summarize the key health information, and generate a health score between 1 and 10 based on the findings",
    //       attachments: []
    //     },
    //   ],
    // });
    console.log("thre", thread)
    const newChats = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
        threadId: thread.id,
      })
      .returning({
        insertedId: chats.id,
      });

    const initialMessage = {
      role: "user",
      content: "Review the provided lab report, summarize the key health information, and generate a health score between 1 and 10 based on the findings",
      attachments: [],  // No attachments for now
    };

    // Step 2: Send the initial message to the OpenAI thread
    const messageResponse = await openai.beta.threads.messages.create(
      thread.id,
      initialMessage
    );

    const messages = await openai.beta.threads.messages.create(
      thread.id,
      message
    );

    return NextResponse.json(
      {
        chat_id: newChats[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥internal server Error 1", error);
    return NextResponse.json(
      { error: "🔥internal server Error 2" },
      { status: 500 }
    );
  }
}
