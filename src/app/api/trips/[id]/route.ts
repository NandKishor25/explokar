import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/lib/models/Trip';
import User from '@/lib/models/User';
import Comment from '@/lib/models/Comment';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const trip = await Trip.findById(params.id);

        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        // Get creator info
        const creator = await User.findOne({ uid: trip.userId });

        const tripWithCreator = {
            ...trip.toObject(),
            createdBy: {
                name: creator ? creator.name : 'Unknown',
                photoURL: creator ? creator.photoURL : '',
                email: creator ? creator.email : ''
            }
        };

        return NextResponse.json(tripWithCreator, { status: 200 });
    } catch (error) {
        console.error('Error fetching trip:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const formData = await req.formData();

        // Extract fields
        const userId = formData.get('userId') as string;

        const trip = await Trip.findById(params.id);

        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        // Check if user is the creator
        if (trip.userId !== userId) {
            return NextResponse.json({ message: 'Not authorized to update this trip' }, { status: 403 });
        }

        // Handle Image Upload
        const file = formData.get('image') as File | null;
        if (file) {
            // Delete old image from Cloudinary if exists
            if (trip.imagePublicId) {
                await cloudinary.uploader.destroy(trip.imagePublicId);
            }

            // Upload new image
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileBase64 = buffer.toString('base64');
            const dataURI = `data:${file.type};base64,${fileBase64}`;

            const result = await cloudinary.uploader.upload(dataURI, {
                resource_type: 'auto',
            });

            trip.imageUrl = result.secure_url;
            trip.imagePublicId = result.public_id;
        }

        // Update other fields
        const fieldsToUpdate = [
            'title', 'startLocation', 'destination', 'startDate', 'duration',
            'maxParticipants', 'preferredGender', 'transportMode', 'description',
            'budget', 'activities'
        ];

        fieldsToUpdate.forEach(field => {
            const value = formData.get(field);
            if (value !== null) {
                // Explicitly cast to unknown then to specific type to satisfy TS if needed, 
                // but since trip[field] expects specific types:
                // We need careful typing or use 'any' for trip temporarily for this loop.
                // Or safer explicit mapping.

                const tripAny = trip as any;

                if (['duration', 'maxParticipants', 'budget'].includes(field)) {
                    tripAny[field] = parseInt(value as string);
                } else {
                    tripAny[field] = value as string;
                }
            }
        });

        await trip.save();

        // Get creator info
        const creator = await User.findOne({ uid: trip.userId });

        const updatedTrip = {
            ...trip.toObject(),
            createdBy: {
                name: creator ? creator.name : 'Unknown',
                photoURL: creator ? creator.photoURL : '',
                email: creator ? creator.email : ''
            }
        };

        return NextResponse.json(updatedTrip, { status: 200 });

    } catch (error) {
        console.error('Error updating trip:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const trip = await Trip.findById(params.id);

        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        // Delete image from Cloudinary if exists
        if (trip.imagePublicId) {
            await cloudinary.uploader.destroy(trip.imagePublicId);
        }

        // Delete all comments for this trip
        await Comment.deleteMany({ tripId: trip._id });

        // Delete the trip
        await Trip.findByIdAndDelete(params.id);

        return NextResponse.json({ message: 'Trip deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting trip:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
