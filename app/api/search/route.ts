import { NextRequest, NextResponse } from "next/server";
import { addHours } from "date-fns";
import { relativeRank } from "../../../lib/engagement";
import { makeRepostCaptionTR } from "../../../lib/summarise";
import { RawPost, RankedPost } from "../../../lib/types";

export const runtime = "edge";
export const preferredRegion = ["fra1","cdg1","iad1"];

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const INSTAGRAM_PROFILES = ["https://www.instagram.com/gigantesdelbasket/", "https://www.instagram.com/basketusa/", "https://www.instagram.com/sporx/", "https://www.instagram.com/basketinside/", "https://www.instagram.com/maxbetsport/", "https://www.instagram.com/sport24/", "https://www.instagram.com/basquetplus/", "https://www.instagram.com/basketballsphere.rs/"];

async function fetchInstagramPostsSince(sinceISO: string): Promise<RawPost[]> {
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN is missing");
  const url = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      directUrls: INSTAGRAM_PROFILES,
      resultsType: "posts",
      resultsLimit: 20,
      onlyPostsNewerThan: sinceISO,
      proxy: { useApifyProxy: true }
    }),
    cache: "no-store"
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Apify error: ${msg}`);
  }
  const items = await res.json();
  const since = new Date(sinceISO).getTime();

  const posts: RawPost[] = (items || []).map((it: any) => {
    const ts = it.timestamp || it.takenAt || it.firstSeenAt || Date.now();
    const author = (it.ownerUsername || it.username || "").replace(/^@/, "") || "unknown";
    return {
      id: String(it.id || it.shortCode || it.url),
      platform: "instagram",
      author,
      url: it.url,
      text: it.caption,
      createdAt: new Date(ts).toISOString(),
      metrics: { likes: it.likesCount ?? 0, comments: it.commentsCount ?? 0 }
    } as RawPost;
  });

  return posts.filter(p => new Date(p.createdAt).getTime() >= since);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const initialHours = Math.max(1, Math.min(24, Number(body.hours) || 2));

    async function collect(hours: number) {
      const sinceISO = addHours(new Date(), -hours).toISOString();
      const posts = await fetchInstagramPostsSince(sinceISO);
      return { posts, sinceISO, hours };
    }

    let pass = await collect(initialHours);
    if (!pass.posts.length) pass = await collect(Math.max(6, initialHours));
    if (!pass.posts.length) pass = await collect(24);

    if (!pass.posts.length) {
      return NextResponse.json({ posts: [], winner: null, note: "Son 24 saatte içerik bulunamadı." }, { status: 200 });
    }

    const ranked: RankedPost[] = relativeRank(pass.posts);
    const winner = ranked[0];
    const seo = await makeRepostCaptionTR(winner);

    return NextResponse.json({
      posts: ranked,
      winner,
      caption: seo.caption,
      seoKeywords: seo.seoKeywords,
      usedHours: pass.hours
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
