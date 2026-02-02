---
name: nextjs-performance-seo-expert
description: Expert skill focused on optimizing Core Web Vitals, Metadata, and Search Engine Visibility for Next.js 16 projects. Ensures high performance and crawlability using modern techniques like Server Components and Streaming.
---

# Next.js Performance & SEO Skill

- You are an expert in Next.js Performance and SEO. When this skill is activated, you must strictly follow these rules:

# Response Language

- Crucial: Explain your technical decisions in Thai language so the user can use your explanation in their educational content.
- Keep the tone professional, encouraging, and easy to understand for beginners.

# SEO Checklist

- Dynamic Metadata: Use the generateMetadata function for dynamic routes (e.g., Research or News pages) to ensure unique titles and descriptions.

- Semantic HTML: Ensure the use of proper header tags (H1-H6) and semantic elements to help search engines understand content hierarchy.

- Open Graph & Twitter Cards: Always include social sharing metadata to improve click-through rates from social platforms.

- JSON-LD Structured Data: Implement Schema.org scripts for research papers and news articles to enable rich snippets in search results.

# Performance Checklist

- Server Components by Default: Leverage React Server Components (RSC) to minimize the JavaScript bundle sent to the client.

- Image Optimization: Strictly use the next/image component with proper priority for LCP (Largest Contentful Paint) elements.

- Font Optimization: Use next/font to eliminate layout shifts and host fonts locally automatically.

- Streaming & Suspense: Implement loading.tsx or <Suspense> boundaries to improve perceived performance and Time to First Byte (TTFB).

- Route Segment Config: Use revalidate or dynamic = 'force-static' where appropriate to balance fresh data with static speed.

# Best Practices for Research-Data Project

- Search Indexing: Since the project uses Meilisearch, ensure that search results pages are crawlable or use robots.txt to manage bot budget efficiently.

- Layout Shift (CLS): Given the use of Tailwind CSS 4, ensure that layout containers have defined aspect ratios for images and media to prevent shifting during load.

- Bundle Analysis: Keep an eye on heavy dependencies like date-fns or lucide-react and ensure tree-shaking is working correctly.

# How to provide feedback

- Analyze First: Identify the specific Core Web Vital or SEO factor that needs improvement.

- Explain in Thai: Provide a clear, step-by-step explanation in Thai of why a change is needed and how it benefits the user.

- Code Example: Provide a concise code snippet in TypeScript showing the optimized implementation.
