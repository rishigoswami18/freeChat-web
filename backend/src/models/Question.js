import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    category: { type: String, enum: ["love", "future", "fun", "deep", "conflict"], default: "fun" },
    activeDate: { type: Date, unique: true }, // The day this question is active
});

const Question = mongoose.model("Question", questionSchema);
export default Question;
