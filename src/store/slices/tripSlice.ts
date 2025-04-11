import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  city: string;
  formatted_address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Trip {
  id: string;
  user_id: string;
  start_location: Location;
  destination: Location;
  start_date: string;
  days_of_vacation: number;
  number_of_buddies: number;
  preferred_gender: 'Male' | 'Female' | 'Any';
  mode_of_travel: string;
  description: string;
  images: string[];
  created_at: string;
}

interface TripState {
  trips: Trip[];
  userTrips: Trip[];
  loading: boolean;
  error: string | null;
  selectedTrip: Trip | null;
}

const initialState: TripState = {
  trips: [],
  userTrips: [],
  loading: false,
  error: null,
  selectedTrip: null,
};

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setTrips: (state, action: PayloadAction<Trip[]>) => {
      state.trips = action.payload;
      state.loading = false;
      state.error = null;
    },
    setUserTrips: (state, action: PayloadAction<Trip[]>) => {
      state.userTrips = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTrip: (state, action: PayloadAction<Trip>) => {
      state.trips.push(action.payload);
      state.userTrips.push(action.payload);
    },
    updateTrip: (state, action: PayloadAction<Trip>) => {
      const index = state.trips.findIndex(trip => trip.id === action.payload.id);
      if (index !== -1) {
        state.trips[index] = action.payload;
      }
      const userIndex = state.userTrips.findIndex(trip => trip.id === action.payload.id);
      if (userIndex !== -1) {
        state.userTrips[userIndex] = action.payload;
      }
    },
    deleteTrip: (state, action: PayloadAction<string>) => {
      state.trips = state.trips.filter(trip => trip.id !== action.payload);
      state.userTrips = state.userTrips.filter(trip => trip.id !== action.payload);
    },
    setSelectedTrip: (state, action: PayloadAction<Trip | null>) => {
      state.selectedTrip = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setTrips,
  setUserTrips,
  addTrip,
  updateTrip,
  deleteTrip,
  setSelectedTrip,
  setLoading,
  setError,
} = tripSlice.actions;

export default tripSlice.reducer; 