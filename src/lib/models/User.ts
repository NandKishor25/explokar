import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    uid: string;
    email: string;
    name: string;
    photoURL?: string;
    bio?: string;
    location?: string;
    interests: string[];
    averageRating: number;
    totalReviews: number;
    role: 'user' | 'admin' | 'guide';
    languages: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        uid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        photoURL: {
            type: String,
            default: '',
            // Optional: Add regex validator if we really want to enforce it strict, but client-side likely sends valid URLs
        },
        bio: {
            type: String,
            default: '',
            maxlength: 300,
        },
        location: {
            type: String,
            trim: true,
        },
        interests: {
            type: [String],
            default: [],
        },
        averageRating: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        role: { type: String, enum: ['user', 'admin', 'guide'], default: 'user' },
        languages: { type: [String], default: [] },
    },
    { timestamps: true }
);

// Prevent overwriting the model if it's already compiled
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
