<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,100:2c5364&height=200&section=header&text=AI%20Chatbot&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Full%20Stack%20Chatbot%20Powered%20by%20Gemini&descAlignY=55&descSize=18" width="100%"/>

<br/>

![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<img src="https://img.shields.io/github/stars/AbdulAzeemHashmi/AI-Chatbot?style=social" alt="stars"/>
<img src="https://img.shields.io/github/forks/AbdulAzeemHashmi/AI-Chatbot?style=social" alt="forks"/>
<img src="https://img.shields.io/github/last-commit/AbdulAzeemHashmi/AI-Chatbot?color=2c5364" alt="last commit"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=2C5364&center=true&vCenter=true&width=650&lines=Full+Stack+FastAPI+and+Next.js+App;Powered+by+Google+Gemini+API;Persistent+Chat+History+with+localStorage;Premium+Dark+Theme+UI" alt="Typing SVG" />

<br/>

🌐 **Live Demo:** [ai-chatbot-aah18751.vercel.app](https://ai-chatbot-aah18751.vercel.app/)

<a href="https://ai-chatbot-aah18751.vercel.app/">
<img src="https://img.shields.io/badge/🚀%20Try%20it%20Live-Visit%20App-2c5364?style=for-the-badge" alt="try it live"/>
</a>

</div>

<br/>

## 🤖 About

A production ready, full stack AI Chatbot application featuring a fast Python FastAPI backend and a responsive Next.js frontend, powered by the Google Gemini API.

<div align="center">
<img src="https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif" width="380" alt="chatbot animation"/>
</div>

---

## 📁 Project Structure

```
AI-Chatbot/
├── 🗂️ backend/     # Python FastAPI application that connects to the Gemini API
├── 🗂️ frontend/    # Next.js (App Router, Tailwind CSS, TypeScript) user interface
├── 🚫 .gitignore
├── 📘 README.md
└── 📋 requirements.txt
```

<br/>

## ✨ Features

- 📌 Dynamic and responsive sidebar managing multiple chat sessions.
- 💾 State persistence using localStorage to keep history across reloads.
- 🎨 Beautiful, premium UI featuring dark theme and smooth micro animations.
- 🏷️ Autorename chat sessions dynamically based on the first user message.
- 📋 Custom code block renderer with instant copy to clipboard functionality.
- ⚡ Fast responses powered by the `gemini-1.5-flash` model.
- 🛡️ Robust error callout handling with connection recovery.

<br/>

## ✅ Prerequisites

<div align="center">

| Requirement | Details | Icon |
|---|---|---|
| 🪟 **Operating System** | Windows 11 | 🪟 |
| 🟢 **Node.js** | v18.0.0 or later | 🟢 |
| 🐍 **Python** | v3.10 or later | 🐍 |
| 🔑 **Google Gemini API Key** | Required for backend | 🔑 |

</div>

<br/>

## 🚀 Setup and Running

<div align="center">

```mermaid
flowchart LR
    A[🐍 Backend: FastAPI] -->|🔑 Gemini API Key| B[🤖 Google Gemini]
    A -->|📡 REST API| C[⚛️ Frontend: Next.js]
    C -->|💬 Chat UI| D[👤 User]
    D -->|📝 Message| C
    C -->|Request| A
```

</div>

<details open>
<summary><b>1️⃣ 🐍 Backend Configuration</b></summary>
<br/>

Open a Windows PowerShell or CMD terminal and navigate to the backend directory:

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder (a default key template is provided):

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PORT=8000
```

Start the backend development server:

```cmd
uvicorn main:app --reload --port 8000
```

The API will now be running at `http://127.0.0.1:8000`. ✅

</details>

<details open>
<summary><b>2️⃣ ⚛️ Frontend Configuration</b></summary>
<br/>

Open another Windows PowerShell or CMD terminal and navigate to the frontend directory:

```cmd
cd frontend
npm install
```

Start the frontend development server:

```cmd
npm run dev
```

Open `http://localhost:3000` in your web browser to access the application. 🎉

</details>

<br/>

## 🛠️ Tech Stack

<div align="center">

![Python](https://skillicons.dev/icons?i=python)
&nbsp;
![FastAPI](https://skillicons.dev/icons?i=fastapi)
&nbsp;
![Next.js](https://skillicons.dev/icons?i=nextjs)
&nbsp;
![TypeScript](https://skillicons.dev/icons?i=typescript)
&nbsp;
![TailwindCSS](https://skillicons.dev/icons?i=tailwind)
&nbsp;
![Vercel](https://skillicons.dev/icons?i=vercel)

</div>

<br/>

## 👤 Creator Profile

Developed by [AbdulAzeemHashmi](https://github.com/AbdulAzeemHashmi). 🧑‍💻

<br/>

<div align="center">

### ⭐ If you found this project helpful, consider giving it a star

<a href="https://github.com/AbdulAzeemHashmi/AI-Chatbot/stargazers">
<img src="https://img.shields.io/badge/Star%20this%20repo-⭐-yellow?style=for-the-badge" alt="star this repo"/>
</a>

<br/><br/>

Made with 🤖 and Gemini powered intelligence by Abdul Azeem.

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2c5364,100:0f2027&height=100&section=footer" width="100%"/>

</div>
