// import { OpenAIApi, Configuration } from "openai-edge";

// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(config);

// export async function getEmbeddings(text: string) {
//   try {
//     const response = await openai.createEmbedding({
//       model: "text-embedding-ada-002",
//       input: text.replace(/\n/g, " "),
//     });
//     const result = await response.json();
//     return result.data[0].embedding as number[];
//   } catch (error) {
//     console.log("error calling openai embeddings api", error);
//     throw error;
//   }
// }

import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  console.log("CALLING OPEN_AI EMBEDDING....");
  console.log("TEXT", text);

  try {
    // Replacing newlines with spaces to avoid potential issues with API input
    const cleanText = text.replace(/\n/g, " ");

    // Making the API call
    const response = await openai.createEmbedding({
      model: "text-embedding-3-large",
      // model: "text-embedding-ada-002",
      input: cleanText,
    });

    // Parsing the response
    const result = await response.json();

    // Logging the response for debugging
    console.log("OpenAI Response:", result);

    // Checking if the response contains the expected data
    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      console.error("Invalid response from OpenAI:", result);
      throw new Error("Invalid response from OpenAI");
    }

    // Returning the embedding
    return result.data[0].embedding as number[];
  } catch (error) {
    // Logging the error for debugging
    console.error("Error calling OpenAI embeddings API:", error);
    throw error;
  }
}
