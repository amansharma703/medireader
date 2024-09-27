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
    const { file_key, file_name, openAIFileId } = body;
    const fileUrl = getS3Url(file_key)
    console.log(file_key, file_name, openAIFileId);
    const thread = await openai.beta.threads.create();

    console.log("thre", thread)
    const newChats = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: fileUrl,
        userId,
        threadId: thread.id,
      })
      .returning({
        insertedId: chats.id,
      });


    const run = await openai.beta.threads.createAndRunPoll({
      assistant_id: process.env.OPENAI_ASSITANT_ID!,
      thread: {
        messages: [
          {
            role: "user",
            content: "Review the provided lab report, summarize the key health information, and generate a health score between 1 and 10 based on the findings",
            attachments: [{
              file_id: openAIFileId,
              tools: [{
                type: "file_search"
              }]
            }]
          },
        ],
      },
    });

    let labSummary = "";
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        run.thread_id
      );
      for (const message of messages.data.reverse()) {
        if (message.content?.length > 0) {
          if (message.role === "assistant") {
            console.log(message?.content)
            labSummary += message?.content[0]?.text?.value;
          }
        }
      }
    }

    console.log(JSON.stringify(run, null, 4));
    console.log(JSON.stringify(labSummary, null, 4));

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
