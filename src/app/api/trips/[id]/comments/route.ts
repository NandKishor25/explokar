import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/lib/models/Comment';
import Trip from '@/lib/models/Trip';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const comments = await Comment.find({ tripId: params.id }).sort({ createdAt: 1 });
        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const { userId, userName, userPhoto, text } = await req.json();

        const trip = await Trip.findById(params.id);
        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        const newComment = new Comment({
            tripId: trip._id,
            userId,
            userName,
            userPhoto,
            text
        });

        await newComment.save();

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
