'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface Props {
  label: string;
  placeholder?: string;
  value: Location | null;
  onChange: (location: Location) => void;
  showCurrentLocation?: boolean;
}

export default function LocationSearch({ label, placeholder, value, onChange, showCurrentLocation = false }: Props) {
  const [query, setQuery] = useState(value?.address || '');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchAddress = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 3) { setResults([]); setShowDropdown(false); return; }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const selectResult = (result: NominatimResult) => {
    const loc: Location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
    setQuery(result.display_name);
    setShowDropdown(false);
    onChange(loc);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          setQuery(address);
          onChange({ lat: latitude, lng: longitude, address });
        } catch {
          setQuery(`${latitude}, ${longitude}`);
          onChange({ lat: latitude, lng: longitude, address: `${latitude}, ${longitude}` });
        } finally {
          setIsGeolocating(false);
        }
      },
      () => { setIsGeolocating(false); }
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder || 'Search for a location…'}
            value={query}
            onChange={(e) => searchAddress(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
          {value && !isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500" />
          )}
        </div>

        {showCurrentLocation && (
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={isGeolocating}
            title="Use my current location"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl border border-blue-200 text-sm font-medium transition disabled:opacity-50 whitespace-nowrap"
          >
            {isGeolocating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Navigation className="w-4 h-4" />
            }
            <span className="hidden sm:inline">My Location</span>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => selectResult(r)}
              className="flex items-start gap-2 px-4 py-3 hover:bg-blue-50 cursor-pointer transition border-b last:border-0"
            >
              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 leading-snug line-clamp-2">{r.display_name}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Selected coords (subtle display) */}
      {value && (
        <p className="mt-1 text-xs text-gray-400">
          {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
        </p>
      )}
    </div>
  );
}
