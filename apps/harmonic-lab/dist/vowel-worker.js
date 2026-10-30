importScripts('vowel-dsp.js');
self.onmessage=event=>{try{const {samples,sampleRate,options}=event.data;self.postMessage({result:VowelDSP.analyze(samples,sampleRate,options)})}catch(error){self.postMessage({error:error.message||'Could not analyze the vowel.'})}};
