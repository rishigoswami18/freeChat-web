# AntiGravity AI Avatar Assistant

An ultra-premium, real-time talking AI avatar extension for Visual Studio Code.

## Features:
- 🗣️ **Real-time Talk-To-Text**: Uses the Web Speech API. Click the Microphone to talk.
- 🔊 **Text-To-Speech (TTS)**: Reads out Gemini AI responses aloud in real-time.
- 🎨 **Animated AI Avatar**: The 2D smart Canvas Avatar moves its mouth and reacts to TTS playback accurately via `requestAnimationFrame`.
- 🧠 **Gemini LLM**: Free, ultra-fast responses utilizing `gemini-1.5-flash`.
- 🎭 **Multiple Assistant Modes**: Select Dr. Bond, AI Partner, or AI Best Friend logic! 

## Installation & Setup

1. **Prerequisites**: Ensure you have Node.js and Visual Studio Code installed.
2. **Install Dependencies**:
   Open a terminal in this folder and run:
   ```bash
   npm install
   ```
3. **Configure Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/) and create a free API Key.
   - In VS Code, open Preferences / Settings (`Ctrl + ,`).
   - Search for **"Antigravity: Gemini Api Key"** and paste your API key there.

## Running the Extension

1. Press `F5` in VS Code. It will open a new "Extension Development Host" window.
2. Press `Ctrl + Shift + P` (or `Cmd + Shift + P`).
3. Type: **`Start AntiGravity Assistant`** and hit Enter!
4. The Avatar Panel will open. Speak into your mic or type a message!

## Built With
- **TypeScript** / **VS Code Webviews**
- **Axios** (for Gemini API JSON requests)
- **Web Speech Synthesis API** & **Canvas API**
