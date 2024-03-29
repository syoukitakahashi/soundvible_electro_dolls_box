    window.addEventListener("load", ()=>{
        const audioctx = new AudioContext();          
        const audioElement = document.querySelector('#bgm');
        var bgm = audioctx.createMediaElementSource(audioElement);
        let mode = 0;
        const btn_loop = document.querySelector("#btn_loop");
        const btn_vo = document.querySelector("#btn_vo");
        const vosl = document.querySelector("#volumesl");
        const playback_position = document.getElementById("playback_position");
        const end_position = document.getElementById("end_position");
        const slider_progress = document.getElementById("progress");
        
        const gainvol = new GainNode(audioctx,{gain:0.7});
        const analyser = new AnalyserNode(audioctx, {smoothingTimeConstant:0.2});
        
        var playtimer = null;
        
                // 音声ファイルの再生準備が整ったときに実行
        audioElement.addEventListener('canplaythrough', ()=>{
          
          bgm.connect(gainvol).connect(analyser).connect(audioctx.destination);
          slider_progress.max = audioElement.duration;
          playback_position.textContent = convertTime(audioElement.currentTime);
          end_position.textContent = convertTime(audioElement.duration);
        });
        
        // 再生時間の表記を「mm:ss」に整える
        const convertTime = function(time_position) {   
          time_position = Math.floor(time_position);
          var res = null;

          if( 60 <= time_position ) {
            res = Math.floor(time_position / 60);
            res += ":" + Math.floor(time_position % 60).toString().padStart( 2, '0');
          } 
          else {
            res = "0:" + Math.floor(time_position % 60).toString().padStart( 2, '0');
          }
          return res;
        };

        // 再生開始したときに実行
        var startTimer = function(){
            playtimer = setInterval(function(){
            playback_position.textContent = convertTime(audioElement.currentTime);
            slider_progress.value = Math.floor( (audioElement.currentTime / audioElement.duration) * audioElement.duration);
          }, 500);
        };

        // 停止したときに実行
        var stopTimer = function(){
          clearInterval(playtimer);
          playback_position.textContent = convertTime(audioElement.currentTime);
        };

        // プログレスバーが操作されたときに実行（メモリを動かしているとき）
        slider_progress.addEventListener("input", e => {
          stopTimer();
          audioElement.currentTime = slider_progress.value;
        });

        // プログレスバーが操作完了したときに実行
        slider_progress.addEventListener("change", e => {
          startTimer();
        });

        // 音声ファイルが最後まで再生されたときに実行
        bgm.addEventListener("ended", e =>{
          stopTimer();
        });
           
        document.getElementById("btn_play").addEventListener("click",()=>{
          if (audioctx.state === "suspended") {
            audioctx.resume();
          }
          if(!audioElement.paused){
            audioElement.pause();
            stopTimer();
          }
          else{
            audioElement.play();
            startTimer();
          }     
        });
        
        document.getElementById("btn_stop").addEventListener("click",()=>{
            audioElement.pause();
            stopTimer();
            audioElement.currentTime = 0;
        });
        
        btn_loop.addEventListener('click', function(){
            this.classList.toggle('btnloop_on');
        });
      
        btn_loop.addEventListener("click", ()=>{
          if(audioElement.loop){
            audioElement.loop = false;
          }
          else{
            audioElement.loop = true;
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
            canvasctx.fillRect(0, 0, 780, 500);
            var barWidth = (780 / 256) * 3.7;
            var barHeight;
            var x = 0;
            const data = new Uint8Array(256);        
            
            if(mode == 0) analyser.getByteFrequencyData(data); //Spectrum Data
            for(var i = 0; i < 256; ++i) {
                barHeight = data[i] * 1.5;
                canvasctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
                canvasctx.fillRect(x, 500- data[i] * 1.5, barWidth, barHeight);
                x += barWidth + 1;
            }
        }
        setInterval(DrawGraph, 100);
    });
