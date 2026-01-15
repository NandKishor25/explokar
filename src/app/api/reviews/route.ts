import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review';
import Trip from '@/lib/models/Trip';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { reviewer, reviewee, tripId, rating, comment } = body;

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        const existingReview = await Review.findOne({ reviewer, reviewee, tripId });
        if (existingReview) {
            return NextResponse.json({ message: 'You have already reviewed this user for this trip' }, { status: 400 });
        }

        const newReview = new Review({
            reviewer,
            reviewee,
            tripId,
            rating,
            comment
        });

        await newReview.save();

        const reviews = await Review.find({ reviewee });
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / (totalReviews || 1);

        await User.findOneAndUpdate(
            { uid: reviewee },
            {
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalReviews
            }
        );

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
