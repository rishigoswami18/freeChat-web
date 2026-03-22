import * as vscode from 'vscode';
import { generateGeminiResponse } from './GeminiAPI';

export class ChatPanel {
    public static currentPanel: ChatPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private conversationHistory: any[] = []; // Stores memory

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set Webview Content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the Webview (User Audio/Text)
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'userInput':
                        const userText = message.text;
                        const mode = message.mode; // 'friend', 'doctor', 'partner'
                        
                        // Add to memory
                        this.conversationHistory.push({ role: 'user', text: userText });

                        try {
                            // Generate Response
                            const apiKey = vscode.workspace.getConfiguration('antigravity').get<string>('geminiApiKey') || '';
                            if(!apiKey) {
                                this._panel.webview.postMessage({ command: 'assistantResponse', text: 'Please add your Gemini API Key in VS Code Settings first (antigravity.geminiApiKey).' });
                                return;
                            }

                            // Slight delay for human feel
                            setTimeout(() => {
                                this._panel.webview.postMessage({ command: 'startTyping' });
                            }, 500);

                            const systemPrompt = this.getSystemPrompt(mode);
                            const response = await generateGeminiResponse(userText, this.conversationHistory, apiKey, systemPrompt);
                            
                            this.conversationHistory.push({ role: 'assistant', text: response });

                            // Send back to webview (to animate avatar and speak)
                            this._panel.webview.postMessage({ command: 'assistantResponse', text: response });
                        } catch (e: any) {
                            this._panel.webview.postMessage({ command: 'assistantResponse', text: 'Error connecting to Gemini API: ' + e.message });
                        }
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'antiGravityAvatar',
            'AntiGravity Avatar',
            column || vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
    }

    private getSystemPrompt(mode: string): string {
        switch(mode) {
            case 'doctor': return "You are Dr. Bond, a knowledgeable, serious, but caring medical/tech AI assistant. Respond calmly.";
            case 'partner': return "You are an affectionate, supportive, and sweet romantic AI partner. Speak warmly and playfully.";
            case 'friend':
            default: return "You are a friendly, witty, and chill AI best friend coding assistant.";
        }
    }

    private _update() {
        // Construct the HTML for Webview
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AntiGravity Avatar</title>
            <style>
                body { margin: 0; display: flex; flex-direction: column; height: 100vh; background-color: #0f172a; color: white; font-family: sans-serif; }
                #video-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, #1e293b 0%, #0f172a 100%); position: relative; overflow: hidden; }
                
                /* Canvas Avatar */
                #avatar-canvas { 
                    width: 300px; height: 300px; 
                    background-color: transparent; 
                    border-radius: 50%; 
                    box-shadow: 0 0 50px rgba(56, 189, 248, 0.2);
                    transition: all 0.3s ease;
                }

                .glow-speaking { box-shadow: 0 0 80px rgba(56, 189, 248, 0.6) !important; animation: pulse 1s infinite alternate; }
                @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.05); } }
                
                #chat-container { height: 250px; background: #1e293b; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; border-top: 2px solid #334155; }
                .msg { padding: 10px 15px; border-radius: 12px; max-width: 80%; word-wrap: break-word; }
                .user-msg { background: #0ea5e9; align-self: flex-end; }
                .bot-msg { background: #334155; align-self: flex-start; }
                
                #controls { padding: 15px; background: #0f172a; display: flex; gap: 10px; align-items: center; justify-content: center; border-top: 1px solid #1e293b; }
                input[type="text"] { flex: 1; padding: 10px; border-radius: 8px; border: none; background: #334155; color: white; outline: none; }
                button { background: #0ea5e9; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
                button:hover { background: #0284c7; }
                .mic-btn { border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #10b981; }
                .mic-btn.listening { background: #ef4444; animation: pulse 1s infinite alternate; }
                
                select { padding: 8px; background: #334155; color: white; border: none; border-radius: 5px; }

                /* Typing Indicator */
                .typing { display: none; align-self: flex-start; font-style: italic; color: #94a3b8; font-size: 12px; }
            </style>
        </head>
        <body>
            <div id="video-container">
                <canvas id="avatar-canvas" width="400" height="400"></canvas>
            </div>
            
            <div id="chat-container">
                <div class="msg bot-msg">Hey there! I am your AntiGravity Assistant. Enable your mic to talk or just type below!</div>
                <div class="typing" id="typing-indicator">Assistant is thinking...</div>
            </div>

            <div id="controls">
                <select id="mode-select">
                    <option value="friend">Best Friend</option>
                    <option value="doctor">Dr. Bond</option>
                    <option value="partner">AI Partner</option>
                </select>
                <button id="mic-btn" class="mic-btn">🎙️</button>
                <input type="text" id="chat-input" placeholder="Type a message..." />
                <button id="send-btn">Send</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                
                // --- 1. AVATAR ANIMATION ---
                const canvas = document.getElementById('avatar-canvas');
                const ctx = canvas.getContext('2d');
                let isSpeaking = false;
                let mouthOpen = 0; 

                function drawAvatar() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Head
                    ctx.beginPath();
                    ctx.arc(200, 200, 150, 0, Math.PI * 2);
                    ctx.fillStyle = '#fde047'; 
                    ctx.fill();
                    ctx.lineWidth = 10;
                    ctx.strokeStyle = '#ca8a04';
                    ctx.stroke();

                    // Eyes Blinking
                    const isBlinking = (Date.now() % 4000) < 150; 
                    ctx.fillStyle = '#1e293b';
                    if (!isBlinking) {
                        ctx.beginPath(); ctx.arc(140, 150, 20, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(260, 150, 20, 0, Math.PI * 2); ctx.fill();
                    } else {
                        ctx.fillRect(120, 145, 40, 10);
                        ctx.fillRect(240, 145, 40, 10);
                    }

                    // Mouth Lip Sync
                    if (isSpeaking) {
                        mouthOpen = Math.random() * 40 + 10; 
                    } else {
                        mouthOpen = 5; 
                    }

                    ctx.beginPath();
                    ctx.arc(200, 240, 50, 0, Math.PI, false);
                    ctx.lineTo(250, 240 + mouthOpen);
                    ctx.ellipse(200, 240, 50, mouthOpen, 0, 0, Math.PI);
                    ctx.fillStyle = isSpeaking ? '#ef4444' : '#1e293b';
                    ctx.fill();

                    // Glow Effect
                    if (isSpeaking) {
                        canvas.classList.add('glow-speaking');
                    } else {
                        canvas.classList.remove('glow-speaking');
                    }

                    requestAnimationFrame(drawAvatar);
                }
                drawAvatar(); 

                // --- 2. ROBUST TTS ENGINE ---
                function speak(text) {
                    if (!text) return;
                    
                    // Kill any stuck audio
                    window.speechSynthesis.cancel();
                    
                    // Use a slight delay before speaking to clear OS audio buffer
                    setTimeout(() => {
                        const utterance = new SpeechSynthesisUtterance(text);
                        
                        const modeSelectValue = document.getElementById('mode-select').value;
                        if(modeSelectValue === 'doctor') { utterance.pitch = 0.8; utterance.rate = 0.9; }
                        else if(modeSelectValue === 'partner') { utterance.pitch = 1.3; utterance.rate = 1.0; }
                        else { utterance.pitch = 1.0; utterance.rate = 1.0; } // default friend
                        
                        utterance.onstart = () => { isSpeaking = true; };
                        
                        utterance.onend = () => { 
                            isSpeaking = false; 
                            
                            // Auto-Listen functionality: Turn mic back on if it was active
                            if (autoListen) {
                                setTimeout(() => {
                                    try { recognition.start(); } catch(e){}
                                }, 500);
                            }
                        };
                        
                        utterance.onerror = (e) => { 
                            console.error('TTS error', e); 
                            isSpeaking = false; 
                            if (autoListen) {
                                setTimeout(() => { try { recognition.start(); } catch(err){} }, 500);
                            }
                        };

                        window.speechSynthesis.speak(utterance);
                    }, 100);
                }

                // --- 3. SPEECH RECOGNITION (STT) ---
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const micBtn = document.getElementById('mic-btn');
                const chatInput = document.getElementById('chat-input');
                const chatContainer = document.getElementById('chat-container');
                const typingInd = document.getElementById('typing-indicator');

                let recognition;
                let autoListen = false;

                if (SpeechRecognition) {
                    recognition = new SpeechRecognition();
                    recognition.continuous = false;
                    recognition.interimResults = false;

                    recognition.onstart = () => {
                        micBtn.classList.add('listening');
                    };

                    recognition.onresult = (event) => {
                        // Get the most recent valid audio string
                        const transcript = event.results[event.results.length - 1][0].transcript;
                        sendMessage(transcript);
                    };

                    recognition.onend = () => {
                        micBtn.classList.remove('listening');
                    };
                }

                micBtn.onclick = () => {
                    if (recognition) {
                        try { 
                            autoListen = true; 
                            recognition.start(); 
                        } catch(e) { console.error(e); }
                    } else {
                        alert('Your browser / VS Code Webview does not support the Web Speech API.');
                    }
                };

                // --- 4. CHAT LOGIC ---
                function appendMessage(sender, text) {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'msg ' + (sender === 'user' ? 'user-msg' : 'bot-msg');
                    msgDiv.textContent = text;
                    chatContainer.insertBefore(msgDiv, typingInd);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }

                function sendMessage(text) {
                    if (!text || text.trim() === "") return;
                    appendMessage('user', text);
                    chatInput.value = '';
                    
                    const mode = document.getElementById('mode-select').value;
                    vscode.postMessage({ command: 'userInput', text, mode });
                }

                document.getElementById('send-btn').onclick = () => {
                    sendMessage(chatInput.value.trim());
                };

                chatInput.addEventListener('keypress', (e) => {
                    if(e.key === 'Enter') {
                        sendMessage(chatInput.value.trim());
                    }
                });

                // --- 5. RECEIVING RESPONSES FROM BACKEND ---
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'startTyping':
                            typingInd.style.display = 'block';
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                            break;
                        case 'assistantResponse':
                            typingInd.style.display = 'none';
                            appendMessage('bot', message.text);
                            speak(message.text);
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        ChatPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
