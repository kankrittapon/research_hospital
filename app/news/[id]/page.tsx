import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar } from "lucide-react";
import { Metadata } from "next";

interface NewsDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const news = await prisma.news.findUnique({
        where: { id },
    });

    if (!news) {
        return {
            title: "News Not Found",
            robots: { index: false, follow: false }
        };
    }

    const compiledTitle = `${news.title} | สำนักงานส่งเสริมวิจัย`;
    const description = news.content.substring(0, 160);

    return {
        title: compiledTitle,
        description: description,
        openGraph: {
            title: compiledTitle,
            description: description,
            type: "article",
            publishedTime: news.publishDate.toISOString(),
            modifiedTime: news.updatedAt.toISOString(),
            authors: ["Sirikit Hospital Research Promotion Office"],
            images: news.imageUrl ? [{ url: news.imageUrl, alt: news.title }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: compiledTitle,
            description: description,
            images: news.imageUrl ? [news.imageUrl] : [],
        },
        alternates: {
            canonical: `/news/${id}`,
        }
    };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
    const { id } = await params;
    
    // In strict mode we should check publish status too, but for now we just show it if it exists
    const news = await prisma.news.findUnique({
        where: { id },
    });

    if (!news) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": news.title,
        "image": news.imageUrl ? [news.imageUrl] : [],
        "datePublished": news.publishDate.toISOString(),
        "dateModified": news.updatedAt.toISOString(),
        "author": [{
            "@type": "Organization",
            "name": "Sirikit Hospital Research Promotion Office",
            "url": "https://research-hospital.com"
        }]
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 relative">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="absolute top-0 left-0 w-full h-80 bg-slate-900 -z-0"></div>
            
            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <Button variant="ghost" className="mb-6 text-white hover:text-white/80 hover:bg-white/10" asChild>
                    <Link href="/news">
                        <ChevronLeft className="mr-2 h-4 w-4" /> กลับหน้ารวมข่าว
                    </Link>
                </Button>

                <article className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[500px]">
                    {news.imageUrl && (
                        <div className="w-full aspect-video md:aspect-[21/9] bg-slate-100 relative">
                             <Image
                                src={news.imageUrl}
                                alt={news.title}
                                fill
                                priority
                                className="object-cover"
                            />
                        </div>
                    )}
                    
                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 border-b border-slate-100 pb-6">
                            <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                {format(news.publishDate, "d MMMM yyyy", { locale: th })}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-tight">
                            {news.title}
                        </h1>

                        <div className="prose prose-slate lg:prose-lg max-w-none text-slate-700 whitespace-pre-wrap">
                            {news.content}
                        </div>
                    </div>
                </article>

            </div>
        </div>
    );
}
