const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {DrawnFilter}=require('../dist/filter-dsp.js');
test('drawn rejection changes harmonic balance without moving frequencies or changing inputs',()=>{
 const f=new DrawnFilter(),source=[{f:100,a:1},{f:200,a:.5},{f:300,a:.3}];
 f.stroke(270,0,330,0);const output=f.apply(source);
 assert.equal(output[0].a,1);assert.equal(output[1].a,.5);assert.equal(output[2].a,0);assert.deepEqual(output.map(t=>t.f),[100,200,300]);assert.equal(source[2].a,.3);
 f.enabled=false;assert.deepEqual(f.apply(source),source);f.enabled=true;assert.equal(f.at(300),0);f.reset();assert.deepEqual(f.apply(source),source);
});
test('strokes interpolate in either drawing direction and pass presets attenuate the expected bands',()=>{
 const f=new DrawnFilter(),g=new DrawnFilter();f.stroke(100,1,5000,0);g.stroke(5000,0,100,1);
 for(const hz of [100,200,500,1000,2000,5000])assert.equal(f.at(hz),g.at(hz));
 f.preset('low',1000);assert.ok(f.at(100)>.99);assert.ok(Math.abs(f.at(1000)-.5)<.01);assert.ok(f.at(5000)<.001);
 f.preset('high',1000);assert.ok(f.at(100)<.001);assert.ok(f.at(5000)>.99);
});
test('WAV rendering keeps the pre-filter normalization, including total rejection',async()=>{
 let levels=[];
 class Offline {constructor(){this.destination={}}createOscillator(){return{frequency:{},connect(){},start(){},stop(){}}}createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(v,t){if(t===.025)levels.push(v)}},connect(){}}}async startRendering(){return levels}}
 const sandbox={window:{OfflineAudioContext:Offline},Blob,DataView,ArrayBuffer};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/audio-files.js','utf8'),sandbox);
 const render=sandbox.window.HarmonicAudio.renderMix,tones=[{f:100,a:1},{f:200,a:.5}];
 await render(tones,1,.3);assert.ok(Math.abs(levels[0]-.2)<1e-9);
 levels=[];await render(tones.map(t=>({...t,a:t.a/2})),1,.3,1.5);assert.ok(Math.abs(levels[0]-.1)<1e-9);assert.ok(Math.abs(levels[1]-.05)<1e-9);
 levels=[];await render(tones.map(t=>({...t,a:0})),1,.3,1.5);assert.ok(levels.every(v=>v===0));
});
