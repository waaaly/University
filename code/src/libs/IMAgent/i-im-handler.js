/**
 * 由于JavaScript没有接口的概念，所以我编写了这个IM基类
 * 将你自己的IM的实现类继承这个类就可以了
 * 我把IM通信的常用方法封装在这里，
 * 有些实现了具体细节，但有些没实现，是作为抽象函数，由子类去实现细节，这点是大家需要注意的
 */
export default class IIMHandler {
    constructor() {
        this._isLogin = false;
        this._msgQueue = [];
        this._receiveListener = null;
        this._userInfo = null;
    }

    /**
     * 创建IM连接
     * @param options 传入你建立连接时需要的配置信息，比如url
     */
    createConnection({ options }) {
        // 作为抽象函数
    }


    /**
     * 发送消息
     * @param msgObj 需要发送的消息，是一个对象，如{type:'text',content:'abc'}
     */
    sendMsg({ msgObj }) {
        return new Promise((resolve, reject) => {
            if (this._isLogin) {
                return this._sendMsgImp({ msgObj, success: resolve, fail: reject });
            } else {
                this._msgQueue.push({ msgObj, resolve, reject });
            }
        });
    }

    /**
     * 消息接收监听函数
     * @param listener
     */
    setOnReceiveMessageListener({ listener }) {
        this._receiveListener = listener;
    }

    closeConnection() {
        // 作为抽象函数
    }

    _sendMsgImp({ msgObj, success, fail }) {
        // 作为抽象函数
    }
}