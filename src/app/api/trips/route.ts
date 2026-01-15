import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/lib/models/Trip';
import User from '@/lib/models/User';

// Force dynamic to prevent static generation of this route since it fetches DB data
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const trips = await Trip.find().sort({ createdAt: -1 });

        // Get creator info for each trip
        const tripsWithCreatorInfo = await Promise.all(trips.map(async (trip) => {
            const creator = await User.findOne({ uid: trip.userId });
            return {
                ...trip.toObject(),
                createdBy: {
                    name: creator ? creator.name : 'Unknown',
                    photoURL: creator ? creator.photoURL : '',
                    email: creator ? creator.email : ''
                }
            };
        }));

        return NextResponse.json(tripsWithCreatorInfo, { status: 200 });
    } catch (error) {
        console.error('Error fetching trips:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const {
            title,
            startLocation,
            destination,
            startDate,
            duration,
            maxParticipants,
            preferredGender,
            transportMode,
            description,
            budget,
            activities,
            userId,
            startLocationCoords,
            destinationCoords
        } = body;

        // Get user info for creator
        const user = await User.findOne({ uid: userId });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Create the trip without image
        const newTrip = new Trip({
            title,
            startLocation,
            destination,
            startDate,
            duration: parseInt(duration),
            maxParticipants: parseInt(maxParticipants),
            preferredGender: preferredGender || 'any',
            transportMode: transportMode || '',
            description,
            budget: budget ? parseInt(budget) : undefined,
            activities,
            userId,
            startLocationCoords,
            destinationCoords,
            participants: [] // Initially empty, creator is not a participant
        });

        await newTrip.save();

        // Add creator info to response
        const tripWithCreator = {
            ...newTrip.toObject(),
            createdBy: {
                name: user.name,
                photoURL: user.photoURL,
                email: user.email
            }
        };

        return NextResponse.json(tripWithCreator, { status: 201 });
    } catch (error) {
        console.error('Error creating trip:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
