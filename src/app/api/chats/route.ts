import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/lib/models/Trip';
import User from '@/lib/models/User';
import ChatMessage from '@/lib/models/ChatMessage';

export const dynamic = 'force-dynamic';

// GET - Fetch all trips user is part of (for inbox)
export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Find all trips where user is creator OR a participant
        const trips = await Trip.find({
            $or: [
                { userId: userId }, // User is creator
                { 'participants.userId': userId } // User is participant
            ]
        })
            .sort({ createdAt: -1 });

        // Get last message and creator info for each trip
        const tripsWithDetails = await Promise.all(
            trips.map(async (trip) => {
                // Get creator info
                const creator = await User.findOne({ uid: trip.userId });

                // Get last message
                const lastMessage = await ChatMessage.findOne({ tripId: trip._id.toString() })
                    .sort({ createdAt: -1 })
                    .lean();

                // Count messages
                const messageCount = await ChatMessage.countDocuments({ tripId: trip._id.toString() });

                return {
                    _id: trip._id,
                    title: trip.title,
                    destination: trip.destination,
                    imageUrl: trip.imageUrl,
                    createdBy: {
                        name: creator ? creator.name : 'Unknown',
                        photoURL: creator ? creator.photoURL : ''
                    },
                    participants: trip.participants,
                    isCreator: trip.userId === userId,
                    lastMessage: lastMessage ? {
                        message: lastMessage.message,
                        senderName: lastMessage.senderName,
                        createdAt: lastMessage.createdAt
                    } : null,
                    messageCount
                };
            })
        );

        return NextResponse.json(tripsWithDetails, { status: 200 });

    } catch (error) {
        console.error('Error fetching user chats:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
