"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { FileText, Phone, MapPin, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Map string keys to Lucide components (same as page.tsx)
const ICON_MAP: Record<string, any> = {
    FileText, Phone, MapPin, BookOpen
};

interface ServiceCardProps {
    title: string;
    icon: string;
    image?: string;
    desc: string;
    href: string; // URL link or '#'
    detail?: string; // Modal content
}

export function ServiceCard({ title, icon, image, desc, href, detail }: ServiceCardProps) {
    const IconComp = ICON_MAP[icon] || FileText;
    const [isOpen, setIsOpen] = useState(false);

    // Logic: If href is '#' AND there is detail content, show Modal.
    // Otherwise, treat as a normal Link.
    const isModal = (href === '#' || !href) && !!detail;

    const CardContent = (
        <div className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-transparent hover:border-blue-100 h-full flex flex-col items-center text-center relative overflow-hidden pb-8 ${isModal ? '' : ''}`}>
             
             {/* Image or Icon Area */}
             {image ? (
                <div className="w-full h-48 relative overflow-hidden mb-6">
                     <div className="absolute top-0 left-0 w-full h-full bg-slate-200 animate-pulse" />
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img 
                        src={image} 
                        alt={title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                     />
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
            ) : (
                <div className="mt-8 h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-lg overflow-hidden relative z-10 mx-auto">
                    <IconComp className="h-10 w-10" />
                </div>
            )}

            <div className="px-6 flex-1 flex flex-col justify-between w-full">
                <div>
                    <h3 className="font-bold text-xl mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto line-clamp-3">{desc}</p>
                </div>
                
                 <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 text-sm font-semibold flex items-center justify-center gap-1">
                    {isModal ? "ดูรายละเอียด" : "ไปที่บริการ"} <ArrowRight className="w-4 h-4" />
                 </div>
            </div>

            {!image && (
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </div>
    );

    if (isModal) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    {CardContent}
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <span className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <IconComp className="w-6 h-6" />
                            </span>
                            {title}
                        </DialogTitle>
                        <DialogDescription>
                            {desc}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4 prose text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {detail || "ไม่พบข้อมูลรายละเอียด"}
                    </div>

                    {/* Optional: Add a close or action button if needed inside modal */}
                </DialogContent>
            </Dialog>
        );
    }

    // Default Link Behavior
    return (
        <Link href={href || '#'}>
            {CardContent}
        </Link>
    );
}
