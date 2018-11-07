// pages/setting/setting.js
import {
    httpServer
} from '../../api/request.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        department: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getUserInfo();
    },

    getDepartment(phone) {
        httpServer('getDepartment', {
            phone: phone
        }).then(res => {
            if (res.data && res.data.code === 0) {
                this.setData({
                    department: res.data.data.results[0]
                })
            } else {
                if (res.data && res.data.msg) {
                    wx.showModal({
                        content: res.data.msg,
                        showCancel: false,
                    })
                }

            }
        })
    },

    getUserInfo() {
        wx.showLoading({
            title: '数据加载中',
            mask: true,
        })
        httpServer('getUserInfo').then(res => {
            if (res.data && res.data.code === 0) {
                this.setData({
                    userInfo: res.data.data
                })
                wx.hideLoading();
                this.getDepartment(res.data.data.phone)
            }
        })
    },

    logout() {

        wx.showModal({
            title: '请确认',
            content: '退出账号',
            success(res) {
                if (res.confirm) {
                    httpServer('logout').then(res => {
                        if (res.data && res.data.code === 1) {
                            wx.clearStorage();
                            wx.redirectTo({
                                url: '/pages/index/index'
                            })
                        } else {
                            if (res.data && res.data.msg) {
                                wx.showModal({
                                    content: res.data.msg,
                                    showCancel: false,
                                })
                            }

                        }
                    })


                } else if (res.cancel) {
                    //console.log('用户点击取消')
                }
            }
        })


    },
    /**
     * 用户点击右上角分享
     */
    onShareAppmsg() {

    }
})