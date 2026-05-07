// app/articles/[slug]/page.tsx
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import {
  getArticleBySlug,
  getArticleSlugs,
  getRelatedArticles,
} from "@/lib/mdx/mdx";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { generateArticleSchema } from "@/lib/structured-data";
import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { ArticleListItem } from "@/components/articles/ArticlesBrowser";

const AUTHOR_AVATAR = "/images/avatar.jpg";

// Fully static — MDX is bundled at build time; fs access at runtime is not
// available on Cloudflare Workers so we skip revalidation entirely.
export const dynamic = "force-static";
export const dynamicParams = false;

// Generate static paths
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const canonical = `/articles/${article.slug}`;
  const ogImages = article.imageSrc
    ? [{ url: article.imageSrc, alt: article.imageAlt || article.title }]
    : undefined;

  return {
    title: article.title,
    description: article.summary,
    authors: [{ name: article.author || siteConfig.name }],
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      modifiedTime: article.updated || article.date,
      authors: [article.author || siteConfig.name],
      tags: article.tags,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: article.imageSrc ? [article.imageSrc] : undefined,
    },
  };
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(slug, 3);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
    { name: article.title, url: `/articles/${article.slug}` },
  ];

  const author = article.author || siteConfig.name;

  // Map related articles to the shared ArticleListItem shape so the
  // ArticleCard renders them identically to /articles.
  const related: ArticleListItem[] = relatedArticles.map((a) => ({
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    date: a.date,
    category: a.category,
    tags: a.tags,
    featured: a.featured,
    imageSrc: a.imageSrc,
    imageAlt: a.imageAlt,
    readingTime: a.readingTime,
    author: a.author,
  }));

  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={generateArticleSchema({
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          date: article.date,
          updated: article.updated,
          imageSrc: article.imageSrc,
          tags: article.tags,
          readingTime: article.readingTime,
        })}
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Breadcrumbs
          items={breadcrumbs}
          truncateLastAt={32}
          className="mb-8"
        />

        {/* Left-aligned header — no TOC sidebar */}
        <header className="mb-10">
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {article.title}
          </h1>

          {/* Author + date — single row directly under the title */}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="relative h-7 w-7 flex-none overflow-hidden rounded-full ring-1 ring-white/10">
              <Image
                src={AUTHOR_AVATAR}
                alt=""
                fill
                sizes="28px"
                className="object-cover"
              />
            </span>
            <span className="font-medium text-foreground">{author}</span>
            <span aria-hidden className="text-muted-foreground/60">
              ·
            </span>
            <span>{formatDate(article.date)}</span>
          </div>

          {article.summary && (
            <p className="mt-5 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              {article.summary}
            </p>
          )}

          {article.updated && article.updated !== article.date && (
            <p className="mt-3 text-xs text-muted-foreground/80">
              Last updated on {formatDate(article.updated)}
            </p>
          )}
        </header>

        {/* Cover image */}
        {article.imageSrc && (
          <figure className="mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageSrc}
              alt={article.imageAlt || article.title}
              className="w-full rounded-xl border border-white/10"
            />
          </figure>
        )}

        {/* Body — single column, no TOC sidebar */}
        <article className="min-w-0">
          <MdxRenderer source={article.content} />
        </article>

        {/* Back to all */}
        <nav className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
        </nav>
      </div>

      {/* Related posts — 3 cards in a row on desktop, same card style as
          /articles. Uses the wider container so the grid breathes. */}
      {related.length > 0 && (
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-semibold">Related Posts</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ArticleCard key={r.slug} article={r} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
