importScripts('./vendor/mediapipe/vision_bundle.js');
let tracker;
self.onmessage=async event=>{const m=event.data;if(m.type==='init'){try{const root=new URL('./vendor/mediapipe/wasm',self.location.href).href;const files=await Vision.FilesetResolver.forVisionTasks(root);tracker=await Vision.HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:new URL('./models/hand_landmarker.task',self.location.href).href,delegate:'CPU'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.65,minHandPresenceConfidence:.65,minTrackingConfidence:.65});
 // Warm up actual inference without requesting the user's camera.
 const blank=new OffscreenCanvas(96,96);blank.getContext('2d').fillRect(0,0,96,96);tracker.detectForVideo(blank,0);self.postMessage({type:'ready'});}catch(e){self.postMessage({type:'error',message:'Hand tracker could not load: '+e.message})}return}
 if(m.type==='frame'){try{if(!tracker)throw new Error('Tracker is not ready.');const result=tracker.detectForVideo(m.image,m.time);self.postMessage({type:'landmarks',run:m.run,time:m.time,landmarks:result.landmarks[0]||null,world:result.worldLandmarks[0]||null,confidence:result.handedness[0]?.[0]?.score||0});}catch(e){self.postMessage({type:'frame-error',run:m.run,message:e.message})}finally{m.image?.close()}}
};
