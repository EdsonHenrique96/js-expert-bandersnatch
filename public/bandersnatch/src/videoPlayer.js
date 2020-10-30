class VideoPlayer {
  constructor({ manifestJSON, network }) {
    this.manifestJSON = manifestJSON;
    this.network = network;
    this.videoElement = null;
    this.sourceBuffer = null;
    this.videoDuration = 0;
    this.selected = {};
  }

  initializeCodec(){
    this.videoElement = document.getElementById("vid");
   
    const mediaSourceSupported = !!window.MediaSource;
    if(!mediaSourceSupported){
      alert('Seu browser ou sistema não suporta a MSE');
      return;
    }

    const codecSupported = window.MediaSource.isTypeSupported(this.manifestJSON.codec);
    if(!codecSupported) {
      alert(`Seu browser não suporta o codec utilizado: ${this.manifestJSON.codec}`);
      return;
    }

    const mediaSource = new MediaSource();
    this.videoElement.src = URL.createObjectURL(mediaSource);
    
    mediaSource.addEventListener("sourceopen", this.sourceOpenWrapper(mediaSource))
  }

  sourceOpenWrapper(mediaSource) {
    return async(_) => {
      this.sourceBuffer = mediaSource.addSourceBuffer(this.manifestJSON.codec);
      const selected = this.selected = this.manifestJSON.intro;

      // Evita rodar como live
      mediaSource.duration = this.videoDuration;

      await this.fileDowload(selected.url);
    }
  }

  async fileDowload(url){
    const prepareUrl = {
      url,
      fileResolution: 720,
      fileResolutionTag: this.manifestJSON.fileResolutionTag,
      hostTag: this.manifestJSON.hostTag,
    }

    const finalURL = this.network.parseManifestURL(prepareUrl);
    this.setVideoPlayerDuration(finalURL);
    const data = await this.network.fetchFile(finalURL);

    return this.processBufferSegments(data);
  }

  setVideoPlayerDuration(finalUrl) {
    const bars = finalUrl.split('/');
    const [_, videoDuration] = bars[bars.length - 1].split('-');
    this.videoDuration += videoDuration; 
  }

  async processBufferSegments(allSegments) {
    const sourceBuffer = this.sourceBuffer;
    sourceBuffer.appendBuffer(allSegments);

    return new Promise((resolve, reject) => {
      const updateEnd = (_) => {
        sourceBuffer.removeEventListener("updateend", updateEnd);
        sourceBuffer.timestampOffset = this.videoDuration;

        return resolve();
      };

       sourceBuffer.addEventListener("updateend", updateEnd);
       sourceBuffer.addEventListener("error", reject);
    });
  }
}