import { getIMHandlerFactory } from "./im-factory";

export default class AppIMDelegate {
    constructor(app) {
        console.log('creat appIMDelegate');
        this._app = app;
    }

    onLaunch() {
        this.iIMHandler = getIMHandlerFactory;
    }

    onShow() {
        //用户登录小程序才能登录socket 
        if (wx.getStorageSync('userInfoInServer')) {
            console.log('creat socket connection');
            const userInfo = {
                userId: wx.getStorageSync('userInfoInServer').id,
                nickName: wx.getStorageSync('userInfoInServer').name,
                myHeadUrl: wx.getStorageSync('userInfoInServer').avatar
            }
            this.iIMHandler.createConnection('ws://192.168.1.3:8001', userInfo);
        } else {
            console.log('user not logined');
        }

    }

    onHide() {

    }

    getIMHandlerDelegate() {
        return this.iIMHandler;
    }
}