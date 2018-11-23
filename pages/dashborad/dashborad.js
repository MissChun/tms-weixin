// pages/dashborad/dashborad.js

import {
    httpServer
} from '../../api/request.js'


Page({

    /**
     * 页面的初始数据
     */
    data: {
        dashboradList: [{
            title: '待确认卸货单',
            num: '',
            params: 'confirm_match_count',
            url: '/pages/waybillList/waybillList',
        }]
    },

    onPullDownRefresh() {
        this.getData().then(res => {
            wx.stopPullDownRefresh()
        }).catch(error => {
            wx.stopPullDownRefresh()
        });
    },
    onShow(){
        this.getData();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getData();
    },
    getData() {
        return new Promise((resolve, reject) => {
            let postData = {
                filter_type: 'dispatch_centre_schedule'
            }
            wx.showLoading({
                title: '数据加载中',
                mask: true,
            });
            httpServer('getDashborad', postData).then(res => {
                if (res.data && res.data.code === 0) {

                    let dashboradListCopy = [...this.data.dashboradList];
                    dashboradListCopy[0].num = res.data.data.confirm_match_count;

                    this.setData({
                        dashboradList: dashboradListCopy
                    })
                }
                wx.hideLoading();
                resolve(res)
            }).catch(() => {
                 wx.hideLoading();
                reject();
            })
        })

    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})