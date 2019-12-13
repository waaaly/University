import IIMHandler from "./i-im-handler";
import http from '../../utils/Base';
import api from '../../utils/API';
export default class WebSocketHandlerImp extends IIMHandler {
    constructor() {
        super();
        this._onSocketOpen();
        this._onSocketMessage();
        this._onSocketError();
        this._onSocketClose();
    }

    /**
     * 创建WebSocket连接
     * 如：this.imWebSocket = new IMWebSocket();
     *    this.imWebSocket.createSocket({url: 'ws://10.4.97.87:8001'});
     * 如果你使用本地服务器来测试，那么这里的url需要用ws，而不是wss，
     * 因为用wss无法成功连接到本地服务器
     * @param url 建立连接时需要的配置信息，这里是传入的url，
     * 即你的服务端地址，端口号不是必需的。
     * _isLogin: 是否已连接socket
     */
    createConnection(url, userInfo) {
        this._userInfo = userInfo;
        !this._isLogin && wx.connectSocket({
            url: url,
            header: {
                'content-type': 'application/json'
            },
            method: 'GET'
        });
    }

    _sendMsgImp({ msgObj, success, fail }) {
        let data = `${msgObj.content},${msgObj.myId},${msgObj.friendId},${msgObj.headUrl},${msgObj.isMy},${msgObj.isPlaying},${msgObj.msgId},${msgObj.sendStatus},${msgObj.showTime},${msgObj.time},${msgObj.timestamp},${msgObj.type},${msgObj.voiceDuration},${msgObj.myName}`;
        wx.sendSocketMessage({
            data: data,
            success: () => {
                success && success({ msgObj });
            },
            fail: (res) => {
                fail && fail(res);
            }
        });
    }


    /**
     * 关闭webSocket
     */
    closeConnection() {
        wx.closeSocket();
    }

    _onSocketError(cb) {
        wx.onSocketError((res) => {
            this._isLogin = false;
            console.log('WebSocket连接打开失败，请检查！', res);
        })
    }

    _onSocketClose(cb) {
        wx.onSocketClose((res) => {
            this._isLogin = false;
            console.log('WebSocket 已关闭！', res)
        });
    }

    _onSocketOpen() {
        wx.onSocketOpen((res) => {
            console.log('WebSocket连接已打开！');
        });
    }

    /**
     * webSocket是在这里接收消息的
     * 在这个函数里做消息的分发
     * 并调用监听回调函数
     * @private
     */
    _onSocketMessage() {
        wx.onSocketMessage((res) => {
            var data = JSON.parse(res.data);
            let msg = new Object();
            console.log('socket receive msg:', data);
            switch (data.type) {
                case 'init':
                    this._isLogin = true;
                    msg['client_id'] = data.client_id;
                    //收到服务器连接socket成功返回的消息，绑定socket凭证
                    http.post(api.SocketBind, {
                        client_id: msg.client_id,
                        user_id: wx.getStorageSync('userInfoInServer').id
                    }, false, false).then((res) => {
                        console.log('socket绑定成功');
                    })
                    break;
                case '@heart@':
                    break;
                default:
                    msg = data.message;
                    //自己发出的消息
                    if (msg.isMy == 'false') {
                        wx.playBackgroundAudio({
                            dataUrl: 'https://mingrui-static.oss-cn-shenzhen.aliyuncs.com/voice/msg.mp3',
                        });
                        wx.vibrateLong();
                        wx.showTabBarRedDot({ index: 2 });
                    }
                    this._receiveListener && this._receiveListener(msg);
                    break;
            }
        })
    }
}