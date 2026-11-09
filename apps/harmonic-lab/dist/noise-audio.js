/* Reproducible white-noise texture, shared by live playback, plots, and exports. */
(function(root){
 const rate=44100,length=rate*2,samples=new Float32Array(length);let seed=0x51f15e;
 for(let i=0;i<length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;samples[i]=(seed>>>0)/4294967296*2-1}
 function sample(time){const index=((Math.floor(time*rate)%length)+length)%length;return samples[index]}
 function create(context,level=0,seconds){const source=context.createBufferSource(),gain=context.createGain(),buffer=context.createBuffer(1,length,rate);buffer.getChannelData(0).set(samples);source.buffer=buffer;source.loop=true;source.connect(gain);const now=context.currentTime||0,fade=seconds?Math.min(.025,seconds/4):.025;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(level,now+fade);if(seconds){gain.gain.setValueAtTime(level,now+seconds-fade);gain.gain.linearRampToValueAtTime(0,now+seconds)}return{source,gain}}
 const api={sample,create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HarmonicNoise=api;
})(typeof window==='undefined'?globalThis:window);
