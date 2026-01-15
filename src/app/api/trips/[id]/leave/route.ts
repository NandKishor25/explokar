import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/lib/models/Trip';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const { userId } = await req.json();

        const trip = await Trip.findById(params.id);

        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        // Remove user from participants
        trip.participants = trip.participants.filter(p => p.userId !== userId);

        await trip.save();

        return NextResponse.json(trip, { status: 200 });
    } catch (error) {
        console.error('Error leaving trip:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
