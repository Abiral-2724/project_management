"use client";
import { useState } from "react";
import { MarketingNav, MarketingFooter, PageHero } from "../../components/layout/Marketinglayout";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

const TAGS = ["All", "Product", "Engineering", "AI", "Design", "Company", "Guides"];

const POSTS = [
  {
    slug: "ai-project-management-2025",
    tag: "AI",
    title: "How AI is quietly transforming project management",
    excerpt: "We analyzed how 10,000 teams use Planzo AI features and found three patterns that separate high-performing teams from the rest.",
    author: { name: "Ananya Reddy", initials: "AR", color: "#3b82f6" },
    date: "Mar 4, 2026",
    readTime: "8 min read",
    featured: true,
  },
  {
    slug: "building-realtime-collab",
    tag: "Engineering",
    title: "Building real-time collaboration at scale with Socket.IO",
    excerpt: "A deep dive into how we handle 50,000 concurrent WebSocket connections, manage state sync, and keep latency under 50ms globally.",
    author: { name: "Priya Sharma", initials: "PS", color: "#8b5cf6" },
    date: "Feb 24, 2026",
    readTime: "12 min read",
    featured: false,
  },
  {
    slug: "gantt-charts-design",
    tag: "Design",
    title: "Why we rebuilt our Gantt chart from scratch — twice",
    excerpt: "The first version was technically correct and aesthetically lifeless. Here's what we learned from throwing it away.",
    author: { name: "Ravi Iyer", initials: "RI", color: "#ec4899" },
    date: "Feb 17, 2026",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "getting-started-guide",
    tag: "Guides",
    title: "The Planzo getting started guide your team will actually read",
    excerpt: "Most onboarding docs are written for software robots. This one is written for humans who have 20 minutes and a backlog.",
    author: { name: "Kabir Singh", initials: "KS", color: "#10b981" },
    date: "Feb 10, 2026",
    readTime: "5 min read",
    featured: false,
  },
  {
    slug: "overdue-task-science",
    tag: "Product",
    title: "The science of overdue tasks (and how we nudge you back on track)",
    excerpt: "We built overdue alerts, studied the data, and discovered that the best reminder isn't the most urgent one.",
    author: { name: "Arjun Mehta", initials: "AM", color: "#6366f1" },
    date: "Jan 29, 2026",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "remote-team-rituals",
    tag: "Company",
    title: "The six rituals that keep our remote team aligned",
    excerpt: "We haven't had a headquarters since 2022. These are the practices that replaced office osmosis.",
    author: { name: "Divya Nair", initials: "DN", color: "#f59e0b" },
    date: "Jan 15, 2026",
    readTime: "9 min read",
    featured: false,
  },
];

function PostCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`}
      className="group flex flex-col p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ color: "#a78bfa", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
          {post.tag}
        </span>
        <span className="text-xs text-zinc-600">{post.readTime}</span>
      </div>
      <h3 className="text-base font-semibold text-zinc-200 leading-snug mb-3 group-hover:text-white transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-zinc-500 leading-relaxed flex-1 mb-5">{post.excerpt}</p>
      <div className="flex items-center gap-2.5 pt-4 border-t border-zinc-800">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
          style={{ background: post.author.color + "44", border: `1px solid ${post.author.color}33` }}>
          {post.author.initials}
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-400">{post.author.name}</p>
          <p className="text-xs text-zinc-600">{post.date}</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="ml-auto text-zinc-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState("All");
  const featured = POSTS.find((p) => p.featured);
  const filtered = POSTS.filter((p) => !p.featured && (activeTag === "All" || p.tag === activeTag));

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <MarketingNav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%,rgba(99,102,241,0.08),transparent)" }} />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6 border"
          style={{ color: "#a78bfa", background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.2)" }}>
          Blog
        </span>
        <h1 className="text-5xl font-bold text-white tracking-tight mb-4">Stories from the team</h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto">
          Product updates, engineering deep-dives, design thinking, and lessons from building in public.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`}
            className="group block mb-12 p-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 hover:border-indigo-500/40 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle,#6366f1,transparent)" }} />
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
                ✦ Featured
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ color: "#a78bfa", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                {featured.tag}
              </span>
              <span className="text-xs text-zinc-600 ml-1">{featured.readTime}</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 leading-snug mb-3 group-hover:text-white transition-colors max-w-2xl">
              {featured.title}
            </h2>
            <p className="text-[15px] text-zinc-400 leading-relaxed mb-6 max-w-2xl">{featured.excerpt}</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                style={{ background: featured.author.color + "44", border: `1px solid ${featured.author.color}33` }}>
                {featured.author.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">{featured.author.name}</p>
                <p className="text-xs text-zinc-600">{featured.date}</p>
              </div>
              <span className="ml-auto text-sm text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
                Read article
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </div>
          </Link>
        )}

        {/* Tag filter */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {TAGS.map((t) => (
            <button key={t} onClick={() => setActiveTag(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTag === t
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
          {filtered.map((p) => <PostCard key={p.slug} post={p} />)}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-zinc-600 text-sm">No posts in this category yet.</div>
          )}
        </div>
      </div>

      <Footer></Footer>
    </div>
  );
}