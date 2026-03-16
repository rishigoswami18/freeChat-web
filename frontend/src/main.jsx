/**
 * BondBeyond — All Rights Reserved © 2026
 * The Ultimate Relationship Platform
 */
// main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import 'stream-chat-react/dist/css/v2/index.css';
import "./index.css";
import "./i18n";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { MatchProvider } from "./context/MatchContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,         // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000,            // Garbage-collect after 10 minutes
      refetchOnWindowFocus: false,        // Don't refetch when tab regains focus
      retry: 1,                           // Only 1 retry on failure
    },
  },
});

// Global error handlers to catch silent crashes
window.addEventListener('error', (event) => {
  const isChunkError = /fetch|dynamically|imported|module/i.test(event.error?.message || event.message);

  if (isChunkError) {
    console.warn("🔄 Detected stale chunk after update. Force reloading...");
    window.location.reload();
    return;
  }

  console.error('🔴 GLOBAL ERROR:', event.error?.message || event.message, event.error?.stack);
  document.getElementById('root').innerHTML = `<div style="padding:40px;font-family:monospace;color:red;background:#111;min-height:100vh;"><h2>App Crashed</h2><pre>${event.error?.message || event.message}\n${event.error?.stack || ''}</pre><button onclick="window.location.reload()" style="padding:10px 20px;background:#fff;color:#000;border:none;border-radius:4px;cursor:pointer;margin-top:20px;">Reload App</button></div>`;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔴 UNHANDLED PROMISE:', event.reason);
});

console.log("🚀 Initializing BondBeyond App...");

import App from "./App.jsx";

try {
  const root = createRoot(document.getElementById("root"));
  console.log("✅ React root created");

  root.render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <MatchProvider>
              <App />
            </MatchProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
  console.log("✅ React render called");
} catch (err) {
  console.error("🔴 FATAL: React failed to mount:", err);
  document.getElementById('root').innerHTML = `<div style="padding:40px;font-family:monospace;color:red;"><h2>Mount Failed</h2><pre>${err.message}\n${err.stack}</pre></div>`;
}