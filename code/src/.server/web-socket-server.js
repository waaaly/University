let ws = require("nodejs-websocket");

/**
 * 这个类是模拟webSocket服务端
 */
module.exports = class WebSocketServer {
    constructor() {
        this.connMap = new Map();
        this._pageMap = new Map();
        this._count = 0; //当前连接人数
        this.newConnetion = null, //新加入的连接
            this._unreadObj = {};
        this._users = [{
            userId: '79',
            nickName: '李恺新',
            myHeadUrl: 'http://tx.haiqq.com/uploads/allimg/170504/0641415410-1.jpg'
        }, {
            userId: '84',
            nickName: '柳如月',
            myHeadUrl: 'https://wx.qlogo.cn/mmopen/vi_32/kYOwh97juHqaPUNiaup5X7G4ibAKAVFy95KxpwKgsYXPlYibkkra7Eo1uGIcvmdmAvmoFcf7uWgQSjPjEjh0JJ7Pw/132'
        }, ];
        for (let value of this._users) {
            this._unreadObj[value.userId] = 0;
        }
        this._msgPool = []; //会话列表
        this._msgPool.push({
            msgUserId: this._users[0].userId, //这条消息的拥有者是79
            msgUserName: this._users[0].nickName,
            msgUserHeadUrl: this._users[0].myHeadUrl,
            friendId: this._users[1].userId,
            friendHeadUrl: this._users[1].myHeadUrl,
            friendName: this._users[1].nickName,
            timestamp: 1533294362000,
            timeStr: '19:06',
            content: JSON.stringify({
                "type": "text",
                "content": "周末有时间一起参加社团活动吗？"
            })
        });

    }

    create() {
        this.server = ws.createServer((conn) => {
            console.log('New connection');
            conn.on("text", (str) => {
                console.log("收到的信息为:" + str);
                let msg = JSON.parse(str);
                this._pageMap.set(msg.userId, msg.type);
                if (msg.type === 'get-conversations') {
                    conn.sendText(JSON.stringify({
                        type: msg.type,
                        conversations: this.getConversation(msg.userId)
                    }));
                    return;
                } else if (msg.type === 'get-history') {
                    this._unreadObj[msg.userId] = 0;
                    let temp;
                    this.getSingleHistoryMsg(msg.userId, msg.friendId).forEach(item => {
                        temp = JSON.parse(item.content);
                        conn.sendText(JSON.stringify({
                            type: temp.type,
                            content: temp.content,
                            msgUserId: item.msgUserId,
                            userId: msg.userId,
                            friendId: item.friendId,
                            timestamp: item.timestamp,
                            timeStr: item.timeStr,
                            duration: item.duration
                        }));
                    });
                    return;
                } else if (msg.type === 'login') {
                    this.connMap.set(msg.userId, newConnetion);
                    this.newConnetion = null;
                    return;
                }
                msg.timestamp = Date.now();
                let connTemp = this.connMap.get(msg.friendId);
                !!connTemp && this.sendText(connTemp, msg, (msgSendFinally) => {
                    let friend = this._users.find(item => item.userId === msg.friendId);
                    let my = this._users.find(item => item.userId === msg.userId);
                    let timeStr = this.getMyTime(msg.timestamp);
                    this._msgPool.push({
                        msgUserId: my.userId, //这条消息的拥有者是my
                        msgUserName: my.nickName,
                        msgUserHeadUrl: my.myHeadUrl,
                        friendId: friend.userId,
                        friendHeadUrl: friend.myHeadUrl,
                        friendName: friend.nickName,
                        timestamp: msg.timestamp,
                        timeStr: timeStr,
                        duration: msg.duration,
                        content: msgSendFinally
                    });
                });

            });
            conn.on("close", function(code, reason) {
                this._count -= this._count;
                console.log('断开连接,当前人数', this._count);
            });
            conn.on("error", function(code, reason) {
                console.log("异常关闭", code, reason)
            });
        }).listen(8001);
        this.server.on('connection', (conn, req) => {
            this.newConnetion = conn;
            this._count++;
            console.log('用户连接,当前人数', this._count);
            //回复客户端连接成功
            conn.sendText(JSON.stringify({ type: 'login' }));
        });
        console.log("WebSocket服务端建立完毕");
        return this;
    }

    close() {
        this.server.close();
        console.log("WebSocket服务关闭");
    }

    sendText(conn, msg, cbOk) {
        if (this._pageMap.get(msg.friendId) !== 'get-conversations') {
            let { type, content, duration, timestamp } = msg;
            const msgSendFinally = JSON.stringify({ type, content, duration, timestamp });
            conn.sendText(msgSendFinally, () => {
                cbOk && cbOk(msgSendFinally);
            });
        } else {
            let { type, content, friendId, duration, timestamp } = msg;
            this._unreadObj[friendId]++;
            const msgSendFinally = JSON.stringify({ type, content, duration, timestamp });
            cbOk && cbOk(msgSendFinally);
            conn.sendText(JSON.stringify({
                type: 'get-conversations',
                conversations: this.getConversation(friendId)
            }))
        }
    }

    getSingleHistoryMsg(userId, friendId) {
        return this._msgPool.filter(item => userId === item.msgUserId && friendId === item.friendId ||
            userId === item.friendId && friendId === item.msgUserId);
    }

    getConversation(userId) {
        let conversations = [];
        for (let item of this._msgPool) {

            if (item.msgUserId == userId) {
                conversations.push({
                    friendId: item.friendId,
                    msgUserId: item.msgUserId, //消息的所有人id
                    friendHeadUrl: item.friendHeadUrl, //好友头像
                    conversationId: -1, //会话id，目前未用到
                    friendName: item.friendName, //好友昵称
                    latestMsg: item.content, //最新一条消息
                    unread: 0, //未读消息计数
                    timestamp: item.timestamp, //最新消息的时间戳
                    timeStr: item.timeStr //最新消息的时间
                });
            }
        }
        // let item = this._msgPool[this._msgPool.length - 1];
        // const itemContent = JSON.parse(item.content);
        // delete itemContent.userId;
        // delete itemContent.friendId;

        // if (item.msgUserId === userId) { //本人会话
        //     conversations.push({
        //         friendId: item.friendId,
        //         msgUserId: item.msgUserId, //消息的所有人id
        //         friendHeadUrl: item.friendHeadUrl, //好友头像
        //         conversationId: -1, //会话id，目前未用到
        //         friendName: item.friendName, //好友昵称
        //         latestMsg: item.content, //最新一条消息
        //         unread: 0, //未读消息计数
        //         timestamp: item.timestamp, //最新消息的时间戳
        //         timeStr: item.timeStr //最新消息的时间
        //     });
        // } else if (item.friendId === userId) { //以好友身份获取会话
        //     conversations.push({
        //         friendId: item.msgUserId,
        //         msgUserId: item.msgUserId, //消息的所有人id
        //         friendHeadUrl: item.msgUserHeadUrl, //好友头像
        //         conversationId: -1, //会话id，目前未用到
        //         friendName: item.msgUserName, //好友昵称
        //         latestMsg: item.content, //最新一条消息
        //         unread: this._unreadObj[userId], //未读消息计数
        //         timestamp: item.timestamp, //最新消息的时间戳
        //         timeStr: item.timeStr //最新消息的时间
        //     });
        // }
        return conversations;
    }

    getMyTime(timestamp) {
        let date = new Date(timestamp);
        let hours = date.getHours(),
            minutes = date.getMinutes();
        return `${hours >= 10 ? hours : '0' + hours}:${minutes > 10 ? minutes : '0' + minutes}`
    }
};