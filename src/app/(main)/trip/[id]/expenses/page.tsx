'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { tripService } from '@/services/tripService';
import { Expense, Trip } from '@/types';
import { Plus, Trash2, ArrowLeft, DollarSign, PieChart, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Expenses = () => {
    const params = useParams();
    const id = params?.id as string;
    const { currentUser } = useAuth();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [tripData, expensesData] = await Promise.all([
                    tripService.getTripById(id),
                    tripService.getExpenses(id)
                ]);
                setTrip(tripData);
                setExpenses(expensesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load expenses');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !currentUser) return;

        try {
            const addedExpense = await tripService.addExpense(id, {
                ...newExpense,
                amount: parseFloat(newExpense.amount),
                paidBy: currentUser.uid,
                splitAmong: trip?.participants.map(p => p.userId) || [],
                tripId: id
            });
            setExpenses([...expenses, addedExpense]);
            setShowForm(false);
            setNewExpense({ description: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
            toast.success('Expense added');
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Failed to add expense');
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!id) return;
        if (!window.confirm('Delete this expense?')) return;
        try {
            await tripService.deleteExpense(id, expenseId);
            setExpenses(expenses.filter(e => e._id !== expenseId));
            toast.success('Expense deleted');
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense');
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const myShare = trip?.participants ? totalExpenses / trip.participants.length : 0;

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
    if (!trip) return <div className="text-center py-20">Trip not found</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href={`/trip/${id}`} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Trip
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                        <p className="text-gray-500">Manage costs for {trip.title}</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add Expense
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Participants</p>
                        <p className="text-2xl font-bold text-gray-900">{trip.participants.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full text-purple-600 mr-4">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Per Person</p>
                        <p className="text-2xl font-bold text-gray-900">${myShare.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Add Expense Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Expense</h3>
                    <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Description (e.g., Dinner)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={newExpense.description}
                            onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                            required
                        />
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                placeholder="Amount"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={newExpense.amount}
                                onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={newExpense.category}
                            onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                        >
                            <option>Food</option>
                            <option>Transport</option>
                            <option>Accommodation</option>
                            <option>Activity</option>
                            <option>Other</option>
                        </select>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={newExpense.date}
                            onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                            required
                        />
                        <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                            Save Expense
                        </button>
                    </form>
                </div>
            )}

            {/* Expense List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid By</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No expenses recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map(expense => (
                                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {expense.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* In a real app we'd map ID to name, for now just show 'User' or ID */}
                                            {trip.participants.find(p => p.userId === expense.paidBy)?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            ${expense.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteExpense(expense._id)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
