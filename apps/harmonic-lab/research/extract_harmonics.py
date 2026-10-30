import json,wave,math,zipfile
from pathlib import Path
import numpy as np
from scipy.signal import windows
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import argparse
p=argparse.ArgumentParser(description='Extract harmonic amplitudes and synthesize shared-pitch vowel recipes.')
p.add_argument('pitch_json',type=Path)
p.add_argument('--recordings',type=Path,required=True,help='Directory containing the input WAV files')
p.add_argument('--output',type=Path,default=Path('results'))
p.add_argument('--start',type=float,default=1.5)
p.add_argument('--end',type=float,default=2.8)
args=p.parse_args()
out=args.output;out.mkdir(parents=True,exist_ok=True)
data=json.loads(args.pitch_json.read_text());allstats={}
fig,axes=plt.subplots(len(data),1,figsize=(10,3*len(data)),sharex=True,squeeze=False)
labels={'a':'a — 아','yu':'yu — 유 (held vowel)','e':'e — 에'}
for ax,key in zip(axes[:,0],data):
 item=data[key]
 with wave.open(str(args.recordings/item['source_file'])) as w:
  x=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
  x=x.reshape(-1,w.getnchannels()).mean(axis=1)
 rate=item['rate'];frames=[f for f in item['frames'] if args.start<=f['t']<=args.end and f['q']>.9];
 if not frames: raise ValueError('No confident voiced frames in the chosen interval')
 f0=float(np.median([f['f0'] for f in frames]));amps=[]
 for f in frames:
  N=4096;start=round(f['t']*rate)-N//2;z=x[max(0,start):max(0,start)+N];z=np.pad(z,(0,max(0,N-len(z))));z=z-z.mean();win=windows.hann(N,sym=False);nfft=16384;freq=np.fft.rfftfreq(nfft,1/rate);power=np.abs(np.fft.rfft(z*win,nfft))**2/(nfft*np.sum(win**2));a=[]
  for h in range(1,41):
   mask=np.abs(freq-h*f['f0'])<.40*f['f0'];a.append(np.sqrt(4*np.sum(power[mask])))
  a=np.array(a);amps.append(a/(max(a)+1e-15))
 a=np.median(amps,axis=0);a=a/max(a);centers=np.arange(1,41)*f0
 recipes={}
 for base in [100,200]:
  target=np.arange(1,25)*base;values=np.interp(target,centers,a,left=a[0],right=0);values=np.round(values/max(values),2);recipes[str(base)]=values.tolist()
  duration=3;sr=44100;t=np.arange(sr*duration)/sr;signal=np.zeros(len(t));volume=.3
  for h,amp in enumerate(values,1):signal+=amp*np.sin(2*np.pi*h*base*t)
  signal*=volume/sum(values);signal*=np.minimum(1,np.minimum(t/.025,(duration-t)/.025));pcm=np.rint(np.where(signal<0,signal*32768,signal*32767)).astype('<i2')
  with wave.open(str(out/f'recorded-{key}-reconstruction-{base}Hz.wav'),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm.tobytes())
 allstats[key]={'source_file':item['source_file'],'analyzed_seconds':[args.start,args.end],'median_f0_Hz':round(f0,2),'pitch_10_90_Hz':[round(float(np.percentile([f['f0'] for f in frames],p)),2) for p in [10,90]],'measured_harmonic_amplitudes':np.round(a,4).tolist(),'recipes':recipes}
 ax.plot(centers,20*np.log10(np.maximum(a,.001)),color='#346b55',label='Measured harmonic envelope');v=np.array(recipes['200']);ax.scatter(np.arange(1,25)*200,20*np.log10(np.maximum(v,.001)),color='#b86236',s=20,label='200 Hz slider recipe');ax.set_ylim(-60,3);ax.set_xlim(0,5000);ax.set_ylabel('Relative level (dB)');ax.grid(alpha=.2);ax.set_title(f'{key.upper()}: recorded pitch ≈ {f0:.1f} Hz | analyzed 1.5–2.8 s',loc='left');ax.legend(fontsize=8,loc='upper right')
 print(key,'pitch',f0,'200',recipes['200'],'100',recipes['100'])
axes[-1,0].set_xlabel('Frequency (Hz)');fig.suptitle('Your vowel recordings → harmonic amplitude recipes',fontsize=15);fig.tight_layout(rect=[0,0,1,.96]);fig.savefig(out/'your-vowel-spectra.png',dpi=160);(out/'your-vowel-analysis.json').write_text(json.dumps(allstats,indent=2,ensure_ascii=False))
