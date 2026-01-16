import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/lib/models/ChatMessage';
import Trip from '@/lib/models/Trip';

export const dynamic = 'force-dynamic';

// Helper function to check if user is a trip participant
async function isUserTripParticipant(tripId: string, userId: string): Promise<boolean> {
    const trip = await Trip.findById(tripId);
    if (!trip) return false;

    // Check if user is creator
    if (trip.userId === userId) return true;

    // Check if user is a participant
    return trip.participants.some((p: { userId: string }) => p.userId === userId);
}

// GET - Fetch all messages for a trip
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Check if user is a participant
        const isParticipant = await isUserTripParticipant(params.id, userId);
        if (!isParticipant) {
            return NextResponse.json({ message: 'Only trip participants can access the chat' }, { status: 403 });
        }

        // Fetch messages sorted by creation time
        const messages = await ChatMessage.find({ tripId: params.id })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json(messages, { status: 200 });

    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// POST - Send a new message
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Check if user is a participant
        const isParticipant = await isUserTripParticipant(params.id, userId);
        if (!isParticipant) {
            return NextResponse.json({ message: 'Only trip participants can send messages' }, { status: 403 });
        }

        const { senderName, senderPhoto, message } = await req.json();

        if (!message || !message.trim()) {
            return NextResponse.json({ message: 'Message cannot be empty' }, { status: 400 });
        }

        // Create new message
        const newMessage = await ChatMessage.create({
            tripId: params.id,
            senderId: userId,
            senderName: senderName || 'User',
            senderPhoto: senderPhoto || '',
            message: message.trim()
        });

        return NextResponse.json(newMessage, { status: 201 });

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
