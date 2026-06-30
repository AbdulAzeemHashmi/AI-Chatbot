import os
import json
from http.server import BaseHTTPRequestHandler
import google.generativeai as genai

# Configure Gemini SDK from environment variable (set in Vercel dashboard)
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)


def build_cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight request."""
        self.send_response(200)
        for key, value in build_cors_headers().items():
            self.send_header(key, value)
        self.end_headers()

    def do_POST(self):
        """Handle POST /api/chat."""
        try:
            # Read request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
        except Exception:
            self._send_error(400, "Invalid request body.")
            return

        messages = data.get("messages", [])

        if not messages:
            self._send_error(400, "Messages list cannot be empty.")
            return

        last_message = messages[-1]
        if last_message.get("role") != "user":
            self._send_error(400, "The last message must be from the user.")
            return

        if not api_key:
            self._send_error(
                500,
                "Gemini API key is not configured. Set GEMINI_API_KEY in Vercel environment variables.",
            )
            return

        try:
            model = genai.GenerativeModel("gemini-2.0-flash")

            # Build history (all messages except the last one)
            history = []
            for msg in messages[:-1]:
                role = "user" if msg["role"] == "user" else "model"
                history.append(
                    genai.types.content_types.to_content(
                        {"role": role, "parts": [msg["content"]]}
                    )
                )

            chat_session = model.start_chat(history=history)
            response = chat_session.send_message(last_message["content"])

            self._send_json(200, {"response": response.text})

        except Exception as e:
            self._send_error(500, f"Gemini API Error: {str(e)}")

    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        for key, value in build_cors_headers().items():
            self.send_header(key, value)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_error(self, status: int, detail: str):
        self._send_json(status, {"detail": detail})
