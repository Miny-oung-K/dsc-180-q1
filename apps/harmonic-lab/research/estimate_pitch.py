import wave,json
from pathlib import Path
import numpy as np
from scipy.signal import resample_poly,find_peaks
import argparse
p=argparse.ArgumentParser(description='Estimate vowel pitch from private PCM16 WAV recordings.')
p.add_argument('recordings',type=Path,nargs='+')
p.add_argument('--output',type=Path,default=Path('results/pitch.json'))
args=p.parse_args()
results={}
for recording in args.recordings:
 key=recording.stem
 with wave.open(str(recording)) as w:
  if w.getsampwidth()!=2: raise ValueError('Use 16-bit PCM WAV input')
  rate=w.getframerate();channels=w.getnchannels();x=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
  x=x.reshape(-1,channels).mean(axis=1)
 import math
 divisor=math.gcd(rate,16000)
 y=resample_poly(x,16000//divisor,rate//divisor);sr=16000;N=1280;hop=320;maxlag=320;minlag=32
 frames=[]
 for off in range(0,len(y)-N,hop):
  z=y[off:off+N];z=z-z.mean();rms=np.sqrt(np.mean(z*z));length=N-maxlag
  diff=np.array([np.sum((z[:length]-z[t:t+length])**2) for t in range(maxlag+1)])
  cmnd=np.ones(maxlag+1);cmnd[1:]=diff[1:]*np.arange(1,maxlag+1)/(np.cumsum(diff[1:])+1e-20)
  troughs,_=find_peaks(-cmnd)
  candidates=[t for t in troughs if minlag<=t<maxlag and cmnd[t]<.18]
  if candidates:
   t=candidates[0];den=cmnd[t-1]-2*cmnd[t]+cmnd[t+1];delta=.5*(cmnd[t-1]-cmnd[t+1])/den if den else 0
   f0=sr/(t+delta);quality=1-cmnd[t]
  else:f0=0;quality=0
  frames.append({'t':(off+N/2)/sr,'f0':f0,'q':quality,'rms':rms})
 if not frames: raise ValueError('Recording must be longer than 80 ms')
 peakr=max(f['rms'] for f in frames)
 voiced=[f for f in frames if f['f0'] and f['rms']>peakr*.15]
 print(key,'duration',len(x)/rate,'rms',np.sqrt(np.mean(x*x)),'peak',max(abs(x)),'voiced frames',len(voiced),'pitch med',np.median([f['f0'] for f in voiced]))
 for sec in np.arange(.25,len(x)/rate,.25):
  near=[f for f in voiced if abs(f['t']-sec)<.1]
  if near: print(round(sec,2),round(np.median([f['f0'] for f in near]),1),round(np.median([f['q'] for f in near]),3),round(np.median([f['rms'] for f in near]),3))
 results[key]={'source_file':recording.name,'rate':rate,'duration':len(x)/rate,'frames':frames}
args.output.parent.mkdir(parents=True,exist_ok=True)
args.output.write_text(json.dumps(results,indent=2))
