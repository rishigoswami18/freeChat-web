# freeChat Frontend

The frontend for freeChat, built using React and Vite.

## 🚀 Key Features

- **Responsive UI**: Optimized for mobile and desktop using Tailwind CSS and DaisyUI.
- **Dynamic Animations**: Smooth transitions with Framer Motion.
- **Real-time Integrations**:
  - Chat and Video calls via Stream SDK.
  - State management using Zustand.
- **Social Interactions**: Dynamic posts, stories, and social profiles.
- **Secure Authentication**: Integrated auth flows with backend synchronization.

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file:
   ```env
   VITE_STREAM_API_KEY=your_stream_api_key
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

## 🧱 Structure

- `src/components`: Reusable UI components.
- `src/pages`: Main application views.
- `src/store`: Zustand state management.
- `src/lib`: API clients and SDK initializations (Axios, Stream).
- `src/hooks`: Custom React hooks.
- `src/styles`: Tailwind global styles.
