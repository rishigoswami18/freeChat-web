import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Mic, Trash2, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

// === PERFORMANCE OPTIMIZATION: Pure Rendering Helpers ===
// Hoisted outside the component to prevent function reallocation per second during the timer tick.
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Wrapped in React.memo to prevent unnecessary re-renders driven by parent chat inputs
const VoiceRecorder = memo(({ onSend }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    
    // Stable refs to prevent async closure traps
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null); // Track the raw hardware stream explicitly

    // === MEMORY LEAK PREVENTION: Strict Cleanup Modules ===
    const cleanupHardware = useCallback(() => {
        // Destroy interval timer silently
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        // Sever all hardware microphone connections forcefully.
        // Failing to do this leaves the red "Recording" dot active in browser tabs indefinitely.
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // Unmount protector
    useEffect(() => {
        return () => {
            cleanupHardware();
            // Free the native MediaRecorder object safely
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
        };
    }, [cleanupHardware]);

    // === MEDIA RECORDER LIFECYCLE ===
    const startRecording = useCallback(async () => {
        try {
            // Prevent duplicate instance race conditions upon rapid clicking
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") return;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Tick seconds precisely
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            
            // Mobile Compatibility: Safely map browser API exception codes to readable warnings
            if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                toast.error("Microphone access blocked. Please check browser settings.");
            } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
                toast.error("No microphone detected on this device.");
            } else {
                toast.error("Could not capture audio at this time.");
            }
        }
    }, []);

    // Encapsulate upload task inside a safe asynchronous wrapper preventing Main Thread locking
    const uploadAndSend = async (blob, duration) => {
        setIsUploading(true);
        try {
            // Memory Optimization: Wrap FileReader inside a Promise to cleanly await Base64 encoding
            // avoiding massive callback hell and dangling event listeners.
            const base64Audio = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const res = await axiosInstance.post("/chat/upload-media", {
                media: base64Audio,
                mediaType: "audio",
            });

            const { url } = res.data;
            if (url && onSend) {
                // Return payload upwards cleanly tracking accurate duration
                onSend({
                    type: "voice",
                    url: url,
                    duration: duration 
                });
                toast.success("Voice message sent!");
            }
        } catch (error) {
            console.error("Error uploading voice message:", error);
            toast.error("Failed to send voice message");
        } finally {
            // Full state reset on complete or failure
            setIsUploading(false);
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    const stopRecording = useCallback((shouldSend = true) => {
        const recorder = mediaRecorderRef.current;
        
        // Prevent rogue stops throwing native DOMExceptions
        if (!recorder || recorder.state === "inactive") {
            cleanupHardware();
            setIsRecording(false);
            return;
        }

        // Freeze the UI timer immediately upon clicking Send/Cancel
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Capture static duration locally so async execution doesn't mutate it later
        const capturedDuration = recordingTime;

        // Route the stop event securely overriding race-callbacks
        recorder.onstop = async () => {
            cleanupHardware(); 

            // Only attempt upload if confirmed and data exists
            if (shouldSend && capturedDuration > 0 && audioChunksRef.current.length > 0) {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                await uploadAndSend(audioBlob, capturedDuration);
            } else {
                setIsRecording(false);
                setRecordingTime(0);
                setIsUploading(false);
            }
        };

        recorder.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordingTime, cleanupHardware]);

    // === UI RENDERING ===
    if (isRecording) {
        return (
            <div className="flex items-center gap-3 bg-base-100 px-4 py-2 rounded-2xl shadow-xl border border-primary/20 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-error animate-ping" />
                    <span className="text-sm font-mono font-bold w-12 text-error">
                        {formatTime(recordingTime)}
                    </span>
                </div>

                <div className="h-6 w-[1px] bg-base-300 mx-1" />

                <button
                    onClick={() => stopRecording(false)}
                    className="btn btn-ghost btn-circle btn-sm text-base-content/40 hover:text-error hover:bg-error/10 transition-colors"
                    title="Cancel"
                    disabled={isUploading}
                >
                    <Trash2 className="size-4" />
                </button>

                <button
                    onClick={() => stopRecording(true)}
                    className="btn btn-primary btn-sm rounded-xl gap-2 px-4 shadow-lg active:scale-95 transition-all"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <>
                            <Send className="size-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">Send</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={startRecording}
            className="btn btn-circle btn-sm btn-ghost hover:bg-primary/20 text-primary transition-all z-10"
            title="Record Voice Message"
        >
            <Mic className="size-5" />
        </button>
    );
});

VoiceRecorder.displayName = "VoiceRecorder";
export default VoiceRecorder;
