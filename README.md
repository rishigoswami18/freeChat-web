# freeChat — Real People, Real Connection

**freeChat** is a modern, privacy-focused social media alternative designed to simplify digital interaction. It replaces the noise of traditional social platforms with secure real-time messaging, HD video calls, and meaningful photo sharing.

🌐 **Live Website**: [www.freechatweb.in](https://www.freechatweb.in)

---

## 🚀 Key Features

- **🛡️ Privacy First**: Integrated "Stealth Mode" and secure authentication to keep your data private.
- **💬 Real-time Messaging**: Fast, reliable chat powered by Stream SDK.
- **📹 HD Video Calls**: Crystal-clear video communication for personal and group calls.
- **📸 Social Sharing**: Share posts and stories with a community focused on real connection.
- **🤖 Smart Features**:
  - **Emotion Detection**: ML-powered analysis of message sentiments.
  - **Real-time Translation**: Break language barriers with built-in translation services.
- **💎 Premium Experience**: Membership system via Razorpay for exclusive features.
- **📱 PWA Support**: Installable on mobile and desktop for a native-like experience.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Real-time**: [Stream SDK](https://getstream.io/) (Chat & Video)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Auth**: JWT + Cookie-based sessions
- **Payments**: [Razorpay](https://razorpay.com/)
- **File Storage**: [Cloudinary](https://cloudinary.com/)

### Machine Learning Service
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Libraries**: Scikit-learn, Joblib, Deep Translator

---

## 📦 Project Structure

```text
CHAT_APPLICATION/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express server
├── ml_service/        # FastAPI ML service (Emotion & Translation)
└── scripts/           # Deployment and utility scripts
```

---

## 🛠️ Setup & Local Development

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB Atlas account (or local instance)
- API Keys for Stream, Cloudinary, and Razorpay

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rishigoswami18/freeChat.git
   cd freeChat
   ```

2. **Root Dependencies**:
   ```bash
   npm install
   ```

3. **Backend Setup**:
   - Navigate to `backend/`
   - Create a `.env` file based on the provided configuration (MONGO_URI, JWT_SECRET, STREAM_API_KEY, etc.)
   - Run `npm install`

4. **Frontend Setup**:
   - Navigate to `frontend/`
   - Create a `.env` file (VITE_STREAM_API_KEY)
   - Run `npm install`

5. **ML Service Setup**:
   - Navigate to `ml_service/`
   - Install requirements: `pip install -r requirements.txt`
   - Start the service: `uvicorn app:app --reload`

### Running the App

From the root directory:
- **Build**: `npm run build`
- **Start Backend**: `npm run start` (Starts both backend and serves frontend in production mode)
- **Dev Mode**: Run `npm run dev` inside `frontend/` and `npm start` inside `backend/`

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ by the **freeChat Team**.
