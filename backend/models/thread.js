import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant']
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ThreadSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true   // 🔥 FIX: THIS WAS MISSING LOGICALLY
    },

    threadId: {
        type: String,
        required: true,
        unique: true
    },

    title: {
        type: String,
        default: 'New conversation',
        required: true
    },

    messages: [MessageSchema],

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Thread = mongoose.model('Thread', ThreadSchema);

export default Thread;