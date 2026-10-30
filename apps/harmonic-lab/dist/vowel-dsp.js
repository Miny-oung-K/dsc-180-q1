/* Local, deterministic harmonic analysis. No network or learned model. */
(function(root){
const median=a=>{const b=Array.from(a).sort((x,y)=>x-y),m=b.length>>1;return b.length?(b.length%2?b[m]:(b[m-1]+b[m])/2):0};
function pitch(frame,sr){
 const max=Math.min(Math.ceil(sr/60),Math.floor(frame.length/3)),min=Math.floor(sr/600),length=frame.length-max,d=new Float64Array(max+1),cm=new Float64Array(max+1);let rms=0,mean=0;
 for(const v of frame)mean+=v;mean/=frame.length;for(const v of frame)rms+=(v-mean)**2;rms=Math.sqrt(rms/frame.length);
 if(rms<1e-5)return{f0:0,q:0,rms};
 for(let lag=1;lag<=max;lag++){let sum=0;for(let i=0;i<length;i++){const e=frame[i]-frame[i+lag];sum+=e*e}d[lag]=sum}
 let sum=0;cm[0]=1;for(let lag=1;lag<=max;lag++){sum+=d[lag];cm[lag]=sum?d[lag]*lag/sum:1}
 for(let lag=Math.max(2,min);lag<max-1;lag++)if(cm[lag]<.18&&cm[lag]<=cm[lag-1]&&cm[lag]<cm[lag+1]){const divisor=cm[lag-1]-2*cm[lag]+cm[lag+1],delta=divisor ? .5*(cm[lag-1]-cm[lag+1])/divisor:0;return{f0:sr/(lag+delta),q:1-cm[lag],rms}}
 return{f0:0,q:0,rms};
}
function fftPower(frame,size=4096){const re=new Float64Array(size),im=new Float64Array(size);let windowPower=0,mean=0;for(const v of frame)mean+=v;mean/=frame.length;for(let i=0;i<frame.length;i++){const w=.5-.5*Math.cos(2*Math.PI*i/frame.length);re[i]=(frame[i]-mean)*w;windowPower+=w*w}
 for(let i=1,j=0;i<size;i++){let bit=size>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){const a=re[i];re[i]=re[j];re[j]=a}}
 for(let len=2;len<=size;len<<=1){const angle=-2*Math.PI/len,cr=Math.cos(angle),ci=Math.sin(angle);for(let base=0;base<size;base+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){const a=base+j,b=a+len/2,vr=re[b]*wr-im[b]*wi,vi=re[b]*wi+im[b]*wr;re[b]=re[a]-vr;im[b]=im[a]-vi;re[a]+=vr;im[a]+=vi;const next=wr*cr-wi*ci;wi=wr*ci+wi*cr;wr=next}}}
 const power=new Float64Array(size/2+1);for(let i=0;i<power.length;i++)power[i]=(re[i]*re[i]+im[i]*im[i])/(size*windowPower);return power;
}
function interpolate(x,y,at){if(at<=x[0])return y[0];if(at>x[x.length-1])return 0;for(let i=1;i<x.length;i++)if(at<=x[i])return y[i-1]+(y[i]-y[i-1])*(at-x[i-1])/(x[i]-x[i-1]);return 0}
function analyze(samples,sr=16000,options={}){
 if(sr!==16000)throw new Error('Audio must be resampled to 16 kHz for analysis.');if(samples.length<sr*.3)throw new Error('Record at least 0.3 seconds of a held vowel.');if(samples.length>sr*30)throw new Error('Use a recording of 30 seconds or less.');
 const frameSize=1280,hop=320,frames=[];for(let i=0;i+frameSize<=samples.length;i+=hop)frames.push({offset:i,t:(i+frameSize/2)/sr,...pitch(samples.subarray(i,i+frameSize),sr)});
 const peak=Math.max(...frames.map(f=>f.rms));if(peak<.0001)throw new Error('This recording is too quiet. Move closer to the microphone and try again.');
 const valid=f=>f.f0>0&&f.q>.82&&f.rms>peak*.12;const voiced=frames.filter(valid);if(voiced.length<5)throw new Error('No reliable voiced pitch found between 60 and 600 Hz. Hold a vowel steadily; avoid whispering, background music, and noise.');
 let start,end,selected;
 if(options.auto!==false){const typical=median(voiced.map(f=>f.f0));let best=null;const width=Math.min(50,frames.length);for(let i=0;i<=frames.length-width;i++){const window=frames.slice(i,i+width),good=window.filter(f=>valid(f)&&Math.abs(Math.log2(f.f0/typical))<.25);if(good.length<Math.max(5,width*.7))continue;const m=median(good.map(f=>f.f0)),r=median(good.map(f=>f.rms)),pitchDev=median(good.map(f=>Math.abs(f.f0-m)))/m,levelDev=median(good.map(f=>Math.abs(f.rms-r)))/(r||1);const score=good.length/width-5*pitchDev-.15*levelDev-.01*Math.abs((i+width/2)/frames.length-.5);if(!best||score>best.score)best={score,window,good}}if(!best)throw new Error('The pitch is too unstable to choose a steady section. Try a longer held vowel or select a section manually.');selected=best.good;start=best.window[0].offset/sr;end=(best.window.at(-1).offset+frameSize)/sr;
 }else{start=Number(options.start);end=Number(options.end);if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end>samples.length/sr+.001||end-start<.2)throw new Error('Choose a section of at least 0.2 seconds within the recording.');selected=frames.filter(f=>f.offset/sr>=start&&(f.offset+frameSize)/sr<=end&&valid(f));if(selected.length<5)throw new Error('Not enough clear voiced sound in that section. Select a longer, steadier vowel.');}
 const initial=median(selected.map(f=>f.f0));selected=selected.filter(f=>Math.abs(Math.log2(f.f0/initial))<.25);if(selected.length<5)throw new Error('Too few consistent pitch estimates. Try another section.');const f0=median(selected.map(f=>f.f0)),spread=median(selected.map(f=>Math.abs(f.f0-f0))),confidence=median(selected.map(f=>f.q));
 const count=Math.min(80,Math.floor(7400/f0)),bands=[];for(const f of selected){const power=fftPower(samples.subarray(f.offset,f.offset+frameSize)),a=[];for(let h=1;h<=count;h++){const lo=Math.max(1,Math.ceil((h-.4)*f.f0*4096/sr)),hi=Math.min(power.length-1,Math.floor((h+.4)*f.f0*4096/sr));let energy=0;for(let b=lo;b<=hi;b++)energy+=power[b];a.push(Math.sqrt(4*energy))}const peak=Math.max(...a);bands.push(a.map(v=>v/(peak||1)))}
 const envelope=Array.from({length:count},(_,i)=>median(bands.map(a=>a[i]))),highest=Math.max(...envelope);for(let i=0;i<count;i++)envelope[i]/=highest;
 const target=options.target==='custom'?Number(options.targetHz):f0;if(!Number.isFinite(target)||target<60||target>600)throw new Error('Choose a synthesis fundamental between 60 and 600 Hz.');const frequencies=Array.from({length:count},(_,i)=>(i+1)*f0);const amplitudes=Array.from({length:24},(_,i)=>interpolate(frequencies,envelope,(i+1)*target)),max=Math.max(...amplitudes);const tones=amplitudes.map((a,i)=>({f:Number(((i+1)*target).toFixed(3)),a:Number((a/max).toFixed(3)),on:true}));
 return{f0,target,confidence,pitchSpread:spread,segment:{start,end},voicedFrames:selected.length,tones,envelope:envelope.map((a,i)=>({f:frequencies[i],a})),warnings:[...(spread/f0>.02?['Pitch varies within the selected section.']:[]),...(target<f0*.9?['Lower-pitch synthesis interpolates the envelope; frequencies below the recorded fundamental are extrapolated.']:[])]};
}
root.VowelDSP={analyze,pitch,fftPower,median};if(typeof module!=='undefined')module.exports=root.VowelDSP;
})(typeof self!=='undefined'?self:globalThis);
