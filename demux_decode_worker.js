importScripts('./flv_demuxer.js');
importScripts('./common.js');

let startTime = 0;
let frameCount = 0;
let hasConfiged = false;
let decoder = null;
let offscreen = null;
let demuxer = null;

const ENCODED_VIDEO_TYPE = {
  key: 'key',
  delta: 'delta'
};


function formatVideoDecoderConfigure(avcC) {
  let codecArray = avcC.subarray(1, 4);
  let codecString = "avc1.";
  for (let j = 0; j < 3; j++) {
    let h = codecArray[j].toString(16);
    if (h.length < 2) {
      h = "0" + h
    }
    codecString += h
  }

  return {
    codec: codecString,
    description: avcC
  }
}

function getFrameStats() {
  let now = performance.now();
  let fps = "";

  if (frameCount++) {
    let elapsed = now - startTime;
    fps = " (" + (1000.0 * frameCount / (elapsed)).toFixed(0) + " fps)"
  } else {
    // This is the first frame.
    startTime = now;
  }

  return "Extracted " + frameCount + " frames" + fps;
}

function onVideoData(videoBuffer, timestamp) {
  console.log("onVideoData");
  let uint8Buffer = new Uint8Array(videoBuffer);

  if (!hasConfiged) {
    if (uint8Buffer[1] == 0) {
      // AVCPacketType == 0, config frame
      const videoCodec = (uint8Buffer[0] & 0x0F);
      if (videoCodec == 7) {
        // avc video codec == 7, h264
        const config = formatVideoDecoderConfigure(uint8Buffer.slice(5));
        decoder.configure(config);
        offscreen.width = 640;
        offscreen.height = 368;
      }
    }
    hasConfiged = true;
  } else {
    const isIFrame = videoBuffer[0] >> 4 === 1;
    const chunk = new EncodedVideoChunk({
      data: videoBuffer.slice(5),
      timestamp: timestamp,
      type: isIFrame ? ENCODED_VIDEO_TYPE.key : ENCODED_VIDEO_TYPE.delta
    })
    decoder.decode(chunk);
  }
}

self.addEventListener('message', function (e) {
  if (e.data.type == 'init') {
    offscreen = e.data.canvas;
    let ctx = offscreen.getContext('2d');
    demuxer = new FLVDemuxer();
    decoder = new VideoDecoder({
      output: frame => {
        ctx.drawImage(frame, 0, 0, offscreen.width, offscreen.height);
        // Close ASAP.
        frame.close();
        // Draw some optional stats.
        ctx.font = '35px sans-serif';
        ctx.fillStyle = "#ffffff";
        ctx.fillText(getFrameStats(), 40, 40, offscreen.width);
      },
      error: e => console.error(e),
    });
  } else if (e.data.type == 'play') {
    // let url = "ws://10.20.10.87/live/test121.live.flv";
    // let url = "ws://10.20.10.87:20080/live/test121.flv";
    // let url = "ws://172.23.110.91:8080/live/test121.live.flv";
    console.log("decoder loaded: " + decoder);
    demuxer.open(onVideoData, e.data.uri);
  }
})