import http from '../../../utils/Base';
import api from '../../../utils/API';
var noPayOrder = new Object();
Page({
    data: {
        imageUrl: "https://mingrui-static.oss-cn-shenzhen.aliyuncs.com/",

        orderInfo: {},
        goodInfo: {},
        group_id: null,
        discount: 0, //团购优惠
        integral: 0, //积分
    },
    onLoad: function(e) {
        var data = JSON.parse(e.orderInfo);
        console.log(data)

        var goodInfo = data.goodsList[0];
        this.setData({
            orderInfo: data,
            group_id: data.group_id
        })
        for (let index in goodInfo) {
            this.modefiyGoodInfo(index, goodInfo[index]);
        }
        //计算团购优惠
        this.setData({
                discount: ((goodInfo.market_price - goodInfo.retail_price) * goodInfo.number).toFixed(2),
            })
            //计算积分
        this.setData({
                integral: parseInt(data.actual_price),
            })
            //记录团购id订单id，团购id作为字段名，订单id作为值
        if (!wx.getStorageSync('noPayOrder')) {
            noPayOrder = new Object();
        } else {
            noPayOrder = wx.getStorageSync('noPayOrder');
            console.log(noPayOrder);
        }
        noPayOrder[data.group_id] = data.id;
        wx.setStorageSync('noPayOrder', noPayOrder);

    },

    modefiyGoodInfo(name, value) {
        var key = `goodInfo.${name}`;
        this.setData({
            [key]: value,
        })
    },
    onShow(e) {

    },
    onUnload(e) {

    },
    payment(e) {
        var that = this;
        http.get(api.WechatPay, {
            order_id: e.currentTarget.dataset.id,
            user_id: wx.getStorageSync('userInfoInServer').id
        }).then(res => {
            console.log(res);
            wx.requestPayment({
                timeStamp: res.timeStamp,
                nonceStr: res.nonceStr,
                package: res.package,
                signType: res.signType,
                paySign: res.paySign,
                success: function(res1) {
                    wx.showModal({
                        title: '支付成功',
                        cancelText: "返回首页",
                        confirmText: "继续拼团",
                        confirmColor: "#ff6b5d",
                        content: "您已完成拼团支付～",
                        success: function(res2) {
                            noPayOrder[that.data.group_id] = null;
                            wx.setStorageSync('noPayOrder', noPayOrder);
                            if (res2.confirm) {
                                wx.reLaunch({
                                    url: '/pages/tuangou/index',
                                })
                            } else {
                                wx.reLaunch({
                                    url: '/pages/index',
                                })
                            }
                        }
                    })
                },
                fail: function(res) {
                    console.log(res)
                    wx.showToast({
                        icon: 'none',
                        title: '支付未完成'
                    })
                }
            })
        })
    }
})