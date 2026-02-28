/**
 * BondBeyond — All Rights Reserved © 2026
 * Powered by freechatweb.in
 */
// main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import 'stream-chat-react/dist/css/v2/index.css';
import "./index.css";
import App from "./App.jsx";

// ❌ OLD: import { BrowserRouter } from "react-router";
// ✅ NEW: 
import { BrowserRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);