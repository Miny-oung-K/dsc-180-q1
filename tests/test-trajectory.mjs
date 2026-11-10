import assert from 'node:assert/strict';
import {analyzeTrajectory} from '../dist/trajectory-dsp.mjs';
import {weightsAt,synthModel,projectToAnchor} from '../dist/plane-model.mjs';
const rate=16000,duration=4,pcm=new Float32Array(rate*duration);let phase=0;
// Pauses around a changing mouth-like tone; the line carries the recording time.
for(let k=0;k<pcm.length;k++){const t=k/rate,pitch=180*2**(.6*Math.sin(2*Math.PI*(t-.3)/3.4));phase+=2*Math.PI*pitch/rate;if(t>.3&&t<3.7)pcm[k]=.2*Math.sin(phase)+.06*Math.sin(2*phase)}
const trajectory=await analyzeTrajectory(pcm,rate);assert(trajectory.frames.length>25);assert(trajectory.frames.every(f=>f.time>.25&&f.time<3.75),'silent frames retained');
const points=Array.from({length:81},(_,i)=>{const u=i/80;return{x:.1+.8*u,y:.5-.25*Math.sin(2*Math.PI*u),t:.3+3.4*u}});const line={points,trajectory,model:trajectory.frames[0].model};
function at(u){const p={x:.1+.8*u,y:.5-.25*Math.sin(2*Math.PI*u)};return synthModel([line],weightsAt([line],p),p)}
const high=at(.25),low=at(.75),middle=at(.5);assert(high.voicing>.9&&low.voicing>.9);assert(high.pitch>low.pitch*1.7,`${high.pitch} vs ${low.pitch}`);assert(Math.abs(high.pitch-180*2**.6)<35);assert(Math.abs(low.pitch-180*2**(-.6))<25);assert(middle.pitch>low.pitch&&middle.pitch<high.pitch);
const timed={points:[{x:0,y:0,t:0},{x:.5,y:0,t:3},{x:1,y:0,t:4}],trajectory};assert.equal(projectToAnchor({x:.25,y:0},timed).time,1.5);assert.equal(projectToAnchor({x:.75,y:0},timed).time,3.5);
const uploadLine={points:[{x:0,y:0},{x:1,y:0}],trajectory};assert.equal(projectToAnchor({x:.25,y:0},uploadLine).time,1);
const staticPoint={points:[{x:.5,y:.95}],model:trajectory.frames[0].model};const p={x:.5,y:.65},mix=synthModel([line,staticPoint],weightsAt([line,staticPoint],p),p);assert(Number.isFinite(mix.pitch)&&mix.amplitudes.every(Number.isFinite));
console.log(JSON.stringify({result:'PASS',activeFrames:trajectory.frames.length,peakPitchHz:Math.round(high.pitch),troughPitchHz:Math.round(low.pitch),middlePitchHz:Math.round(middle.pitch),checks:['time-varying pitch follows line position','silence excluded without compressing timestamps','nonuniform drawing speed retained','uploads use path length','interpolation around a changing line remains finite']}));
