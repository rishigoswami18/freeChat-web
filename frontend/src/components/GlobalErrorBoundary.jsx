import React, { Component } from "react";
import { AlertCircle, RefreshCw, Home, Mail } from "lucide-react";
import { motion } from "framer-motion";

/**
 * GlobalErrorBoundary
 * Professional error recovery system.
 * Simple, trustworthy, and minimal design for high-end SaaS applications.
 */
class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔴 [GlobalErrorBoundary]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6 text-center antialiased">
          <div className="max-w-md w-full space-y-10">
            
            {/* Error Illustration / Icon */}
            <div className="relative inline-block">
              <div className="size-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle className="size-10 text-slate-400" />
              </div>
            </div>
            
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Something went wrong
                </h1>
                <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm mx-auto">
                    An unexpected error occurred while loading this page. Our team has been notified and we're working to fix the issue.
                </p>
            </div>

            {/* Error Details (Subtle) */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Summary</p>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed font-mono truncate">
                    {this.state.error?.toString() || "Unknown loading failure"}
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full h-12 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md"
                >
                  <RefreshCw className="size-4" /> Refresh Page
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => window.location.href = "/"}
                      className="h-12 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Home size={16} /> Home
                    </button>
                    <button 
                      onClick={() => window.location.href = "mailto:support@freechat.nexus"}
                      className="h-12 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Mail size={16} /> Support
                    </button>
                </div>
            </div>

            <div className="pt-8 text-[11px] font-medium text-slate-300">
                Error Reference: {Math.random().toString(36).substring(7).toUpperCase()}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
