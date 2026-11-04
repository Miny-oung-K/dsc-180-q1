import {analyzeVoice} from './voice-dsp.mjs';
export const PARTICLES=256;
function fft(re,im){const n=re.length;for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}for(let len=2;len<=n;len*=2){const a=-2*Math.PI/len;for(let start=0;start<n;start+=len)for(let j=0;j<len/2;j++){const c=Math.cos(a*j),s=Math.sin(a*j),k=start+j,l=k+len/2,tr=re[l]*c-im[l]*s,ti=re[l]*s+im[l]*c;re[l]=re[k]-tr;im[l]=im[k]-ti;re[k]+=tr;im[k]+=ti}}}
function level(x,start,n){let e=0;for(let k=start;k<Math.min(x.length,start+n);k++)e+=x[k]**2;return Math.sqrt(e/n)}
export function analyzeMouth(pcm,rate){
 if(pcm.length<rate*.02)throw new Error('Capture a little more sound, then try again.');
 const hop=Math.max(1,Math.floor(rate*.01)),window=hop*2;let peak=0,at=0;
 for(let k=0;k<pcm.length;k+=hop){const e=level(pcm,k,window);if(e>peak){peak=e;at=k}}
 if(peak<.0001)throw new Error('No audible mouth sound found. Please record a louder sound.');
 const gate=Math.max(.00005,peak*.16);let left=at,right=Math.min(pcm.length,at+window);
 while(left>0&&level(pcm,Math.max(0,left-hop),hop)>gate)left=Math.max(0,left-hop);
 while(right<pcm.length&&level(pcm,right,hop)>gate)right=Math.min(pcm.length,right+hop);
 const start=Math.max(left,at-Math.floor(rate*.15)),end=Math.min(right,start+Math.floor(rate*.5));
 const size=4096,power=new Float64Array(size/2);let count=0;
 for(let pos=start;pos<end;pos+=1024){const re=new Float64Array(size),im=new Float64Array(size);let energy=0;for(let j=0;j<size;j++){const k=pos+j-size/2,v=k>=left&&k<right?(pcm[k]||0):0;re[j]=v*(.5-.5*Math.cos(2*Math.PI*j/(size-1)));energy+=v*v}if(energy<1e-12)continue;fft(re,im);for(let k=1;k<power.length;k++)power[k]+=re[k]**2+im[k]**2;count++}
 let total=0;for(let k=1;k<power.length;k++){if(k*rate/size<25)power[k]=0;total+=power[k]}if(!count||total<1e-14)throw new Error('Could not find a clear mouth sound. Please try again.');
 const frequencies=new Float32Array(PARTICLES);let bin=1,cumulative=power[1];for(let v=0;v<PARTICLES;v++){const target=(v+.5)*total/PARTICLES;while(bin<power.length-1&&cumulative<target)cumulative+=power[++bin];const fraction=(target-cumulative+power[bin])/(power[bin]||1);frequencies[v]=(bin-.5+fraction)*rate/size}
 let voice=null;try{voice=analyzeVoice(pcm,rate)}catch{/* Hisses, breath, clicks and unpitched mouth sounds are valid. */}if(voice&&voice.level<peak*.25)voice=null;
 return{frequencies,voice,selection:voice?.selection??{start:start/rate,end:end/rate},kind:voice?'voiced':'unvoiced'};
}
