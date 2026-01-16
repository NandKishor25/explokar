export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

export interface Participant {
    userId: string;
    name: string;
    photoURL: string;
}

export interface Creator {
    name: string;
    photoURL: string;
    email?: string;
}

export interface Trip {
    _id: string;
    title: string;
    startLocation: string;
    destination: string;
    startDate: string;
    duration: number;
    maxParticipants: number;
    preferredGender: string;
    transportMode: string;
    description: string;
    budget: number;
    activities: string;
    imageUrl: string;
    userId: string;
    createdBy: Creator;
    participants: Participant[];
}

export interface Comment {
    _id: string;
    tripId: string;
    userId: string;
    userName: string;
    userPhoto: string;
    text: string;
    createdAt: string;
}

export interface Expense {
    _id: string;
    tripId: string;
    description: string;
    amount: number;
    paidBy: string; // userId
    splitAmong: string[]; // userIds
    date: string;
    category: string;
    createdAt: string;
}

export interface Review {
    _id: string;
    reviewer: string | { name: string; photoURL: string; uid: string };
    reviewee: string;
    tripId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface INotification {
    _id: string;
    recipient: string;
    sender: {
        userId: string;
        name: string;
        photoURL?: string;
    };
    type: 'TRIP_JOIN' | 'MESSAGE' | 'TRIP_LEAVE' | 'SYSTEM' | 'JOIN_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_DECLINED';
    tripId?: string;
    relatedId?: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export interface ChatMessage {
    _id: string;
    tripId: string;
    senderId: string;
    senderName: string;
    senderPhoto: string;
    message: string;
    createdAt: string;
}
