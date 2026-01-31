"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, FileText, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";


// Basic Debounce Hook Implementation inline if not exists
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface SearchResult {
    id: string;
    title: string;
    abstract: string;
    filePath: string;
    _formatted?: {
        title?: string;
        abstract?: string;
    };
}

export function SearchBox() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounceValue(query, 300);

    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                const data = await res.json();
                setResults(data.hits || []);
                setIsOpen(true);
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative max-w-xl mx-auto" ref={containerRef}>
            <div className="relative flex items-center bg-white rounded-full p-1 shadow-2xl">
                <Search className="ml-4 h-5 w-5 text-gray-400" />
                <Input
                    className="border-0 shadow-none focus-visible:ring-0 text-black text-base py-6 rounded-full pl-3 placeholder:text-gray-400"
                    placeholder="ค้นหางานวิจัย, ชื่อผู้วิจัย, หรือหัวข้อ..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value) setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                />
                <Button size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white">
                    ค้นหา
                </Button>
            </div>

            {/* Results Dropdown */}
            {isOpen && (query.trim().length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-slate-100 animate-in fade-in slide-in-from-top-2">
                    {isLoading ? (
                        <div className="p-4 text-center text-slate-500 flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> กำลังค้นหา...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="max-h-[60vh] overflow-y-auto py-2">
                            {results.map((result) => (
                                <a
                                    key={result.id}
                                    href={result.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-3 hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-50"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg mt-1">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            {/* Use highlighted HTML if available, otherwise raw text */}
                                            <h4
                                                className="font-semibold text-slate-800 text-sm"
                                                dangerouslySetInnerHTML={{ __html: result._formatted?.title || result.title }}
                                            />
                                            <p
                                                className="text-xs text-slate-500 line-clamp-2 mt-1"
                                                dangerouslySetInnerHTML={{ __html: result._formatted?.abstract || result.abstract || "ไม่มีรายละเอียด" }}
                                            />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-slate-500">
                            ไม่พบข้อมูลที่ตรงกับคำค้นหา
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
