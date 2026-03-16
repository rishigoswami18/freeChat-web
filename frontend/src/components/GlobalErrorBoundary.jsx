import React, { Component } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔴 [GlobalErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 text-center font-outfit">
          <div className="max-w-md w-full">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full animate-pulse" />
              <div className="relative size-24 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto">
                <ShieldAlert className="size-12 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-3xl font-black italic text-white mb-4 uppercase tracking-tighter">
                Arena Maintenance
            </h1>
            <p className="text-white/40 font-bold text-sm leading-relaxed mb-10">
                Our high-velocity sports engines are currently being recalibrated for maximum performance. We'll be back on the field shortly.
            </p>

            <button 
              onClick={() => window.location.reload()}
              className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <RefreshCw className="size-4" /> Try Reconnecting
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
