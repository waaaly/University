import { getIMHandlerFactory } from "./im-factory";

export default class AppIMDelegate {
    constructor(app) {
        console.log('creat appIMDelegate');
        this._app = app;
    }

    onLaunch() {
        this.iIMHandler = getIMHandlerFactory;
    }


    getIMHandlerDelegate() {
        return this.iIMHandler;
    }

    creatSockt() {
        //用户登录小程序才能登录socket
        if (wx.getStorageSync('userInfoInServer')) {
            console.log('creat socket connection');
            const userInfo = {
                userId: wx.getStorageSync('userInfoInServer').id,
                nickName: wx.getStorageSync('userInfoInServer').name,
                myHeadUrl: wx.getStorageSync('userInfoInServer').avatar
            }
            this.iIMHandler.createConnection('wss://college.mingrui-gz.com:2000', userInfo);
        } else {
            console.log('user not logined');
        }
    }

    closeSocket() {
        this.iIMHandler.closeConnection();
    }
}