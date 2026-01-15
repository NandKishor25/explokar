import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    recipient: string; // User ID of the recipient
    sender: {
        userId: string;
        name: string;
        photoURL?: string;
    };
    type: 'TRIP_JOIN' | 'MESSAGE' | 'TRIP_LEAVE' | 'SYSTEM' | 'JOIN_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_DECLINED';
    tripId?: string;
    relatedId?: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    recipient: { type: String, required: true, index: true },
    sender: {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        photoURL: { type: String }
    },
    type: {
        type: String, // 'TRIP_JOIN' type is now deprecated in favor of 'JOIN_REQUEST' for the new flow, but kept for backward compat if needed
        enum: ['TRIP_JOIN', 'MESSAGE', 'TRIP_LEAVE', 'SYSTEM', 'JOIN_REQUEST', 'REQUEST_ACCEPTED', 'REQUEST_DECLINED'],
        required: true
    },
    tripId: { type: String },
    relatedId: { type: String }, // For JoinRequest ID or other resource IDs
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Index for fetching user's notifications sorted by date
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
