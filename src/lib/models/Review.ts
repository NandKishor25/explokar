import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
    reviewer: string;
    reviewee: string;
    tripId: mongoose.Schema.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
    reviewer: {
        type: String, // userId
        required: true,
        ref: 'User'
    },
    reviewee: {
        type: String, // userId
        required: true,
        ref: 'User'
    },
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent multiple reviews from same reviewer to same reviewee for same trip
reviewSchema.index({ reviewer: 1, reviewee: 1, tripId: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

export default Review;
