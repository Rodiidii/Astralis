const OVERCHARGE_MS=8000;

export function scoreReactionMatch({size,chain=1,now=0,boostUntil=0,duration=OVERCHARGE_MS}={}){
 const count=Math.max(0,Math.floor(Number(size)||0));
 const multiplier=Number(now)<Number(boostUntil)?2:1;
 const base=count*50*Math.max(1,Math.floor(Number(chain)||1))+(count>=4?100:0);
 const activated=count>=4;
 return {points:base*multiplier,multiplier,activated,boostUntil:activated?Number(now)+Math.max(0,Number(duration)||0):Number(boostUntil)||0};
}

export function reactionBoostRemaining(boostUntil,now=Date.now()){
 return Math.max(0,(Number(boostUntil)||0)-(Number(now)||0));
}
