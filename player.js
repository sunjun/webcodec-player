export class Player {
    constructor(options) {
        this.demuxDecodeWorker = null;
        this.canvas = null; 
        this.$container = options.container;
        this.offscreen = null;
        this._initCanvas();

        this.demuxDecodeWorker = new Worker("./demux_decode_worker.js");
        this.demuxDecodeWorker.postMessage({ canvas: this.offscreen, type: "init"}, [this.offscreen]);

    }

    _initCanvas() {
        this.canvas = document.createElement('canvas');
        this.$container.appendChild(this.canvas);
        this.offscreen = this.canvas.transferControlToOffscreen();
    }

    play(uri) {
        this.demuxDecodeWorker.postMessage({ uri: uri, type: "play"});
    }

    pause() {
    }

    destroy() {
    }
}
 