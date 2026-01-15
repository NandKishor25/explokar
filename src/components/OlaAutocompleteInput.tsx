import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useOlaPlacesAutocomplete } from '../hooks/useOlaMaps';

interface OlaAutocompleteInputProps {
    label?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPlaceSelect: (placeName: string, coords?: { lat: number; lng: number } | null) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    containerClassName?: string;
}

const OlaAutocompleteInput: React.FC<OlaAutocompleteInputProps> = ({
    label,
    name,
    value,
    onChange,
    onPlaceSelect,
    placeholder = 'Search for a location',
    required = false,
    className = '',
    containerClassName = ''
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { suggestions, loading, getSuggestions, clearSuggestions } = useOlaPlacesAutocomplete();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(e); // Propagate change to parent form

        if (newValue.length > 2) {
            getSuggestions(newValue);
            setShowSuggestions(true);
        } else {
            clearSuggestions();
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: any) => {
        const description = suggestion.description;
        setInputValue(description);

        // Use coordinates directly from the suggestion
        const coords = suggestion.geometry?.location || null;

        onPlaceSelect(description, coords);
        setShowSuggestions(false);
        clearSuggestions();
    };

    return (
        <div className={`relative ${containerClassName}`} ref={wrapperRef}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    id={name}
                    name={name}
                    required={required}
                    value={inputValue}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="animate-spin text-indigo-500" size={18} />
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.place_id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-0"
                        >
                            <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
                            <div className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OlaAutocompleteInput;
