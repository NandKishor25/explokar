import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import JoinRequest from '@/lib/models/JoinRequest';
import Trip from '@/lib/models/Trip';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

// GET - Fetch request details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const request = await JoinRequest.findById(params.id);
        if (!request) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        // Fetch the trip
        const trip = await Trip.findById(request.tripId);
        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        // Only allow trip creator or the requester to view
        if (trip.userId !== userId && request.userId !== userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json({
            request: {
                _id: request._id,
                tripId: request.tripId,
                userId: request.userId,
                userName: request.userName,
                userPhoto: request.userPhoto,
                status: request.status,
                message: request.message,
                createdAt: request.createdAt
            },
            trip: {
                _id: trip._id,
                title: trip.title,
                destination: trip.destination,
                imageUrl: trip.imageUrl
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching request:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { status } = await req.json();

        if (!['accepted', 'rejected'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const request = await JoinRequest.findById(params.id);
        if (!request) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        if (request.status !== 'pending') {
            return NextResponse.json({ message: 'Request already processed' }, { status: 400 });
        }

        // Verify that the current user is the trip creator
        const trip = await Trip.findById(request.tripId);
        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        if (trip.userId !== userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Process request
        request.status = status;
        await request.save();

        if (status === 'accepted') {
            // Add to participants
            trip.participants.push({
                userId: request.userId,
                name: request.userName,
                photoURL: request.userPhoto
            });
            await trip.save();
        }

        // Notify user
        try {
            await Notification.create({
                recipient: request.userId,
                sender: {
                    userId: trip.userId, // Creator
                    name: 'System', // Or creator name if we fetch it
                    photoURL: ''
                },
                type: status === 'accepted' ? 'REQUEST_ACCEPTED' : 'REQUEST_DECLINED',
                tripId: trip._id,
                message: `Your request to join "${trip.title}" was ${status}`,
                read: false
            });
        } catch (e) {
            console.error('Error sending notification to requester', e);
        }

        return NextResponse.json({ message: `Request ${status}` }, { status: 200 });

    } catch (error) {
        console.error('Error updating request:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
