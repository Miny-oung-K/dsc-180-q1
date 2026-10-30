import assert from 'node:assert/strict';
import {PRESETS,hz,nameOf,stringPosition,weights,staffY,Synth,cyclePosition,bowBrightness,smoothBrightness,bowPartials} from '../dist/music.js';
assert.equal(hz(69),440);assert.equal(hz(81),880);assert.equal(nameOf(70),'A♯4');
assert.equal(stringPosition(0),0);assert.equal(stringPosition(12),1);
assert.ok(stringPosition(2)-stringPosition(1)>stringPosition(12)-stringPosition(11));
assert.equal(staffY(64),125);assert.equal(staffY(60),135);
assert.deepEqual(weights(PRESETS.pure),PRESETS.pure);assert.equal(PRESETS.hollow[1],0);
assert.ok(weights(PRESETS.warm,true)[1]<weights(PRESETS.warm)[1]);
for(const p of Object.values(PRESETS))assert.ok(weights(p).reduce((s,x)=>s+x*x,0)<=1.000001);
assert.deepEqual(weights(Array(8).fill(0)),Array(8).fill(0));
let stopped=0;const param=()=>({value:0,setTargetAtTime(v){this.value=v;},cancelScheduledValues(){}});
const node=()=>({connect(){return this;},disconnect(){},gain:param()});
globalThis.AudioContext=class{currentTime=0;sampleRate=48000;state='running';destination={};createGain(){return node();}createDynamicsCompressor(){return {...node(),threshold:param(),ratio:param()};}createOscillator(){return {...node(),frequency:param(),start(){},stop(){stopped++;}};}async resume(){}};
const synth=new Synth();await synth.ready();synth.sync([{id:'a',midi:69,harmonic:false},{id:'b',midi:76,harmonic:false}]);
assert.equal(synth.voices.size,2);assert.equal(synth.voices.get('a').parts[0].o.frequency.value,440);
synth.setPartials(PRESETS.pure);assert.equal(synth.voices.get('a').parts[1].g.gain.value,0);
synth.sync([{id:'a',midi:81,harmonic:true}]);assert.equal(synth.voices.size,1);assert.equal(synth.voices.get('a').parts[0].o.frequency.value,880);
assert.equal(stopped,8);synth.silence();assert.equal(synth.voices.size,0);assert.equal(stopped,16);
console.log('PASS: tuning, string positions, staff mapping, harmonic mixtures, voice release and silence');

let note=cyclePosition(null,3);assert.deepEqual(note,{position:3,harmonic:false});note=cyclePosition(note,3);assert.deepEqual(note,{position:3,harmonic:true});assert.equal(cyclePosition(note,3),null);assert.deepEqual(cyclePosition(note,4),{position:4,harmonic:false});

assert.equal(bowBrightness(.2),0);assert.equal(bowBrightness(.8),1);assert.equal(bowBrightness(0),0);assert.equal(bowBrightness(1),1);
for(let i=0;i<=10;i++){const p=bowPartials(i/10);assert.equal(p[0],1);if(i>0)assert.ok(p[1]>bowPartials((i-1)/10)[1]);const w=weights(p);assert.ok(Math.abs(w.reduce((s,x)=>s+x*x,0)-1)<1e-10);}
assert.ok(smoothBrightness(0,1,.065)>0&&smoothBrightness(0,1,.065)<1);
const bowSynth=new Synth();await bowSynth.ready();bowSynth.sync([{id:'bow',midi:69,harmonic:false,partials:bowPartials(0)}]);const lowOvertone=bowSynth.voices.get('bow').parts[1].g.gain.value;
bowSynth.sync([{id:'bow',midi:69,harmonic:false,partials:bowPartials(1)}]);assert.equal(bowSynth.voices.get('bow').parts[0].o.frequency.value,440);assert.ok(bowSynth.voices.get('bow').parts[1].g.gain.value>lowOvertone);bowSynth.silence();
console.log('PASS: top-to-soft / bottom-to-bright mapping, smoothing, energy normalization and unchanged fundamental');
