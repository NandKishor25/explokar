import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
    tripId: mongoose.Schema.Types.ObjectId;
    description: string;
    amount: number;
    category: string;
    date: Date;
    paidBy: string; // userId
    splitAmong: string[]; // userIds
    createdAt: Date;
}

const expenseSchema = new Schema<IExpense>({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    paidBy: { type: String, required: true },
    splitAmong: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;
