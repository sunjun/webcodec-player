export class Player {
    constructor(options) {
        this.demuxDecodeWorker = null;
        this.canvas = null; 
        this.$container = options.container;
        this.offscreen = null;
        this._initCanvas();
        this.showVbps = options.showVbps;

        this.demuxDecodeWorker = new Worker("./demux_decode_worker.js");
        this.demuxDecodeWorker.postMessage({ canvas: this.offscreen, type: "init"}, [this.offscreen]);
        this.demuxDecodeWorker.addEventListener('message', this.handleMessageFromWorker);
    }

    _initCanvas() {
        this.canvas = document.createElement('canvas');
        this.$container.appendChild(this.canvas);
        this.offscreen = this.canvas.transferControlToOffscreen();
    }

    play(uri) {
        this.demuxDecodeWorker.postMessage({ uri: uri, type: "play"});
        if (this.showVbps) {
            this.demuxDecodeWorker.postMessage({type: "showVbps"});
        }
        console.log("Player start play");
    }

    pause() {
    }

    destroy() {
        this.demuxDecodeWorker.postMessage({type: "destroy"});
        this.$container.replaceChildren();
        console.log("Player destroyed");
    }

    handleMessageFromWorker(msg) {
        // console.log('incoming message from worker, msg:', msg);
        switch (msg.data.type) {
            case 'updateStatus':
                console.log('updateStatus:', msg.data.status);
                break;
            default:
                throw 'no aTopic on incoming message to ChromeWorker';
        }
    }

}
 