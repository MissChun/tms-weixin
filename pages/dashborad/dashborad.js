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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let postData = {
            filter_type: 'dispatch_centre_schedule'
        }
        httpServer('getDashborad', postData).then(res => {
            if (res.data && res.data.code === 0) {
                let dashboradListCopy = [...this.data.dashboradList];
                dashboradListCopy[0].num = res.data.data.confirm_match_count;

                this.setData({
                    dashboradList: dashboradListCopy
                })

            }
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})