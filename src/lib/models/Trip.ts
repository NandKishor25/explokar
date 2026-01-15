import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrip extends Document {
    title: string;
    startLocation: string;
    destination: string;
    startDate: Date;
    duration: number;
    maxParticipants: number;
    preferredGender: 'male' | 'female' | 'any';
    transportMode: 'flight' | 'train' | 'car' | 'bus' | 'bike' | '';
    description: string;
    budget?: number;
    activities?: string;
    imageUrl?: string;
    imagePublicId?: string;
    userId: string;
    participants: {
        userId: string;
        name: string;
        photoURL?: string;
    }[];
    startLocationCoords?: {
        lat: number;
        lng: number;
    };
    destinationCoords?: {
        lat: number;
        lng: number;
    };
    createdAt: Date;
}

const tripSchema = new Schema<ITrip>({
    title: { type: String, required: true },
    startLocation: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    maxParticipants: { type: Number, required: true },
    preferredGender: {
        type: String,
        enum: ['male', 'female', 'any'],
        default: 'any'
    },
    transportMode: {
        type: String,
        enum: ['flight', 'train', 'car', 'bus', 'bike', ''],
        default: ''
    },
    description: { type: String, required: true },
    budget: { type: Number },
    activities: { type: String },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    userId: { type: String, required: true },
    participants: [{
        userId: String,
        name: String,
        photoURL: String
    }],
    startLocationCoords: {
        lat: Number,
        lng: Number
    },
    destinationCoords: {
        lat: Number,
        lng: Number
    },
    createdAt: { type: Date, default: Date.now }
});

// Add text indexes for search
tripSchema.index({
    title: 'text',
    startLocation: 'text',
    destination: 'text',
    description: 'text',
    activities: 'text'
});

const Trip: Model<ITrip> = mongoose.models.Trip || mongoose.model<ITrip>('Trip', tripSchema);

export default Trip;
