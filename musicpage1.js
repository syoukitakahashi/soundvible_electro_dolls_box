window.addEventListener('DOMContentLoaded', function(){
    window.addEventListener("load", async ()=>{
        const audioctx = new AudioContext();
        const audioElement = document.querySelector('#bgm');
        const bgm = audioctx.createMediaElementSource(audioElement);
        const gainvol = new GainNode(audioctx,{gain:1.5});
        let mode = 0;
        //let src = null;
        const analyser = new AnalyserNode(audioctx, {smoothingTimeConstant:0.7});
        const btn_loop = document.querySelector("#btn_loop");
        const btn_vo = document.querySelector("#btn_vo");
        const vosl = document.querySelector("#volumesl");
        
        bgm.connect(gainvol).connect(analyser).connect(audioctx.destination);
        
        document.getElementById("btn_play").addEventListener("click",()=>{
          if( ! bgm.paused ){
            bgm.pause();
            stopTimer();
          }
          else{
            bgm.play();
            startTimer();
          }
        });

        document.getElementById("btn_stop").addEventListener("click",()=>{
            bgm.pause();
            bgm.currentTime = 0;
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
          if(bgm.loop){
            bgm.loop = false;
          }
          else{
            bgm.loop = true;
          }
        });
      
        vosl.addEventListener("input", ()=>{
          gainvol.gain.value = vosl.value;
          if(vosl.value == 0){
            btn_vo.classList.replace("volume", "mute");
            gainvol.gain.value = 0;
          }
          else{
            btn_vo.classList.replace("mute", "volume");
            gainvol.gain.value = vosl.value;
          }
        });
    
        btn_vo.addEventListener("click", ()=>{
          if(gainvol.gain.value == 0){
            gainvol.gain.value = vosl.value;
            btn_vo.classList.replace("mute", "volume");
          }
          else{
            gainvol.gain.value = 0;
            btn_vo.classList.replace("volume", "mute");
          }
        });
        
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