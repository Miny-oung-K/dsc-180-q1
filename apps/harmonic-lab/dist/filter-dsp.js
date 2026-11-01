/* A magnitude response for the additive synthesizer. No phase or pitch changes. */
(function(root){
 const MAX=20000,SIZE=2049;
 const coordinate=f=>Math.log1p(Math.max(0,Math.min(MAX,f))/50)/Math.log1p(MAX/50);
 const frequency=x=>50*Math.expm1(Math.max(0,Math.min(1,x))*Math.log1p(MAX/50));
 class DrawnFilter {
  constructor(){this.enabled=true;this.values=new Float64Array(SIZE).fill(1)}
  at(f){if(!this.enabled)return 1;const p=coordinate(f)*(SIZE-1),i=Math.floor(p),j=Math.min(SIZE-1,i+1);return this.values[i]+(this.values[j]-this.values[i])*(p-i)}
  stroke(f1,g1,f2,g2){let x1=coordinate(f1),x2=coordinate(f2);g1=Math.max(0,Math.min(1,g1));g2=Math.max(0,Math.min(1,g2));if(x1>x2){[x1,x2]=[x2,x1];[g1,g2]=[g2,g1]}const a=Math.round(x1*(SIZE-1)),b=Math.round(x2*(SIZE-1));for(let i=a;i<=b;i++)this.values[i]=g1+(g2-g1)*(b===a?0:(i-a)/(b-a))}
  reset(){this.values.fill(1)}
  preset(kind,cutoff=1000){for(let i=0;i<SIZE;i++){const f=frequency(i/(SIZE-1)),low=1/(1+(f/cutoff)**8);this.values[i]=kind==='low'?low:1-low}}
  apply(tones){return tones.map(t=>({...t,a:t.a*this.at(t.f)}))}
 }
 const api={DrawnFilter,coordinate,frequency};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FilterDSP=api;
})(typeof window==='undefined'?globalThis:window);
