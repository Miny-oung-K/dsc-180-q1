import assert from 'node:assert/strict';
import {analyzeVoice,morphModel,HARMONICS} from '../dist/voice-dsp.mjs';
import {analyzeMouth} from '../dist/mouth-dsp.mjs';
const rate=24000;
function vowel(closed,pad=1){const data=new Float32Array(rate*(2+pad*2));for(let k=0;k<rate*2;k++){const t=k/rate;let y=0;for(let h=1;h<36;h++){const hz=h*145,formants=closed?[[250,100,1.3],[1000,180,.12],[2200,250,.025]]:[[750,140,1],[1150,180,.8],[2600,220,.4]];let amp=.015/h;for(const [f,w,g]of formants)amp+=g*Math.exp(-.5*((hz-f)/w)**2)/Math.sqrt(h);y+=amp*Math.sin(2*Math.PI*hz*t)}data[k+pad*rate]=y*.16*Math.min(1,t/.15,(2-t)/.15)}return data}
const a=analyzeVoice(vowel(false),rate),b=analyzeVoice(vowel(true),rate);for(const m of [a,b]){assert(Math.abs(m.pitch-145)<3,`pitch ${m.pitch}`);assert(m.selection.start>1&&m.selection.end<3);assert(m.amplitudes.every(Number.isFinite))}
const padded=analyzeVoice(vowel(false,3),rate);assert(Math.abs(padded.pitch-a.pitch)<1);let envelopeDiff=0;for(let i=0;i<HARMONICS;i++)envelopeDiff+=Math.abs(padded.amplitudes[i]-a.amplitudes[i]);assert(envelopeDiff<.1,`silence affects timbre ${envelopeDiff}`);
assert.throws(()=>analyzeVoice(new Float32Array(rate),rate),/quiet/);
globalThis.sampleRate=rate;globalThis.AudioWorkletProcessor=class{constructor(){this.port={}}};let Processor;globalThis.registerProcessor=(n,c)=>Processor=c;await import('../dist/mouth-worklet.js');
function render(amount){const p=new Processor({processorOptions:{sounds:[analyzeMouth(vowel(false),rate),analyzeMouth(vowel(true),rate)],amount}}),out=new Float32Array(rate*4);for(let at=0;at<out.length;at+=128){const block=new Float32Array(128);p.process([],[[block]]);out.set(block.subarray(0,Math.min(128,out.length-at)),at)}assert(out.every(Number.isFinite));for(let at=rate;at<out.length-1024;at+=1024){let energy=0;for(let k=at;k<at+1024;k++)energy+=out[k]**2;assert(Math.sqrt(energy/1024)>.08,'silent playback gap')}return out}
for(const t of [0,.25,.5,.75,1])render(t);
// AH has strong upper harmonics; MM emphasizes the lower resonances.
function upperRatio(t){const m=morphModel(a,b,t);let low=0,high=0;for(let i=0;i<20;i++){if(i<3)low+=m.amplitudes[i]**2;else high+=m.amplitudes[i]**2}return high/low}
const ratios=[0,.25,.5,.75,1].map(upperRatio);for(let i=1;i<ratios.length;i++)assert(ratios[i]<ratios[i-1]);console.log(JSON.stringify({result:'PASS',pitchAH:a.pitch,pitchMM:b.pitch,selectedAH:a.selection,selectedMM:b.selection,silencePaddingEnvelopeDifference:envelopeDiff,upperToLowerEnergyRatios:ratios,checks:['silence rejected','padded silence does not change voice','steady output across four seconds','single shared pitch','progressively darker AH to MM envelope']}));
