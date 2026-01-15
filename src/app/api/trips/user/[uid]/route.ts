import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/lib/models/Trip';
import User from '@/lib/models/User';

export async function GET(req: NextRequest, { params }: { params: { uid: string } }) {
    try {
        await dbConnect();
        const trips = await Trip.find({ userId: params.uid }).sort({ createdAt: -1 });

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
        console.error('Error fetching user trips:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
