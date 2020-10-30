const MANIFEST_URL = './manifest.json';
const localHostNames = ['127.0.0.1', "localhost"];

async function main() {
    const isLocal =  !!~localHostNames.indexOf(window.location.hostname);
    const manifestJSON = await (await fetch(`${MANIFEST_URL}`)).json();
    const host = isLocal ? manifestJSON.localHost : manifestJSON.productionHost

    const network = new Network({ host });
    const videoPlayer = new VideoPlayer({ 
        manifestJSON: manifestJSON,
        network,
    });
    const videoComponent = new VideoComponent();

    videoPlayer.initializeCodec();
    videoComponent.initializePlayer();
}

window.onload = main