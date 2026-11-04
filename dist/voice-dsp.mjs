// A stationary source/filter voice model. Clip timing and silent samples are
// intentionally absent from the synthesis model: the slider controls timbre.
export const HARMONICS=80;
function rms(x,start,n){let sum=0;for(let j=0;j<n;j++)sum+=(x[start+j]||0)**2;return Math.sqrt(sum/n)}
export function detectPitch(x,rate){const n=x.length,lo=Math.ceil(rate/500),hi=Math.min(Math.floor(rate/65),Math.floor(n/3)),corr=new Float64Array(hi+2);let mean=x.reduce((a,b)=>a+b,0)/n;for(let lag=lo-1;lag<=hi+1;lag++){let xy=0,xx=0,yy=0;for(let j=0;j<n-hi-1;j++){const a=x[j]-mean,b=x[j+lag]-mean;xy+=a*b;xx+=a*a;yy+=b*b}corr[lag]=xy/Math.sqrt(xx*yy||1)}let best=lo;for(let l=lo+1;l<=hi;l++)if(corr[l]>corr[best])best=l;const threshold=Math.max(.65,corr[best]*.94);for(let l=lo+1;l<hi;l++)if(corr[l]>=threshold&&corr[l]>corr[l-1]&&corr[l]>=corr[l+1]){best=l;break}const d=.5*(corr[best-1]-corr[best+1])/(corr[best-1]-2*corr[best]+corr[best+1]||1);return{hz:rate/(best+Math.max(-.5,Math.min(.5,d))),confidence:corr[best]}}
export function analyzeVoice(pcm,rate){
 if(pcm.length<rate*.12)throw new Error('Hold the sound for at least half a second, then record again.');
 const analysisRate=12000,step=rate/analysisRate,x=new Float32Array(Math.floor(pcm.length/step));for(let i=0;i<x.length;i++){const at=i*step,k=Math.floor(at),f=at-k;x[i]=(pcm[k]||0)*(1-f)+(pcm[k+1]||0)*f}
 const n=960,hop=Math.max(240,Math.floor(x.length/500)),candidates=[];let maxRms=0;
 for(let start=0;start+n<=x.length;start+=hop){const level=rms(x,start,n);maxRms=Math.max(maxRms,level);candidates.push({start,level})}
 if(maxRms<.003)throw new Error('That recording is too quiet. Record a steady AH or MM closer to the microphone.');
 // Silence and breath are rejected before choosing a stable voiced region.
 const gate=Math.max(.003,maxRms*.2),eligible=candidates.filter(c=>c.level>gate);const stride=Math.max(1,Math.ceil(eligible.length/100));let best=null;
 for(let i=0;i<eligible.length;i+=stride){const c=eligible[i],pitch=detectPitch(x.subarray(c.start,c.start+n),analysisRate);if(pitch.confidence<.65)continue;const left=rms(x,Math.max(0,c.start-1200),1200),right=rms(x,Math.min(x.length-1200,c.start+n),1200),steady=Math.min(left,right,c.level)/Math.max(left,right,c.level,.00001);const score=pitch.confidence*(.55+.45*steady)*Math.min(1,c.level/(maxRms*.5));if(!best||score>best.score)best={...c,...pitch,score}}
 if(!best)throw new Error('No steady voiced sound found. Hold AH or MM for about one second; avoid whispering.');
 const center=best.start+n/2;const segmentStart=Math.max(0,Math.floor(center-1800)),segmentEnd=Math.min(x.length,Math.floor(center+1800));const nearby=[];for(let start=segmentStart;start+n<=segmentEnd;start+=480){if(rms(x,start,n)<gate)continue;const p=detectPitch(x.subarray(start,start+n),analysisRate);if(p.confidence>.65&&Math.abs(Math.log2(p.hz/best.hz))<.12)nearby.push(p.hz)}nearby.sort((a,b)=>a-b);const pitch=nearby.length?nearby[Math.floor(nearby.length/2)]:best.hz;
 // Average harmonic magnitudes over voiced frames. The harmonic index is the
 // shared excitation; its amplitude describes the mouth/nasal resonance.
 const amplitudes=new Float32Array(HARMONICS);let frames=0,energy=0;
 for(let start=segmentStart;start+n<=segmentEnd;start+=240){const level=rms(x,start,n);if(level<gate)continue;frames++;energy+=level*level;for(let h=1;h<=HARMONICS;h++){if(h*pitch>=analysisRate*.46)break;let re=0,im=0,weight=0;for(let j=0;j<n;j++){const w=.5-.5*Math.cos(2*Math.PI*j/(n-1)),phase=2*Math.PI*h*pitch*j/analysisRate;const v=x[start+j]*w;re+=v*Math.cos(phase);im-=v*Math.sin(phase);weight+=w}amplitudes[h-1]+=2*Math.hypot(re,im)/weight}}
 if(!frames)throw new Error('Please record a longer steady sound.');let total=0;for(let h=0;h<HARMONICS;h++){amplitudes[h]/=frames;total+=amplitudes[h]**2}if(total<1e-10)throw new Error('Could not identify the voiced tone. Please try a steady AH or MM.');
 const scale=1/Math.sqrt(total);for(let h=0;h<HARMONICS;h++)amplitudes[h]*=scale;
 return{pitch,amplitudes,confidence:best.confidence,selection:{start:segmentStart/analysisRate,end:segmentEnd/analysisRate},level:Math.sqrt(energy/frames)};
}
export function morphModel(a,b,t){const pitch=Math.exp(Math.log(a.pitch)*(1-t)+Math.log(b.pitch)*t),amplitudes=new Float32Array(HARMONICS);let energy=0;for(let h=0;h<HARMONICS;h++){amplitudes[h]=Math.exp((1-t)*Math.log(Math.max(a.amplitudes[h],1e-5))+t*Math.log(Math.max(b.amplitudes[h],1e-5)));energy+=amplitudes[h]**2}const scale=.18*Math.SQRT2/Math.sqrt(energy||1);for(let h=0;h<HARMONICS;h++)amplitudes[h]*=scale;return{pitch,amplitudes}}
