/**
 * 用户处理消息的收发UI更新
 */
export default class UI {
    constructor(page) {
        this._page = page;
    }

    /**
     * 接收到消息时，更新UI
     * @param msg
     */
    updateViewWhenReceive(msg) {
        this._page.data.chatItems.push(msg);
        // this._page.data.chatItems = this._page.data.chatItems.sort(UI._sortMsgListByTimestamp);
        this._page.data.scrollTopVal = this._page.data.chatItems.length * 999;
        this._page.$apply();
    }

    /**
     * 发送消息时，渲染消息的发送状态为 发送中
     * @param sendMsg
     */
    async showItemForMoment(sendMsg) {
        if (!sendMsg) return;
        this.updateDataWhenStartSending(sendMsg);
        return { itemIndex: this._page.data.chatItems.length - 1 };
    }

    /**
     * 设置消息发送状态为 发送中
     * @param sendMsg
     * @param addToArr
     * @param needScroll
     */
    updateDataWhenStartSending(sendMsg, addToArr = true, needScroll = true) {
        this._page.$invoke('chatInput', 'closeExtraView');
        sendMsg.sendStatus = 'sending';
        addToArr && this._page.chatItems.push(sendMsg);
        console.log('设置消息发送状态为发送中:', sendMsg);
        this._page.data.textMessage = '';
        this._page.data.chatItems = this._page.chatItems;
        needScroll && (this._page.data.scrollTopVal = this._page.data.chatItems.length * 999);
        this._page.$apply();
    }

    /**
     * 设置消息发送状态为 发送成功
     * @param sendMsg
     * @param itemIndex
     */
    updateViewWhenSendSuccess(sendMsg, itemIndex) {
            let item = this._page.data.chatItems[itemIndex];
            item.timestamp = sendMsg.timestamp;
            this.updateSendStatusView('success', itemIndex);
        }
        /**
         * 更新视图
         */
    updateListViewBySort() {
        this._page.data.chatItems = this._page.data.chatItems.sort(UI._sortMsgListByTimestamp);
        this._page.$apply();
    }

    /**
     * 设置消息发送状态为 发送失败
     * @param itemIndex
     */
    updateViewWhenSendFailed(itemIndex) {
        this.updateSendStatusView('failed', itemIndex);
    }

    updateSendStatusView(status, itemIndex) {
        this._page.data.chatItems[itemIndex].sendStatus = status;
        this._page.$apply();
    }

    updateChatStatus(content, open = true) {
            this._page.data.chatStatue = open ? 'open' : 'close';
            this._page.data.chatStatusContent = content;
            this._page.$apply();
        }
        /**
         * 排序函数，按时间戳升序排序 最新（大值）的在后
         * @param {*} item1 
         * @param {*} item2 
         */
    static _sortMsgListByTimestamp(item1, item2) {
        return item1.timestamp - item2.timestamp;
    }
}