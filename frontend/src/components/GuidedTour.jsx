import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Zap, Sparkles } from "lucide-react";

/**
 * GuidedTour — A high-performance, interactive onboarding system.
 * Highlights specific DOM elements and provides contextual tooltips.
 */
const GuidedTour = ({ steps, onComplete, onSkip, isVisible }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    
    const activeStep = steps[currentStep];

    const updateHighlight = () => {
        if (!activeStep?.selector) {
            setTargetRect(null);
            return;
        }

        const element = document.querySelector(activeStep.selector);
        if (element) {
            // Ensure the element is visible in the viewport
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Wait for scroll/render to finish
            setTimeout(() => {
                const rect = element.getBoundingClientRect();
                setTargetRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    bottom: rect.bottom,
                    right: rect.right
                });
            }, 300);
        } else {
            setTargetRect(null);
        }
    };

    useLayoutEffect(() => {
        if (isVisible) {
            updateHighlight();
            setIsLoaded(true);
        }
    }, [currentStep, isVisible]);

    useEffect(() => {
        window.addEventListener("resize", updateHighlight);
        window.addEventListener("scroll", updateHighlight);
        return () => {
            window.removeEventListener("resize", updateHighlight);
            window.removeEventListener("scroll", updateHighlight);
        };
    }, [currentStep]);

    if (!isVisible || !isLoaded) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100000] pointer-events-none overflow-hidden">
            {/* 1. Backdrop with Spotlight Hole */}
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <motion.rect 
                                initial={false}
                                animate={{
                                    x: targetRect.left - 10,
                                    y: targetRect.top - 10,
                                    width: targetRect.width + 20,
                                    height: targetRect.height + 20,
                                    rx: 16
                                }}
                                fill="black" 
                            />
                        )}
                    </mask>
                </defs>
                <rect 
                    x="0" y="0" 
                    width="100%" height="100%" 
                    fill="rgba(0,0,0,0.75)" 
                    mask="url(#spotlight-mask)" 
                    style={{ backdropFilter: 'blur(4px)' }}
                />
            </svg>

            {/* 2. Floating Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        // Position logic: If no target, center screen. Else, try to place near target.
                        top: targetRect 
                            ? (targetRect.top > window.innerHeight / 2 ? 'auto' : targetRect.bottom + 20)
                            : '50%',
                        bottom: (targetRect && targetRect.top > window.innerHeight / 2) ? (window.innerHeight - targetRect.top + 20) : 'auto',
                        left: targetRect 
                            ? Math.min(Math.max(20, targetRect.left + (targetRect.width / 2) - 160), window.innerWidth - 340)
                            : '50%',
                        transform: !targetRect ? 'translate(-50%, -50%)' : 'none'
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute z-[100001] w-[320px] bg-base-100 border border-base-content/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto overflow-hidden"
                >
                    {/* Progress Indicator */}
                    <div className="flex h-1 gap-1 px-4 mt-6">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-full flex-1 rounded-full transition-all duration-300 ${i <= currentStep ? 'bg-primary' : 'bg-base-300'}`} />
                        ))}
                    </div>

                    <div className="p-8">
                        {activeStep.icon && (
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                <activeStep.icon className="size-5" />
                            </div>
                        )}
                        <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 leading-tight">
                            {activeStep.title}
                        </h3>
                        <p className="text-sm opacity-60 leading-relaxed mb-8">
                            {activeStep.description}
                        </p>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex gap-2">
                                {currentStep > 0 && (
                                    <button onClick={handleBack} className="btn btn-ghost btn-sm btn-circle"><ArrowLeft className="size-4" /></button>
                                )}
                                <button onClick={onSkip} className="btn btn-ghost btn-sm text-[10px] uppercase font-black tracking-widest opacity-40 hover:opacity-100">Skip</button>
                            </div>
                            
                            <button 
                                onClick={handleNext}
                                className="btn btn-primary btn-sm rounded-xl px-6 font-black uppercase tracking-widest text-[10px] gap-2"
                            >
                                {currentStep === steps.length - 1 ? "Explore" : "Next"}
                                {currentStep === steps.length - 1 ? <Zap className="size-3 animate-pulse" /> : <ArrowRight className="size-3" />}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Click blocking for highlighted areas (optional, but good for focus) */}
            {targetRect && (
                <div 
                    className="absolute pointer-events-auto"
                    style={{
                        top: targetRect.top - 10,
                        left: targetRect.left - 10,
                        width: targetRect.width + 20,
                        height: targetRect.height + 20,
                        borderRadius: '16px',
                        cursor: 'help'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                    }}
                />
            )}
        </div>
    );
};

export default GuidedTour;
