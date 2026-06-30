import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        detail:
          "Gemini API key is not configured. Set GEMINI_API_KEY in environment variables.",
      },
      { status: 500 }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await request.json();
    messages = body.messages;
  } catch {
    return NextResponse.json(
      { detail: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json(
      { detail: "Messages list cannot be empty." },
      { status: 400 }
    );
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    return NextResponse.json(
      { detail: "The last message must be from the user." },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build history from all messages except the last one
    const history = messages.slice(0, -1).map((msg: ChatMessage) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { detail: `Gemini API Error: ${message}` },
      { status: 500 }
    );
  }
}
