// pages/waybillList/waybillList.js
import {
    httpServer
} from '../../api/request.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        fieldList: [{
            label: '业务单号',
            id: 'order_number',
        }, {
            label: '客户简称',
            id: 'short_name',
        }, {
            label: '液厂',
            id: 'actual_fluid_name',
        }, {
            label: '收货人',
            id: 'consignee',
        }, {
            label: '业务员',
            id: 'sale_man_name',
        }],
        choosedFieldIndex: 1,
        topBarList: [{
            label: '装车',
            param: 'all_truck_loaded',
            isChoosed: true
        }, {
            label: '匹配卸车',
            param: 'all_match',
            isChoosed: false
        }, {
            label: '卸车',
            param: 'all_unload',
            isChoosed: false
        }, {
            label: '变更中',
            param: 'all_change',
            isChoosed: false
        }, {
            label: '全部',
            param: '',
            isChoosed: false
        }],
        currentChoosedBar: 'all_truck_loaded',
        waybillId: '',
        stepId: '',
        sectionTripsDetail: [],
        tractorDetail: '',
        waybillDetail: {},
        confirmMatchList: [],
        match_trip_list: [],
        cancel_trip_list: [],

        isConfirming: false,
        isloading: true,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            waybillId: options.waybillId,
            stepId: options.stepId
        })
        this.getData();
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },
    getSectionTrips() { //获取进程数据
        return new Promise((resolve, reject) => {
            const postData = {
                id: this.data.stepId
            }
            httpServer('getSectionTrips', postData).then(res => {
                resolve(res)
            }).catch(error => {
                reject(error)
            })
        })

    },
    getWaybillDetail() { //获取运单详情
        return new Promise((resolve, reject) => {
            const postData = {
                id: this.data.stepId
            }
            httpServer('getWaybillDetail', postData).then(res => {
                this.getTractor([res.data.data.capacity])
                resolve(res)
            }).catch(error => {
                reject(error)
            })
        })
    },
    getData() {
        let p1 = this.getSectionTrips();
        let p2 = this.getWaybillDetail();
        let confirmMatchList = [];
        let match_trip_list = [];
        let cancel_trip_list = [];

        wx.showLoading({
            title: '数据加载中',
            mask: true,
        });

        Promise.all([p1, p2]).then(res => {
            if (res[0].data.code === 0) {
                this.setData({
                    sectionTripsDetail: res[0].data.data
                })
            }
            if (res[1].data.code === 0) {
                this.setData({
                    waybillDetail: res[1].data.data
                })
            }

            this.data.sectionTripsDetail.map(item => {
                //当type='confirm_match'表示待匹配进程，因为有多个分段，当分段id（identify_id）相同时，表示当前分段需要确定的卸货单。
                if (item.type === 'confirm_match' && item.identify_id === this.data.waybillDetail.identify) {
                    confirmMatchList.push(item);
                    if (item.status == 'new') { //status=new表示新添加，status=cancel时为取消
                        match_trip_list.push(item.trip_id);
                    } else {
                        cancel_trip_list.push(item.trip_id);
                    }
                }
            })

            this.setData({
                confirmMatchList: confirmMatchList,
                match_trip_list: match_trip_list,
                cancel_trip_list: cancel_trip_list,
            })

            wx.hideLoading();


        }).catch(error => {
            wx.hideLoading();
            wx.showToast({
                title: '数据请求失败',
                icon: 'none'
            })
        })

    },
    chooseField(e) {
        this.setData({
            choosedFieldIndex: e.detail.value
        })
    },
    confirmMatch() {
        const postData = {
            cancel_trip_list: this.data.cancel_trip_list,
            match_trip_list: this.data.match_trip_list,
            pickup_trip_id: this.data.stepId
        }
        this.setData({
            isConfirming: true
        })
        httpServer('confirmMatch', postData).then(res => {
            this.setData({
                isConfirming: false
            })
            if (res.data && res.data.code === 0) {
                wx.showToast({
                    title: '确认成功',
                    icon: 'none'
                })

                wx.reLaunch({
                    url: '/pages/waybillList/waybillList',
                })
            } 
        }).catch(error => {
            this.setData({
                isConfirming: false
            })
        })
    },
    getTractor(tractorList) {
        return new Promise((resolve, reject) => {
            const postData = {
                ids: tractorList.join(',')
            }
            httpServer('getTractor', postData).then(res => {
                if (res.data && res.data.code === 0) {
                    this.setData({
                        tractorDetail: res.data.data.results[0]
                    })
                    resolve(res);
                } else {
                    reject(res)
                }
            }).catch(error => {
                reject(error)
            })
        })

    }
})