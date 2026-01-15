import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review';
import User from '@/lib/models/User';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        await dbConnect();
        const reviews = await Review.find({ reviewee: params.userId }).sort({ createdAt: -1 });

        const reviewsWithDetails = await Promise.all(reviews.map(async (review) => {
            const reviewerUser = await User.findOne({ uid: review.reviewer });
            return {
                ...review.toObject(),
                reviewer: {
                    uid: review.reviewer,
                    name: reviewerUser ? reviewerUser.name : 'Unknown',
                    photoURL: reviewerUser ? reviewerUser.photoURL : ''
                }
            };
        }));

        return NextResponse.json(reviewsWithDetails, { status: 200 });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
