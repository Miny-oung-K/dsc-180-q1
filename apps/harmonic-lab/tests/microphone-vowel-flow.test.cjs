const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const DSP=require('../dist/vowel-dsp.js');
test('microphone capture feeds analysis and the harmonic sliders without a file input',async()=>{
 const elements={},listeners={},nodes=[],timeouts=new Map();let timerID=0,lastRecipe=null,stopped=false;
 const draw=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const element=id=>elements[id]||={value:({micWindow:'100',micY:'auto',micAxis:'log',vowelPitchMode:'detected',vowelTarget:'100',vowelStart:'0',vowelEnd:'1'})[id]||'',checked:id==='vowelAutoSection',disabled:false,hidden:false,paused:true,textContent:'',setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]},getBoundingClientRect(){return{width:500,height:130}},getContext(){return draw},append(){},replaceChildren(){},pause(){if(!this.paused){this.paused=true;this.onpause?.()}},play(){this.paused=false;this.onplay?.();return Promise.resolve()}};
 class Node{constructor(){this.port={};nodes.push(this)}connect(){}disconnect(){}getFloatFrequencyData(a){a.fill(-90)}}
 class Context{constructor(){this.sampleRate=16000;this.destination={};this.audioWorklet={addModule:async()=>{}}}resume(){return Promise.resolve()}close(){return Promise.resolve()}createMediaStreamSource(){return new Node()}createAnalyser(){return new Node()}}
 class Decoder{async decodeAudioData(bytes){const v=new DataView(bytes),x=new Float32Array((bytes.byteLength-44)/2);for(let i=0;i<x.length;i++)x[i]=v.getInt16(44+2*i,true)/32768;return{length:x.length,duration:x.length/16000,numberOfChannels:1,getChannelData:()=>x}}}
 class Worker{postMessage({samples,options}){queueMicrotask(()=>{try{this.onmessage?.({data:{result:DSP.analyze(samples,16000,options)}})}catch(error){this.onmessage?.({data:{error:error.message}})}})}terminate(){}}
 const window={isSecureContext:true,AudioContext:Context,OfflineAudioContext:Decoder,addEventListener:(name,fn)=>(listeners[name]||=[]).push(fn),dispatchEvent:event=>(listeners[event.type]||[]).forEach(fn=>fn())};
 const sandbox={window,document:{hidden:false,getElementById:element,createElement:()=>({append(){},textContent:''}),addEventListener(){}},navigator:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){stopped=true}}]})}},AudioWorkletNode:Node,Worker,Float32Array,DataView,ArrayBuffer,Blob,URL,Math,Number,JSON,Promise,devicePixelRatio:1,requestAnimationFrame:()=>1,cancelAnimationFrame(){},ResizeObserver:class{observe(){}},CustomEvent:class{constructor(type){this.type=type}},setTimeout:fn=>{timeouts.set(++timerID,fn);return timerID},clearTimeout:id=>timeouts.delete(id)};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/audio-files.js','utf8'),sandbox);sandbox.HarmonicAudio=window.HarmonicAudio;
 sandbox.HarmonicAudio.renderMix=async(tones)=>{const x=Float32Array.from({length:48000},(_,i)=>tones.reduce((s,t)=>s+t.a*Math.sin(2*Math.PI*t.f*i/16000),0)*.02);return{sampleRate:16000,getChannelData:()=>x}};
 sandbox.HarmonicLab={stop(){},setTones:tones=>lastRecipe=tones};
 vm.runInContext(fs.readFileSync('dist/microphone.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/vowel-ui.js','utf8'),sandbox);
 assert.equal(elements.vowelFile,undefined);
 await element('vowelRecord').onclick();assert.equal(window.HarmonicMic.isRecording(),true);assert.match(element('vowelRecord').textContent,/Stop/);
 const sound=Float32Array.from({length:24000},(_,i)=>.1*Math.sin(2*Math.PI*200*i/16000)+.2*Math.sin(2*Math.PI*400*i/16000)+.08*Math.sin(2*Math.PI*600*i/16000));
 nodes.at(-1).port.onmessage({data:sound});const stopAfterFiveSeconds=[...timeouts.values()][0];assert.equal(typeof stopAfterFiveSeconds,'function');stopAfterFiveSeconds();
 for(let i=0;i<8&&element('vowelAnalyze').disabled;i++)await new Promise(setImmediate);
 assert.equal(stopped,true);assert.equal(element('vowelAnalyze').disabled,false);assert.match(element('vowelSource').textContent,/microphone-vowel.wav/);
 await element('vowelAnalyze').onclick();assert.match(element('vowelStatus').textContent,/Analysis complete/);assert.ok(Math.abs(parseFloat(element('vowelDetected').textContent)-200)<1);assert.equal(lastRecipe.length,24);assert.equal(element('vowelResult').hidden,false);
 element('vowelPitchMode').value='custom';element('vowelPitchMode').onchange();await element('vowelAnalyze').onclick();assert.equal(lastRecipe[0].f,100);assert.equal(lastRecipe.at(-1).f,2400);
});
