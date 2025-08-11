import { RawPost } from "./types";
export type SeoResult = { caption: string; seoKeywords: string[]; };
function extractTopic(t?: string){ if(!t) return "EuroLeague videosu"; const s=t.split(/[.!?\n]/)[0].trim(); return (s.length>60?s.slice(0,57)+"…":s)||"EuroLeague videosu"; }
function topKeywords(text: string, count=2): string[]{ const base=["EuroLeague","basketbol"]; const words=(text||"").toLowerCase().replace(/[^a-zçğıöşü0-9\s]/gi," ").split(/\s+/).filter(Boolean);
  const stop=new Set(["ve","da","de","ile","ama","çok","bir","bu","şu","mi","mu","mü","için","gibi","olan","olarak","en","daha","son","yeni","video","gün"]);
  const freq=new Map<string,number>(); for(const w of words){ if(w.length<3||stop.has(w)) continue; freq.set(w,(freq.get(w)||0)+1);} const sorted=[...freq.entries()].sort((a,b)=>b[1]-a[1]).map(([w])=>w);
  const picked=sorted.filter(w=>!base.map(b=>b.toLowerCase()).includes(w)).slice(0,count); const final=[base[0],...picked];
  return final.slice(0,count).map(k=>k.replace(/(^|\s|\b)([a-zçğıöşü])/g,m=>m.toUpperCase()));
}
export async function makeRepostCaptionTR(winner: RawPost){
  const topic=extractTopic(winner.text); const kws=topKeywords(winner.text||topic,2); const longTag="#"+topic.replace(/\s+/g,"").toLowerCase();
  const line1=`🎬 ${topic} — kaçıranlara yeniden! 🔥 🙌`; const line2=`Kaynak: @${winner.author}  •  Ne düşünüyorsun? Yorumlara yaz! 😎`; const line3=`🏀 #basketbol #EuroLeague ${longTag}  •  #${kws[0].replace(/\s+/g,"")} #${kws[1].replace(/\s+/g,"")}`;
  return { caption: `${line1}\n${line2}\n${line3}`, seoKeywords: kws };
}
