export type SourcePlatform = "instagram";
export interface RawPost { id:string; platform:SourcePlatform; author:string; url:string; text?:string; createdAt:string; metrics:{ likes:number; comments:number }; }
export interface RankedPost extends RawPost { ratio?:number; absoluteScore?:number; }
