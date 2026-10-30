export const PRESETS={pure:[1,0,0,0,0,0,0,0],warm:[1,.5,.32,.2,.14,.1,.07,.04],hollow:[1,0,.5,0,.28,0,.16,0],bright:[1,.85,.72,.6,.48,.38,.3,.24]};
export const PRESET_NAMES={pure:'Pure',warm:'Warm strings',hollow:'Hollow',bright:'Electric'};
export const OPEN_MIDI=[55,62,69,76];
export const hz=midi=>440*2**((midi-69)/12);
export const nameOf=midi=>['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][midi%12]+(Math.floor(midi/12)-1);
export const stringPosition=semitones=>2*(1-2**(-semitones/12));
export function weights(partials,harmonic=false){const raw=partials.map((x,i)=>x*(harmonic?(i===0?1:.12):1));const total=Math.max(1,Math.sqrt(raw.reduce((s,x)=>s+x*x,0)));return raw.map(x=>x/total);}
export function staffY(midi){const letter=['C','C','D','D','E','F','F','G','G','A','A','B'][midi%12];const degree='CDEFGAB'.indexOf(letter);return 125-((Math.floor(midi/12)-1)*7+degree-(4*7+2))*5;}
export class Synth{
 constructor(){this.context=null;this.voices=new Map();this.partials=[...PRESETS.warm];this.volume=.45;}
 async ready(){if(!this.context){this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=this.volume*.3;const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-12;limiter.ratio.value=8;this.master.connect(limiter).connect(this.context.destination);}await this.context.resume();}
 setVolume(v){this.volume=v;if(this.master)this.master.gain.setTargetAtTime(v*.3,this.context.currentTime,.02);}
 setPartials(p){this.partials=[...p];for(const v of this.voices.values())this.tune(v);}
 tune(v){const now=this.context.currentTime;const w=weights(v.partials||this.partials,v.harmonic);v.parts.forEach((p,i)=>{const frequency=hz(v.midi)*(i+1);p.o.frequency.setTargetAtTime(frequency,now,.02);p.g.gain.setTargetAtTime(frequency<this.context.sampleRate*.46?w[i]:0,now,.025);});}
 sync(notes){if(!this.context)return;const desired=new Set(notes.map(n=>n.id));for(const [id,v]of this.voices){if(!desired.has(id)){this.release(v);this.voices.delete(id);}}for(const n of notes){let v=this.voices.get(n.id);if(!v){v={...n,parts:[],out:this.context.createGain()};v.out.gain.value=0;v.out.connect(this.master);for(let i=0;i<8;i++){const o=this.context.createOscillator(),g=this.context.createGain();g.gain.value=0;o.type='sine';o.connect(g).connect(v.out);o.start();v.parts.push({o,g});}this.voices.set(n.id,v);}v.midi=n.midi;v.harmonic=n.harmonic;v.partials=n.partials||null;this.tune(v);v.out.gain.setTargetAtTime(.75/Math.max(1,notes.length),this.context.currentTime,.025);}}
 release(v){const now=this.context.currentTime;v.out.gain.cancelScheduledValues(now);v.out.gain.setTargetAtTime(0,now,.02);v.parts.forEach(p=>{p.o.stop(now+.15);p.o.onended=()=>{p.o.disconnect();p.g.disconnect();};});setTimeout(()=>v.out.disconnect(),200);}
 silence(){for(const v of this.voices.values())this.release(v);this.voices.clear();}
}

export function cyclePosition(current,position){if(current?.position!==position)return {position,harmonic:false};if(!current.harmonic)return {position,harmonic:true};return null;}

// Camera y increases downward. The central 60% is a comfortable playing range.
export const bowBrightness=y=>Math.max(0,Math.min(1,(y-.2)/.6));
export function smoothBrightness(current,target,dt){return current+(target-current)*(1-Math.exp(-Math.max(0,Math.min(.25,dt))/.18));}
export function bowPartials(brightness){const b=Math.max(0,Math.min(1,brightness)),soft=[1,.03,.01,.005,0,0,0,0];return soft.map((x,i)=>x+(PRESETS.bright[i]-x)*b);}
