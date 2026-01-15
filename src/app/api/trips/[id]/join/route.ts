import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/lib/models/Trip';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const { userId, name, photoURL, message } = await req.json();

        const trip = await Trip.findById(params.id);

        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        // Check if user is already a participant
        if (trip.participants.some(p => p.userId === userId)) {
            return NextResponse.json({ message: 'Already joined this trip' }, { status: 400 });
        }

        // Check if trip is full
        if (trip.participants.length >= trip.maxParticipants) {
            return NextResponse.json({ message: 'Trip is full' }, { status: 400 });
        }

        // Check/Create Join Request
        const JoinRequest = (await import('@/lib/models/JoinRequest')).default;

        // Check if any request already exists for this user and trip
        const existingRequest = await JoinRequest.findOne({ tripId: params.id, userId });

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                return NextResponse.json({ message: 'Request already pending' }, { status: 400 });
            }
            if (existingRequest.status === 'accepted') {
                // Check if user is actually still a participant (handle stale data)
                const isStillParticipant = trip.participants.some(p => p.userId === userId);
                if (isStillParticipant) {
                    return NextResponse.json({ message: 'You are already a member of this trip' }, { status: 400 });
                }
                // User was removed but JoinRequest is stale - reset to pending
            }
            // If rejected or stale accepted, allow re-request by updating the existing document
            existingRequest.status = 'pending';
            existingRequest.message = message || "I'd like to join your trip!";
            existingRequest.userName = name;
            existingRequest.userPhoto = photoURL;
            await existingRequest.save();

            // Create notification for trip creator
            try {
                if (trip.userId !== userId) {
                    const Notification = (await import('@/lib/models/Notification')).default;
                    await Notification.create({
                        recipient: trip.userId,
                        sender: { userId, name, photoURL },
                        type: 'JOIN_REQUEST',
                        tripId: trip._id,
                        relatedId: existingRequest._id,
                        message: `${name} requested to join "${trip.title}"`,
                        read: false
                    });
                }
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
            }

            return NextResponse.json({ message: 'Request sent successfully', requestId: existingRequest._id }, { status: 200 });
        }

        const newRequest = await JoinRequest.create({
            tripId: params.id,
            userId,
            userName: name,
            userPhoto: photoURL,
            message: message || "I'd like to join your trip!",
            status: 'pending'
        });

        // Create notification for trip creator
        try {
            if (trip.userId !== userId) {
                const Notification = (await import('@/lib/models/Notification')).default;
                await Notification.create({
                    recipient: trip.userId,
                    sender: {
                        userId,
                        name,
                        photoURL
                    },
                    type: 'JOIN_REQUEST',
                    tripId: trip._id, // Keep tripId for context
                    relatedId: newRequest._id, // Link to the request for Accept/Decline actions
                    message: `${name} requested to join "${trip.title}"`,
                    read: false
                });
            }
        } catch (notifError) {
            console.error('Error creating notification:', notifError);
        }

        return NextResponse.json({ message: 'Request sent successfully', requestId: newRequest._id }, { status: 200 });
    } catch (error) {
        console.error('Error joining trip:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
