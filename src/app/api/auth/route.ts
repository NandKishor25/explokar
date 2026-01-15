import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
    try {
        const { uid, email, name, photoURL } = await req.json();

        if (!uid || !email || !name) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const updatedUser = await User.findOneAndUpdate(
            { uid },
            { email, name, photoURL },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error creating/updating user:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
