## 播放器基本流程

1. websocket加载
2. flv解析
3. webcodec解码
4. canvas渲染

## 推流测试命令

`ffmpeg -re  -stream_loop -1 -i test.mp4 -c:v copy -rtsp_transport tcp  -f rtsp rtsp://172.28.136.204:8554/live/test121`

`ws://172.28.136.204:8080/live/test121.live.flv`

## 功能已完成
1. websocket flv协议支持
2. h264 webcodec解码支持
3. 播放器基本创建销毁demo

## 功能待实现
1. 全屏功能以及播放器事件回调通知
2. 播放器断线重连逻辑
3. h265 硬件解码支持 
4. 代码打包封装
5. http flv协议支持
