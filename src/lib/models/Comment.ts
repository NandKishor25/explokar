import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    tripId: mongoose.Schema.Types.ObjectId;
    userId: string;
    userName: string;
    userPhoto?: string;
    text: string;
    createdAt: Date;
}

const commentSchema = new Schema<IComment>({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userPhoto: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
