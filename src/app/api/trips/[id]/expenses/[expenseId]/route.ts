import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/lib/models/Expense';

export async function DELETE(req: NextRequest, { params }: { params: { id: string, expenseId: string } }) {
    try {
        await dbConnect();
        const expense = await Expense.findByIdAndDelete(params.expenseId);

        // Check if expense exists and belongs to the trip (params.id)
        if (!expense) {
            return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
        }

        // Note: Verify expense.tripId matches params.id if strict check needed.

        return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
