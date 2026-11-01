(()=>{
 const el=id=>document.getElementById(id),canvas=el('filterSpectrum'),filter=new FilterDSP.DrawnFilter();let tones=[],last=null,geometry=null;
 window.HarmonicFilter=filter;
 const max=()=>Number(el('filterRange').value);
 const X=f=>FilterDSP.coordinate(f)/FilterDSP.coordinate(max());
 const F=x=>FilterDSP.frequency(x*FilterDSP.coordinate(max()));
 function draw(list=tones){tones=list;const rect=canvas.getBoundingClientRect(),w=rect.width||650,h=280,d=devicePixelRatio||1;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);const c=canvas.getContext('2d');c.scale(d,d);const L=46,T=22,R=48,B=36,pw=w-L-R,ph=h-T-B;geometry={L,T,pw,ph};c.font='10px system-ui';c.lineWidth=1;
  c.fillStyle='#9da9b7';for(let i=0;i<=4;i++){const y=T+ph*i/4;c.strokeStyle='#273341';c.beginPath();c.moveTo(L,y);c.lineTo(w-R,y);c.stroke();c.fillText((1-i/4).toFixed(2),4,y+3);c.fillText(Math.round(100*(1-i/4))+'%',w-R+7,y+3)}
  const ticks=max()<=1000?[0,50,100,200,500,1000]:max()<=5000?[0,100,300,1000,2500,5000]:[0,100,500,2000,8000,20000];for(const f of ticks){const x=L+pw*X(f);c.fillStyle='#9da9b7';c.fillText(f>=1000?f/1000+'k':f,x-9,h-15)}
  // Equal-frequency, equal-phase sine waves combine coherently, so aggregate their amplitudes.
  const bins=new Map();for(const t of tones)bins.set(t.f,(bins.get(t.f)||0)+t.a);const peak=Math.max(1,...bins.values());
  c.save();c.beginPath();c.rect(L,T,pw,ph);c.clip();for(const [f,a] of bins){if(f>max())continue;const x=L+pw*X(f);c.strokeStyle='#7cbbef80';c.lineWidth=6;c.beginPath();c.moveTo(x,T+ph);c.lineTo(x,T+ph-a/peak*ph);c.stroke();c.strokeStyle='#b9ed81';c.lineWidth=3;c.beginPath();c.moveTo(x,T+ph);c.lineTo(x,T+ph-a/peak*filter.at(f)*ph);c.stroke()}
  c.strokeStyle=filter.enabled?'#ecab7e':'#8793a2';c.lineWidth=2.5;c.beginPath();for(let x=0;x<=pw;x++){const y=T+ph*(1-filter.at(F(x/pw)));if(x===0)c.moveTo(L+x,y);else c.lineTo(L+x,y)}c.stroke();c.restore();c.fillStyle='#9da9b7';c.fillText('Relative spectrum',L,12);c.fillText('Gain',w-R+6,12);c.fillText('Frequency · Hz (log-like spacing)',L,h-1);
  el('filterDescription').textContent=filter.enabled?'Filter on · orange line = retained amplitude · blue = original · green = filtered':'Filter bypassed · original mix is playing. Your drawn curve is saved.';
 }
 function update(){window.dispatchEvent(new Event('harmonic-filter-change'));draw()}
 function point(event){const r=canvas.getBoundingClientRect(),g=geometry;return {f:F(Math.max(0,Math.min(1,(event.clientX-r.left-g.L)/g.pw))),a:Math.max(0,Math.min(1,1-(event.clientY-r.top-g.T)/g.ph))}}
 canvas.onpointerdown=e=>{if(e.button!==0||!geometry)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);last=point(e);filter.stroke(last.f,last.a,last.f,last.a);filter.enabled=true;el('filterEnabled').checked=true;update()};
 canvas.onpointermove=e=>{if(!geometry)return;const p=point(e);el('filterCursor').textContent=`${Math.round(p.f)} Hz · ${Math.round(p.a*100)}% retained`;if(last){filter.stroke(last.f,last.a,p.f,p.a);last=p;update()}};
 canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=()=>{last=null};
 el('filterEnabled').onchange=()=>{filter.enabled=el('filterEnabled').checked;update()};el('filterReset').onclick=()=>{filter.reset();update()};
 el('filterRange').onchange=()=>{last=null;draw()};document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter.preset(b.dataset.filter,Number(el('filterCutoff').value));filter.enabled=true;el('filterEnabled').checked=true;update()});
 el('filterSetBand').onclick=()=>{const f=Number(el('filterPointHz').value),g=Number(el('filterPointGain').value)/100;if(!Number.isFinite(f)||!Number.isFinite(g)||f<0||f>20000||g<0||g>1){el('filterCursor').textContent='Use 0–20,000 Hz and 0–100%.';return}const width=Math.max(10,f*.04);filter.stroke(Math.max(0,f-width),g,Math.min(20000,f+width),g);filter.enabled=true;el('filterEnabled').checked=true;update();el('filterCursor').textContent=`Set a narrow band around ${f} Hz to ${g*100}%.`};
 window.HarmonicFilterUI={draw};new ResizeObserver(()=>draw()).observe(canvas);draw();
})();
