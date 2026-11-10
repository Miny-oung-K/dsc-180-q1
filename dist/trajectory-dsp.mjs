import {analyzeMouth} from './mouth-dsp.mjs';
// Keep timestamps, but omit silent models. A silent span is bridged between
// neighboring active frames so the sound stays continuous without losing sync.
export async function analyzeTrajectory(pcm,rate,onProgress=()=>{},cancelled=()=>false){
 const duration=pcm.length/rate,hop=Math.max(1,Math.floor(rate*.02)),levels=[];let peak=0;for(let at=0;at<pcm.length;at+=hop){let energy=0;const end=Math.min(pcm.length,at+hop);for(let k=at;k<end;k++)energy+=pcm[k]*pcm[k];const rms=Math.sqrt(energy/Math.max(1,end-at));levels.push({time:(at+(end-at)/2)/rate,rms});peak=Math.max(peak,rms)}
 if(peak<.0001)throw new Error('No audible sound found along this line. Draw and sing again.');
 const gate=Math.max(.00005,peak*.1),spacing=Math.max(.065,duration/240),centers=[];let last=-Infinity;
 for(const frame of levels)if(frame.rms>=gate&&frame.time-last>=spacing){centers.push(frame.time);last=frame.time}
 if(!centers.length)throw new Error('No active sound found along this line.');
 const frames=[];for(let i=0;i<centers.length;i++){if(cancelled())throw new Error('Learning cancelled.');const time=centers[i],half=.08,n=Math.min(pcm.length,Math.round(rate*.16)),start=Math.max(0,Math.min(pcm.length-n,Math.round((time-half)*rate)));const chunk=pcm.subarray(start,Math.min(pcm.length,start+n));try{frames.push({time,model:analyzeMouth(chunk,rate)})}catch{/* A brief invalid snapshot does not discard the rest of a line. */}if(i%3===0){onProgress(i+1,centers.length);await new Promise(r=>setTimeout(r,0))}}
 if(!frames.length)throw new Error('Could not learn this line. Draw slowly while making a clear sound.');
 return{version:1,duration,frames};
}
