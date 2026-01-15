import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Trip from '@/lib/models/Trip';
import Review from '@/lib/models/Review';

export const dynamic = 'force-dynamic';

// GET - Fetch public user profile
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        // Find user by uid
        const user = await User.findOne({ uid: params.id });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Fetch user's trips
        const trips = await Trip.find({ userId: params.id }).sort({ createdAt: -1 }).limit(6);

        // Fetch reviews about this user
        const reviews = await Review.find({ reviewee: params.id }).sort({ createdAt: -1 });

        return NextResponse.json({
            user: {
                uid: user.uid,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                bio: user.bio || '',
                location: user.location || '',
                createdAt: user.createdAt
            },
            trips: trips.map(t => ({
                _id: t._id,
                title: t.title,
                destination: t.destination,
                startDate: t.startDate,
                imageUrl: t.imageUrl,
                participants: t.participants?.length || 0,
                maxParticipants: t.maxParticipants
            })),
            reviews: reviews,
            stats: {
                tripsCreated: trips.length,
                averageRating: reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : null,
                reviewCount: reviews.length
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
