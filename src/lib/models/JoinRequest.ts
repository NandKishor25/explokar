import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJoinRequest extends Document {
    tripId: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    status: 'pending' | 'accepted' | 'rejected';
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

const JoinRequestSchema = new Schema<IJoinRequest>({
    tripId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userPhoto: { type: String },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: { type: String, required: true },
}, { timestamps: true });

// Ensure a user can only have one pending request per trip
JoinRequestSchema.index({ tripId: 1, userId: 1 }, { unique: true });

const JoinRequest: Model<IJoinRequest> = mongoose.models.JoinRequest || mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);

export default JoinRequest;
