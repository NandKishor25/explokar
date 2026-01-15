import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import toast from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reviewerId: string;
    revieweeId: string;
    revieweeName: string;
    tripId: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, reviewerId, revieweeId, revieweeName, tripId }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);
            await reviewService.createReview({
                reviewer: reviewerId,
                reviewee: revieweeId,
                tripId,
                rating,
                comment
            });
            toast.success(`Review submitted for ${revieweeName}`);
            onClose();
            // Reset form
            setRating(0);
            setComment('');
        } catch (error: any) {
            console.error('Error submitting review:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to submit review');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto w-screen h-screen">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Rate {revieweeName}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mt-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                    <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="focus:outline-none transition-colors"
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => setRating(star)}
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                                            ? 'text-amber-400 fill-current'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {rating > 0 ? `You selected ${rating} stars` : 'Select stars to rate'}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                        Comment
                                    </label>
                                    <textarea
                                        id="comment"
                                        rows={4}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border"
                                        placeholder="Share your experience travelling with them..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    ></textarea>
                                </div>

                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
