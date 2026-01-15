import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/lib/models/Expense';
import Trip from '@/lib/models/Trip';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const dateQuery = await Expense.find({ tripId: params.id }).sort({ date: -1 });
        return NextResponse.json(dateQuery, { status: 200 });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const body = await req.json();
        const { description, amount, category, date, paidBy, splitAmong } = body;

        const trip = await Trip.findById(params.id);
        if (!trip) {
            return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
        }

        const newExpense = new Expense({
            tripId: trip._id,
            description,
            amount,
            category,
            date,
            paidBy,
            splitAmong
        });

        await newExpense.save();
        return NextResponse.json(newExpense, { status: 201 });
    } catch (error) {
        console.error('Error adding expense:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
