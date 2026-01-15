import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip, { ITrip } from '@/lib/models/Trip';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const startLocation = searchParams.get('startLocation');
        const destination = searchParams.get('destination');
        const startDate = searchParams.get('startDate');
        const transportMode = searchParams.get('transportMode');
        const preferredGender = searchParams.get('preferredGender');

        const query: any = {};

        if (startLocation) query.startLocation = { $regex: startLocation, $options: 'i' };
        if (destination) query.destination = { $regex: destination, $options: 'i' };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate) {
            const date = new Date(startDate);
            query.startDate = { $gte: date };
        } else {
            query.startDate = { $gte: today };
        }

        if (transportMode) query.transportMode = transportMode;
        if (preferredGender && preferredGender !== 'any') {
            query.preferredGender = { $in: [preferredGender, 'any'] };
        }

        const trips = await Trip.find(query).sort({ startDate: 1 });

        const tripsWithCreatorInfo = await Promise.all(trips.map(async (trip) => {
            const creator = await User.findOne({ uid: trip.userId });
            return {
                ...trip.toObject(),
                createdBy: {
                    name: creator ? creator.name : 'Unknown',
                    photoURL: creator ? creator.photoURL : ''
                }
            };
        }));

        return NextResponse.json(tripsWithCreatorInfo, { status: 200 });
    } catch (error) {
        console.error('Error searching trips:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
