import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    gameType: {
        type: String,
        enum: ["compatibility_quiz"],
        default: "compatibility_quiz"
    },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: String // For compatibility quiz, this might be "what User A said about Topic X"
    }],
    answers: {
        type: Map,
        of: [{
            questionIndex: Number,
            answer: String
        }],
        default: {}
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    score: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const GameSession = mongoose.model("GameSession", gameSessionSchema);

export default GameSession;
