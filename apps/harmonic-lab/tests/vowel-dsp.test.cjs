const test=require('node:test');
const assert=require('node:assert/strict');
const DSP=require('../dist/vowel-dsp.js');
function tone(f0,amplitudes,seconds=1.2){return Float32Array.from({length:16000*seconds},(_,i)=>amplitudes.reduce((sum,a,k)=>sum+a*Math.sin(2*Math.PI*f0*(k+1)*i/16000),0));}
test('a stronger second harmonic does not double detected pitch',()=>{const r=DSP.analyze(tone(100,[.1,.3,.2]));assert.ok(Math.abs(r.f0-100)<.5);assert.ok(Math.abs(r.tones[0].a-1/3)<.04);assert.ok(Math.abs(r.tones[2].a-2/3)<.04);assert.equal(r.tones[1].a,1)});
test('a missing fundamental is recovered from higher harmonics',()=>{const r=DSP.analyze(tone(150,[0,.3,.2]));assert.ok(Math.abs(r.f0-150)<1)});
test('silence and unpitched noise produce an explicit failure',()=>{assert.throws(()=>DSP.analyze(new Float32Array(32000)),/quiet/);let seed=1;const noise=Float32Array.from({length:32000},()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return(seed/4294967296-.5)*.2});assert.throws(()=>DSP.analyze(noise),/reliable/)});
test('shared pitch uses the requested harmonic grid and finite normalized amplitudes',()=>{const r=DSP.analyze(tone(200,[.1,.3,.2]),16000,{target:'custom',targetHz:100});assert.ok(Math.abs(r.f0-200)<1);assert.equal(r.target,100);assert.equal(r.tones.length,24);assert.equal(r.tones[23].f,2400);assert.ok(r.tones.every(t=>Number.isFinite(t.a)&&t.a>=0&&t.a<=1));assert.ok(r.warnings.some(w=>w.includes('extrapolated')))});
test('manual sections and target ranges are validated',()=>{const x=tone(200,[.2,.3]);assert.throws(()=>DSP.analyze(x,16000,{auto:false,start:1,end:.5}),/section/);assert.throws(()=>DSP.analyze(x,16000,{target:'custom',targetHz:10}),/fundamental/)});
