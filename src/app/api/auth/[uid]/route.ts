import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(req: NextRequest, { params }: { params: { uid: string } }) {
    try {
        await dbConnect();
        const user = await User.findOne({ uid: params.uid });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { uid: string } }) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, photoURL, bio, location, interests } = body;

        const user = await User.findOne({ uid: params.uid });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (name) user.name = name;
        if (photoURL) user.photoURL = photoURL;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (Array.isArray(interests)) user.interests = interests;

        await user.save();
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { uid: string } }) {
    try {
        await dbConnect();
        const user = await User.findOneAndDelete({ uid: params.uid });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
