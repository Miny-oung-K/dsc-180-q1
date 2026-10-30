class MicCapture extends AudioWorkletProcessor {
  constructor(){super();this.chunk=new Float32Array(1024);this.used=0;}
  process(inputs,outputs){
    for(const channel of outputs[0]||[])channel.fill(0);
    const channels=inputs[0];if(channels&&channels.length){
      for(let i=0;i<channels[0].length;i++){
        let v=0;for(const channel of channels)v+=channel[i];
        this.chunk[this.used++]=v/channels.length;
        if(this.used===this.chunk.length){this.port.postMessage(this.chunk);this.used=0;}
      }
    }
    return true;
  }
}
registerProcessor('mic-capture',MicCapture);
