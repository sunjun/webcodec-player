## 播放器流程

1. websocket加载
2. flv解析
3. webcodec解码
4. canvas渲染

## 推流测试命令

`ffmpeg -re  -stream_loop -1 -i test.mp4 -c:v copy -rtsp_transport tcp  -f rtsp rtsp://172.28.136.204:8554/live/test121`

`ws://172.28.136.204:8080/live/test121.live.flv`

## TODO:

1. 播放器创建销毁
2. 全屏功能
3. 播放器断线重连逻辑
