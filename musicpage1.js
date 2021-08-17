window.addEventListener('DOMContentLoaded', function(){
    window.addEventListener("load", async ()=>{
        const audioctx = new AudioContext();
        const bgm = document.querySelector('#bgm');
        const track = audioctx.createMediaElementSource(bgm);
        let mode = 0;
        let src = null;
        const analyser = new AnalyserNode(audioctx, {smoothingTimeConstant:0.7});
        const btn_loop = document.querySelector("#btn_loop");
        const btn_vo = document.querySelector("#btn_vo");
        const vosl = document.querySelector("#volumesl");
        
        document.getElementById("btn_play").addEventListener("click",()=>{
            if(audioctx.state=="suspended")
                audioctx.resume();
            if(src == null){
                src = new AudioBufferSourceNode(audioctx, {buffer:soundbuf,loop:false});
                src.connect(analyser).connect(audioctx.destination);
                src.start();
            }
        });

        document.getElementById("btn_stop").addEventListener("click",()=>{
            if(src) src.stop();
            src = null;
        });
        document.getElementById("mode").addEventListener("change",(ev)=>{
            mode = ev.target.selectedIndex;
        });
        document.getElementById("smoothing").addEventListener("input",(ev)=>{
            analyser.smoothingTimeConstant = document.getElementById("smoothingval").innerHTML = ev.target.value;
        });
 
        btn_loop.addEventListener('click', function(){
            this.classList.toggle('btnloop_on');
        });
      
        btn_loop.addEventListener("click", ()=>{
          if(src.loop){
            src.loop = false;
          }
          else{
            src.loop = true;
          }
        });
      
        vosl.addEventListener("input", ()=>{
          src.volume = vosl.value;
          if(vosl.value == 0){
            btn_vo.classList.replace("volume", "mute");
            src.muted = true;
          }
          else{
            btn_vo.classList.replace("mute", "volume");
            src.muted = false;
          }
        });
      
          btn_vo.addEventListener("click", ()=>{
            if(src.muted){
              src.muted = false;
              btn_vo.classList.replace("mute", "volume");
            }
            else{
              src.muted = true;
              btn_vo.classList.replace("volume", "mute");
            }
          });

        function LoadSample(actx, url) {
            return new Promise((resolv)=>{
                fetch(url).then((response)=>{
                    return response.arrayBuffer();
                }).then((arraybuf)=>{
                    return actx.decodeAudioData(arraybuf);
                }).then((buf)=>{
                    resolv(buf);
                })
            });
        }
    
        const canvasctx = document.getElementById("graph").getContext("2d");
    
        function DrawGraph() {
            canvasctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            canvasctx.fillRect(0, 0, 555, 370);
            var barWidth = (555 / 256) * 3.7;
            var barHeight;
            var x = 0;
            const data = new Uint8Array(256);
            if(mode == 0) analyser.getByteFrequencyData(data); //Spectrum Data
            else analyser.getByteTimeDomainData(data); //Waveform Data
            for(var i = 0; i < 256; ++i) {
                canvasctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
                canvasctx.fillRect(x, 370- data[i], barWidth, data[i]);
                x += barWidth + 1;
            }
        }
        setInterval(DrawGraph, 100);
    });
  });
