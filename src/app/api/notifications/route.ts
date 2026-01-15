import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';

// GET: Fetch notifications for the current user
export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        // Count unread
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            read: false
        });

        return NextResponse.json({ notifications, unreadCount }, { status: 200 });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// PUT: Mark notifications as read
export async function PUT(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { notificationId, markAll } = body;

        await dbConnect();

        if (markAll) {
            await Notification.updateMany(
                { recipient: userId, read: false },
                { $set: { read: true } }
            );
        } else if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { $set: { read: true } }
            );
        } else {
            return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Notifications updated' }, { status: 200 });

    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
