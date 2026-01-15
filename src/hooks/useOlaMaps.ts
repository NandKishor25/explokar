import { useState, useCallback } from 'react';
import axios from 'axios';

interface PlaceSuggestion {
    place_id: string;
    description: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
}

interface UseOlaPlacesAutocompleteResult {
    suggestions: PlaceSuggestion[];
    loading: boolean;
    error: string | null;
    getSuggestions: (query: string) => void;
    clearSuggestions: () => void;
}

const API_KEY = 'tDJKPR8T7gl1yNKvDZhYJGTQ5YASTzrCbWR3Yd4k';

export const useOlaPlacesAutocomplete = (): UseOlaPlacesAutocompleteResult => {
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Custom debounce implementation
    const debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `https://api.olamaps.io/places/v1/autocomplete`,
                {
                    params: {
                        input: query,
                        api_key: API_KEY,
                    },
                }
            );

            if (response.data && response.data.predictions) {
                setSuggestions(response.data.predictions);
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            console.error('Error fetching Ola Maps suggestions:', err);
            // Don't show technical errors to user, just clear suggestions
            setError('Failed to fetch location suggestions');
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced version of fetchSuggestions
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetch = useCallback(debounce(fetchSuggestions, 500), []);

    const getSuggestions = (query: string) => {
        debouncedFetch(query);
    };

    const clearSuggestions = () => {
        setSuggestions([]);
    };

    return { suggestions, loading, error, getSuggestions, clearSuggestions };
};
