import { RawPost, RankedPost } from "./types";
function absScore(p: RawPost){ const {likes,comments}=p.metrics; return (likes||0)+(comments||0); }
export function relativeRank(posts: RawPost[]): RankedPost[] {
  const byAuthor: Record<string, number[]> = {};
  for (const p of posts){ const s=absScore(p); (byAuthor[p.author]??=[]).push(s); }
  const medians: Record<string, number> = {};
  for (const a of Object.keys(byAuthor)){ const arr=byAuthor[a].sort((x,y)=>x-y); const mid=Math.floor(arr.length/2); const m=arr.length%2===0?(arr[mid-1]+arr[mid])/2:arr[mid]; medians[a]=m>0?m:1; }
  const ranked: RankedPost[] = posts.map(p=>({ ...p, absoluteScore: absScore(p), ratio: absScore(p)/(medians[p.author]||1) }));
  return ranked.sort((a,b)=> (b.ratio||0)-(a.ratio||0) || (b.absoluteScore||0)-(a.absoluteScore||0) || new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
}
