
class FLVDemuxer {
    constructor() {
        this.uri = null;
        this.ws = null;
        this.logger = new Logger("Downloader");
        this.outputCount = 0;
        this.hexString = "";
        this.hexChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
        this._onVideoData = null;
        this.state = 0; // 0: header, 1: body   
        this.bodyState = 0; // 0: size, 1: tag header, 2: tag body
        this.signature = '';
        this.version = 0x01;
        this.hasAudio = false;
        this.hasVideo = false;
        this.offset = 0x00;
        this.type = 0x00;
        this.size = 0;
        this.timestamp = 0;
        this.streamId = 0;
    }

    byteToHex(b) {
        return this.hexChar[(b >> 4) & 0x0f] + this.hexChar[b & 0x0f];
    }

    parseHeader(buffer) {
        let uint8Buffer = new Uint8Array(buffer);
        let sliceArray = uint8Buffer.slice(0, 3);

        this.signature = new TextDecoder("utf-8").decode(sliceArray);
        //this.signature = uint8Buffer.slice(0, 3).toString('utf-8');
        this.version = uint8Buffer[3];
        if (this.signature != 'FLV' || this.version != 0x01) {
            return false;
        }

        let flags = uint8Buffer[4];
        this.hasAudio = (flags & 4) >>> 2 == 1;
        this.hasVideo = (flags & 1) == 1;
        // this.offset = buffer.readUInt32BE(5);
        // if (this.offset != 9) {
        //     return false;
        // }
        return true;
    }

    parseTagHeader(buffer) {
        let uint8Buffer = new Uint8Array(buffer);
        this.type = uint8Buffer[0];
        // this.size = buffer.readUInt24BE(1);
        let ts0 = uint8Buffer[4] << 16 + uint8Buffer[5] << 8 + uint8Buffer[6];
        let ts1 = uint8Buffer[7];
        this.timestamp = (ts1 << 24) | ts0;
        // this.streamId = buffer.readUInt24BE(8) >> 8;
    }

    demux(data) {
        if (this.state == 0) {
            if (this.parseHeader(data) == false) {
                self.logger.logError("parseHeader error " + data);
                //TODO: parse header error
                return;
            }
            this.state = 1;
        } else if (this.state == 1) {
            if (this.hasVideo == false) {
                //TODO: no video return error
                return;
            }

            if (this.bodyState == 0) {
                // previous tag size
                this.bodyState = 1;
                // this.videoTagHeader = data;
            } else if (this.bodyState == 1) {
                // tag header
                this.bodyState = 2;
                this.parseTagHeader(data);
                // this.onVideoData(this.videoTagHeader, this.videoTagBody);
            } else if (this.bodyState == 2) {
                // tag data
                if (this.type == 0x09) {
                    //this is video data
                    this._onVideoData(data, this.timestamp);
                }
                this.bodyState = 0;
            }
        }
    }

    open(onVideoData, uri) {
        this.uri = uri;
        this._onVideoData = onVideoData;
        if (this.ws == null) {
            this.ws = new WebSocket(this.uri);
            this.ws.binaryType = 'arraybuffer';

            // self.logger.logInfo("data length ", evt.data.byteLength);
            let self = this;
            this.ws.onopen = function (evt) {
                self.logger.logInfo("Ws connected.");
                console.log("FLVDemuxer: " + uri);
                // self.ws.send(msg);
            };

            this.ws.onerror = function (evt) {
                self.logger.logError("Ws connect error " + evt.data);
            }

            this.ws.onmessage = function (evt) {
                self.demux(evt.data);
            };
        }
    }
}