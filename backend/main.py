import os
from typing import List, Literal
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY is not configured in .env file.")

# Configure Gemini SDK
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(
    title="AI Chatbot Backend API",
    description="FastAPI backend that interacts with the Gemini API to support a web-based chatbot frontend.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    content: str = Field(..., description="The textual content of the message.")

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="The chat history including the latest user message.")

class ChatResponse(BaseModel):
    response: str = Field(..., description="The generated response from the Gemini API.")

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key is not configured on the server. Please set GEMINI_API_KEY."
        )
    
    if not request.messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Messages list cannot be empty."
        )
    
    # The last message must be from the user
    last_message = request.messages[-1]
    if last_message.role != "user":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The last message in the list must be from the user."
        )

    try:
        # FIX: Updated to a valid production model name
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Format the chat history for Gemini API
        # Gemini expects history format to have "role" (user/model) and "parts" (list of strings/objects)
        history = []
        for msg in request.messages[:-1]:
            role = "user" if msg.role == "user" else "model"
            history.append(
                genai.types.content_types.to_content({
                    "role": role,
                    "parts": [msg.content]
                })
            )
            
        # Start a chat session with the historical messages
        chat_session = model.start_chat(history=history)
        
        # Send the latest user message
        response = chat_session.send_message(last_message.content)
        
        return ChatResponse(response=response.text)
        
    except Exception as e:
        detail_msg = f"Gemini API Error: {str(e)}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail_msg
        )

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": api_key is not None
    }