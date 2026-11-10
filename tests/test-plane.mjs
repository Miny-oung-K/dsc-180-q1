import assert from 'node:assert/strict';
import {distanceToAnchor,weightsAt,synthModel} from '../dist/plane-model.mjs';
const voice=(pitch,tilt)=>({pitch,amplitudes:Float32Array.from({length:80},(_,i)=>Math.exp(-i*tilt))});
const model=(pitch)=>({voice:voice(pitch,.15),frequencies:Float32Array.from({length:256},(_,i)=>200+i*20)});
const a=[{points:[{x:0,y:0}],model:model(120)},{points:[{x:1,y:0}],model:model(240)},{points:[{x:0,y:1}],model:model(180)}];
assert.deepEqual(weightsAt(a,{x:0,y:0}),[1,0,0]);assert.deepEqual(weightsAt(a.slice(0,2),{x:.5,y:0}),[.5,.5]);assert.deepEqual(weightsAt([{points:[{x:0,y:0},{x:1,y:1}]},a[1]],{x:.25,y:.25}),[1,0]);assert(Math.abs(distanceToAnchor({x:.3,y:.4},{points:[{x:0,y:0},{x:1,y:0}]} )-.4)<1e-12);
const same=[{points:[{x:0,y:0}]},{points:[{x:0,y:0}]}];assert.deepEqual(weightsAt(same,{x:0,y:0}),[.5,.5]);
for(let x=0;x<=1;x+=.05)for(let y=0;y<=1;y+=.05){const w=weightsAt(a,{x,y});assert(w.every(v=>v>=0&&Number.isFinite(v)));assert(Math.abs(w.reduce((s,v)=>s+v,0)-1)<1e-12)}
const mid=synthModel(a.slice(0,2),[.5,.5]);assert(Math.abs(mid.pitch-Math.sqrt(120*240))<1e-9);assert.equal(mid.voicing,1);
const noise={points:[{x:1,y:1}],model:{voice:null,frequencies:Float32Array.from({length:256},(_,i)=>500+i*20)}};const mixed=synthModel([a[0],noise],[.4,.6]);assert.equal(mixed.voicing,.4);assert(mixed.frequencies.every((f,i)=>Math.abs(f-(500+i*20))<.001));
globalThis.sampleRate=24000;globalThis.AudioWorkletProcessor=class{constructor(){this.port={}}};let Processor;globalThis.registerProcessor=(n,c)=>Processor=c;await import('../dist/plane-worklet.js');const p=new Processor({processorOptions:{model:mid}});let energy=0;for(let i=0;i<900;i++){if(i===300)p.port.onmessage({data:{model:mixed}});if(i===600)p.port.onmessage({data:{model:synthModel([noise],[1])}});const out=new Float32Array(128);p.process([],[[out]]);assert(out.every(v=>Number.isFinite(v)&&Math.abs(v)<=1));for(const v of out)energy+=v*v}assert(energy>1);console.log('PASS: exact point/line anchors, symmetric midpoint, crossing anchors, normalized 2D weights, multi-voice interpolation, mixed voice/noise synthesis and continuous model updates.');
