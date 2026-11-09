const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const Noise=require('../dist/noise-audio.js');
test('repeatable white noise is centered, bounded, and present across frequency bands',()=>{
 const rate=44100,x=Float64Array.from({length:rate},(_,i)=>Noise.sample(i/rate));let mean=0,energy=0;for(const v of x){assert.ok(v>=-1&&v<=1);mean+=v;energy+=v*v}assert.ok(Math.abs(mean/rate)<.01);assert.ok(Math.abs(energy/rate-1/3)<.01);
 for(const hz of [300,1000,5000,10000]){let re=0,im=0;for(let i=0;i<rate;i++){re+=x[i]*Math.cos(2*Math.PI*hz*i/rate);im+=x[i]*Math.sin(2*Math.PI*hz*i/rate)}assert.ok(re*re+im*im>1)}
 assert.equal(Noise.sample(.13),Noise.sample(2.13));
});
function harness(){
 const elements={},buffers=[],gains=[],listeners={};const draw=new Proxy({},{get:()=>()=>{},set:()=>true});
 const element=id=>elements[id]||={value:({noise:'0',yscale:'auto',volume:'.15',exportSeconds:'1'})[id]||'100',checked:true,textContent:'',classList:{remove(){},toggle(){}},getBoundingClientRect:()=>({width:300,height:200}),getContext:()=>draw,append(){},querySelectorAll:()=>Array.from({length:4},()=>({value:'',checked:true})),querySelector:()=>({}),};
 class Context{constructor(){this.currentTime=0;this.sampleRate=44100;this.destination={}}async resume(){}createGain(){const g={values:[],connections:[],gain:{setValueAtTime(v){assert.ok(Number.isFinite(v))},linearRampToValueAtTime(v){assert.ok(Number.isFinite(v));g.values.push(v)},setTargetAtTime(v){assert.ok(Number.isFinite(v));g.values.push(v)},cancelScheduledValues(){}},connect(n){g.connections.push(n)}};gains.push(g);return g}createOscillator(){return{frequency:{setTargetAtTime(){}},connect(){},start(){},stop(){}}}createBuffer(n,length,rate){const x=new Float32Array(length);return{getChannelData:()=>x,sampleRate:rate}}createBufferSource(){const n={connect(){},start(){this.started=true},stop(){this.stopped=true}};buffers.push(n);return n}async startRendering(){return{getChannelData:()=>new Float32Array(44100),sampleRate:44100}}}
 const window={AudioContext:Context,OfflineAudioContext:Context,dispatchEvent(){},addEventListener:(k,fn)=>listeners[k]=fn};
 const sandbox={window,document:{getElementById:element,createElement:()=>element('row'+Math.random()),querySelectorAll:()=>[],addEventListener:(k,fn)=>listeners[k]=fn},devicePixelRatio:1,ResizeObserver:class{observe(){}},Event:class{},Blob,DataView,ArrayBuffer,URL,setTimeout};vm.createContext(sandbox);
 for(const file of ['noise-audio.js','audio-files.js']){vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),sandbox)}sandbox.HarmonicNoise=window.HarmonicNoise;sandbox.HarmonicAudio=window.HarmonicAudio;sandbox.HarmonicAudio.download=()=>{};
 vm.runInContext(fs.readFileSync('dist/app.js','utf8'),sandbox);return{sandbox,element,buffers,gains};
}
test('noise slider updates a running mix, supports noise alone, and stops its source',async()=>{
 const h=harness();await h.element('play').onclick();assert.match(h.element('play').textContent,/Stop/);const first=h.buffers.at(-1);assert.ok(first.started);
 h.element('noise').value='.5';h.element('noise').oninput();assert.equal(h.element('noiseValue').textContent,'0.50');assert.equal(h.buffers.length,1);
 vm.runInContext('tones=[];changed()',h.sandbox);assert.match(h.element('summary').textContent,/0 active tones \+ noise/);assert.match(h.element('play').textContent,/Stop/);
 await h.element('downloadSynth').onclick();assert.match(h.element('synthExportStatus').textContent,/Downloaded/);const offline=h.buffers.at(-1);assert.ok(offline.started&&offline.stopped);assert.equal(offline.buffer.sampleRate,44100);
 await h.element('play').onclick();assert.ok(first.stopped);assert.match(h.element('play').textContent,/Play/);
 h.element('noise').value='0';h.element('noise').oninput();await h.element('play').onclick();assert.match(h.element('audioStatus').textContent,/raise the noise/);
});
