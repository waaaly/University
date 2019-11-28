import { dealChatTime } from "./time";

/**
 * 这个类是IM模拟类，作为示例仅供参考。
 */
export default class IMOperator {
    static VoiceType = 'voice';
    static TextType = 'text';
    static ImageType = 'image';
    static CustomType = 'custom';

    constructor(father, friend) {
        this._app = father;
        this._friend = friend;
        this._latestTImestamp = 0; //最新消息的时间戳
        this._myHeadUrl = wx.getStorageSync('userInfoInServer').avatar;
    }

    getFriendId() {
        return this._friend.sender_id;
    }
    getFriendName() {
        return this._friend.sender_name;
    }
    getFriendAvatar() {
        return this._friend.avatar;
    }
    onSimulateReceiveMsg(cbOk) {
        this._app.getIMHandler().setOnReceiveMessageListener({
            listener: (msg) => {
                // if (!msg.msg) {
                //     return;
                // }
                // res.msg.isMy = res.msg.msgUserId === wx.getStorageSync('userInfoInServer').id;
                // const item = this.createNormalChatItem(msg.msg);
                // const item = this.createNormalChatItem({type: 'voice', content: '上传文件返回的语音文件路径', isMy: false});
                // const item = this.createNormalChatItem({type: 'image', content: '上传文件返回的图片文件路径', isMy: false});
                this._latestTImestamp = msg.timestamp;
                //这里是收到好友消息的回调函数，建议传入的item是 由 createNormalChatItem 方法生成的。
                cbOk && cbOk(msg);
            }
        });

    }

    async onSimulateSendMsg({ content }) {
        //这里content即为要发送的数据
        //这里的content是一个对象了，不再是一个JSON格式的字符串。这样可以在发送消息的底层统一处理。
        try {
            //去构造要发送的数据结构
            const msgObj = this.createNormalChatItem(content);
            this._latestTImestamp = msgObj.timestamp;
            const msg = await this._app.getIMHandler().sendMsg({ msgObj });
            return Promise.resolve({ msg });
        } catch (e) {
            return Promise.reject(e);
        }
    }

    createChatItemContent({ type = IMOperator.TextType, content = '', duration } = {}) {
        if (!content.replace(/^\s*|\s*$/g, '')) return;
        return {
            content,
            type,
            //conversationId: 0, //会话id，目前未用到
            userId: wx.getStorageSync('userInfoInServer').id,
            friendId: this.getFriendId(), //好友id
            duration
        };
    }

    createNormalChatItem({ type = IMOperator.TextType, content = '', isMy = 'true', duration } = {}) {
        if (!content) return;
        const currentTimestamp = Date.now();
        const time = dealChatTime(currentTimestamp, this._latestTImestamp);
        let obj = {
            myId: wx.getStorageSync('userInfoInServer').id, //
            friendId: this.getFriendId(), //好友idimOperator
            myName: wx.getStorageSync('userInfoInServer').name,
            headUrl: isMy == 'true' ? this._myHeadUrl : this.getFriendAvatar(), //显示的头像，自己或好友的。
            isMy, //我发送的消息？
            showTime: time.ifShowTime ? 'true' : 'false', //是否显示该次发送时间
            time: time.timeStr, //发送时间 如 09:15,
            timestamp: currentTimestamp, //该条数据的时间戳，一般用于排序
            type, //内容的类型，目前有这几种类型： text/voice/image/custom | 文本/语音/图片/自定义
            content, // 显示的内容，根据不同的类型，在这里填充不同的信息。          
            sendStatus: 'sending', //发送状态，目前有这几种状态：sending/success/failed | 发送中/发送成功/发送失败
            voiceDuration: duration, //语音时长 单位秒
            isPlaying: 'false', //语音是否正在播放
        };
        if (type !== IMOperator.TextType) {
            obj.saveKey = content; //saveKey是存储文件时的key
        }
        return obj;
    }

    static createCustomChatItem() {
        return {
            timestamp: Date.now(),
            type: IMOperator.CustomType,
            content: '会话已关闭'
        }
    }

}