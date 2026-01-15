import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/lib/models/Trip';
import Notification from '@/lib/models/Notification';
import JoinRequest from '@/lib/models/JoinRequest';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; participantId: string } }
) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id, participantId } = params;

        const trip = await Trip.findById(id);
        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        // Only the trip creator can remove participants
        if (trip.userId !== userId) {
            return NextResponse.json({ message: 'Only the trip creator can remove participants' }, { status: 403 });
        }

        // Cannot remove the creator themselves
        if (participantId === trip.userId) {
            return NextResponse.json({ message: 'Cannot remove the trip creator' }, { status: 400 });
        }

        // Check if participant exists
        const participantIndex = trip.participants.findIndex(p => p.userId === participantId);
        if (participantIndex === -1) {
            return NextResponse.json({ message: 'Participant not found in this trip' }, { status: 404 });
        }

        // Remove participant
        trip.participants.splice(participantIndex, 1);
        await trip.save();

        // Delete the JoinRequest record so the user can request to join again
        try {
            await JoinRequest.deleteOne({ tripId: id, userId: participantId });
        } catch (joinReqError) {
            console.error('Error deleting JoinRequest for removed participant:', joinReqError);
        }

        // Notify the removed user
        try {
            await Notification.create({
                recipient: participantId,
                sender: {
                    userId: trip.userId,
                    name: 'System', // Or trip creator name
                    photoURL: ''
                },
                type: 'PARTICIPANT_REMOVED',
                tripId: trip._id,
                message: `You have been removed from the trip "${trip.title}"`,
                read: false
            });
        } catch (notifError) {
            console.error('Error creating notification for removed participant:', notifError);
        }

        return NextResponse.json({ message: 'Participant removed successfully', trip }, { status: 200 });

    } catch (error) {
        console.error('Error removing participant:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
