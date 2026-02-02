import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import prisma from "@/lib/db";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CalendarDays } from "lucide-react";

// Re-validate every 60 seconds
export const revalidate = 60;

export default async function NewsPage() {
    const newsList = await prisma.news.findMany({
        where: {
            published: true,
        },
        orderBy: {
            publishDate: "desc",
        },
    });

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "ข่าวสารและประกาศ | สำนักงานส่งเสริมวิจัย",
        "description": "ติดตามข่าวสารล่าสุด ประกาศทุนวิจัย และกิจกรรมที่น่าสนใจ",
        "url": "https://research-hospital.com/news", // Replace with actual domain
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": newsList.map((news, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://research-hospital.com/news/${news.id}`,
                "name": news.title
            }))
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">ข่าวสารและประกาศ</h1>
                    <p className="text-lg text-slate-600">ติดตามข่าวสารล่าสุด ประกาศทุนวิจัย และกิจกรรมที่น่าสนใจ</p>
                </div>

                {newsList.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-lg">ยังไม่มีรายการข่าวสารในขณะนี้</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {newsList.map((news) => (
                            <Link href={`/news/${news.id}`} key={news.id} className="group h-full">
                                <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col">
                                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                        {news.imageUrl ? (
                                            <Image
                                                src={news.imageUrl}
                                                alt={news.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 z-10">
                                             <Badge variant="secondary" className="bg-white/90 text-slate-700 backdrop-blur-sm shadow-sm hover:bg-white">
                                                งานวิจัย
                                             </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center text-sm text-slate-500 mb-2">
                                            <CalendarDays className="mr-1.5 h-4 w-4 text-blue-500" />
                                            {format(news.publishDate, "d MMMM yyyy", { locale: th })}
                                        </div>
                                        <CardTitle className="line-clamp-2 group-hover:text-blue-700 transition-colors">
                                            {news.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-slate-600 text-sm line-clamp-3">
                                            {news.content}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-0 pb-6 border-t border-slate-50 mt-auto">
                                        <div className="flex items-center text-blue-600 text-sm font-medium mt-4 group-hover:underline decoration-2 underline-offset-4">
                                            อ่านเพิ่มเติม <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
