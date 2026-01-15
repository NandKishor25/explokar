import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import JoinRequest from '@/lib/models/JoinRequest';

export const dynamic = 'force-dynamic';

// GET - Check if a user has a pending request for this trip
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ status: null, message: 'No user ID provided' }, { status: 200 });
        }

        await dbConnect();

        const request = await JoinRequest.findOne({ tripId: params.id, userId });

        if (!request) {
            return NextResponse.json({ status: null }, { status: 200 });
        }

        return NextResponse.json({
            status: request.status,
            requestId: request._id
        }, { status: 200 });

    } catch (error) {
        console.error('Error checking request status:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
