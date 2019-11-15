//获取全局唯一的版本更新管理器
const updateManager = wx.getUpdateManager();

//向微信后台检查是否有新版本
const checkUpdate = function() {
    return new Promise((resolve, reject) => {
        updateManager.onCheckForUpdate(res => {
            if (res.hasUpdate) {
                resolve();
            } else {
                reject();
            }
        })
    })
}

//下载新版本
const dowloadNewVersion = function() {
    wx.showLoading({ title: '正在下载新版本' });
    //下载成功
    updateManager.onUpdateReady(() => {
            wx.hideLoading();
            wx.showModal({
                title: '下载成功',
                content: `新版本已下载完成，点击下方重启按钮，体验新功能吧～`,
                showCancel: false,
                comfireText: '立即重启',
                success: (res => {
                    if (res.comfirm) {
                        updateManager.applyUpdate();
                    }
                })
            })
        })
        //下载失败
    updateManager.onUpdateFailed(() => {
        wx.showModal({
            title: '下载失败',
            content: `由于不知名的原因，新版本下载失败了，请您删除当前小程序，重新搜索打开哟~`,
        })
    })
}
module.exports = checkUpdate, dowloadNewVersion;