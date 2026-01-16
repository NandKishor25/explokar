import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
    tripId: string;
    senderId: string;
    senderName: string;
    senderPhoto: string;
    message: string;
    createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
    tripId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderPhoto: { type: String, default: '' },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying by tripId and sorting by time
chatMessageSchema.index({ tripId: 1, createdAt: 1 });

const ChatMessage: Model<IChatMessage> = mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);

export default ChatMessage;
