import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const VoiceRecorder = ({ onSend }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                stream.getTracks().forEach(track => track.stop());
                // We'll handle sending manually to allow cancellation
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Microphone access denied");
        }
    };

    const stopRecording = (shouldSend = true) => {
        if (!mediaRecorderRef.current) return;

        clearInterval(timerRef.current);
        const recorder = mediaRecorderRef.current;

        recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            if (shouldSend) {
                await uploadAndSend(audioBlob);
            }
            setIsRecording(false);
            setRecordingTime(0);
        };

        recorder.stop();
    };

    const uploadAndSend = async (blob) => {
        setIsUploading(true);
        try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64Audio = reader.result;
                const res = await axiosInstance.post("/chat/upload-media", {
                    media: base64Audio,
                    mediaType: "audio",
                });

                const { url } = res.data;
                onSend({
                    type: "voice",
                    url: url,
                    duration: recordingTime
                });
                toast.success("Voice message sent!");
            };
        } catch (error) {
            console.error("Error uploading voice message:", error);
            toast.error("Failed to send voice message");
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (isRecording) {
        return (
            <div className="flex items-center gap-3 bg-base-200 px-4 py-2 rounded-full shadow-lg animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold w-10 text-base-content/70">
                        {formatTime(recordingTime)}
                    </span>
                </div>

                <div className="h-4 w-[1px] bg-base-300 mx-1" />

                <button
                    onClick={() => stopRecording(false)}
                    className="p-1.5 hover:bg-base-300 rounded-full text-error transition-colors"
                    title="Cancel"
                >
                    <Trash2 className="size-4" />
                </button>

                <button
                    onClick={() => stopRecording(true)}
                    className="btn btn-primary btn-xs rounded-full gap-1 px-3 h-8 min-h-0"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : (
                        <>
                            <Send className="size-3" />
                            <span className="text-[10px] font-bold uppercase">Send</span>
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
};

export default VoiceRecorder;
