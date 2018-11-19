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
            id: 'trader_name',
            value: '托运商'
        }, {
            id: 'order_number',
            value: '订单号'
        }, {
            id: 'fluid_name',
            value: '液厂名'
        }, {
            id: 'waybill_number',
            value: '运单号'
        }, {
            id: 'truck_no',
            value: '车号'
        }],
        choosedFieldIndex: 0,
        pageSize: 10,
        currentPage: 1,
        total: '',
        totalPage: '',
        searchword: '',
        topBarList: [{
            label: '全部',
            param: 'all',
            isChoosed: false
        }, {
            label: '待指派',
            param: 'appoint',
            isChoosed: true
        }, {
            label: '待确认',
            param: 'determine',
            isChoosed: false
        }, {
            label: '已确认',
            param: 'confirmed',
            isChoosed: false
        }, {
            label: '历史',
            param: 'history',
            isChoosed: false
        }],
        currentChoosedBar: 'appoint',
        orderListData: [],
        postDataCopy: {},

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            currentChoosedBar: options.currentChoosedBar || 'appoint',
        })

        let topBarListCopy = [...this.data.topBarList];

        topBarListCopy.map(item => {
            item.isChoosed = item.param === this.data.currentChoosedBar ? true : false;
        })

        this.setData({
            topBarList: topBarListCopy,
        })

        this.getOrderList();
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },
    onPullDownRefresh() {
        this.setData({
            currentPage: 1,
            orderListData: [],
            isGettingList: true,

        })
        this.getOrderList().then(res => {
            wx.stopPullDownRefresh()
        }).catch(error => {
            wx.stopPullDownRefresh()
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        this.getOrderList(true);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    chooseField(e) {
        this.setData({
            choosedFieldIndex: e.detail.value
        })
    },
    searchInputChange(e) {
        this.setData({
            searchword: e.detail.value
        })
    },
    startSearch(e) {
        this.setData({
            currentPage: 1,
            orderListData: [],
            isGettingList: true,
        })
        this.getOrderList();
    },
    getOrderList(isGetMoreData) { //isGetMoreData表示为是否为滑动加载下一页

        return new Promise((resolve, reject) => {
            let postData = {
                page: this.data.currentPage,
                pageSize: this.data.pageSize,
                type: 'online',
            };

            if (this.data.searchword.length) {
                postData[this.data.fieldList[this.data.choosedFieldIndex].id] = this.data.searchword;
            }

            if (this.data.currentChoosedBar === 'appoint' || this.data.currentChoosedBar === 'determine' || this.data.currentChoosedBar === 'confirmed') {
                postData.status = this.data.currentChoosedBar;
            } else if (this.data.currentChoosedBar === 'history') {
                postData.history = true;
            }

            if (!isGetMoreData || this.data.currentPage < this.data.totalPage) {

                if (isGetMoreData) {
                    postData = this.data.postDataCopy;
                    postData.page = this.data.currentPage + 1;
                } else {
                    //备份搜索条件
                    this.setData({
                        postDataCopy: postData,
                    })
                }

                wx.showLoading({
                    title: '数据加载中',
                    mask: true,
                });
                this.setData({
                    isGettingList: true
                })

                httpServer('getOrderList', postData).then(res => {

                    wx.hideLoading();
                    if (res.data && res.data.code === 0) {
                        let resultsData = res.data.data.data;
                        if (resultsData.length) {
                            let orderListData = [...this.data.orderListData, ...resultsData];
                            orderListData.map(item => {
                                item.plan_time = item.plan_time.substring(0, 9);
                            })
                            this.setData({
                                    orderListData: orderListData,
                                    total: res.data.data.count,
                                    totalPage: Math.ceil(res.data.data.count / this.data.pageSize),
                                    isGettingList: false
                                })
                                //如果数据返回成功后，更新当前currentPage
                            if (isGetMoreData) {
                                this.setData({
                                    currentPage: this.data.currentPage + 1
                                })
                            }
                        } else {
                            this.setData({
                                orderListData: [...this.data.orderListData],
                                total: res.data.data.count,
                                totalPage: Math.ceil(res.data.data.count / this.data.pageSize),
                                isGettingList: false
                            })
                        }

                    } else {
                        this.setData({
                            isGettingList: false
                        })
                    }
                    resolve(res);
                }).catch(error => {
                    wx.hideLoading();
                    this.setData({
                        isGettingList: false
                    })

                    reject(error)
                })
            }
        })

    },
    chooseBar(e) {
        const choosedParam = e.currentTarget.dataset.param;
        if (this.currentChoosedBar !== choosedParam) {
            let topBarListCopy = [...this.data.topBarList];
            topBarListCopy.map(item => {
                item.isChoosed = item.param === choosedParam ? true : false;
            })
            this.setData({
                topBarList: topBarListCopy,
                currentChoosedBar: choosedParam,
                currentPage: 1,
                orderListData: [],
                isGettingList: true,
            })
            this.getOrderList();
        }
    },
    goArrangeCar(e) {
        const id = e.currentTarget.dataset.id;
        const operate = e.currentTarget.dataset.operate;
        wx.navigateTo({
            url: '/pages/arrangeCar/arrangeCar?id=' + id + '&operationStatus=' + operate
        })
    },
    upPlan(e) {
        let rowData = e.currentTarget.dataset.rowdata;
        let sendData = {
            delivery_order_id: rowData.id
        }
        if (rowData.submit_car_number == 0) {
            wx.showToast({
                title: '请注意,提交车辆不能为0,请你先添加车辆',
                icon: 'none',
                duration: 2000
            })
        } else {
            wx.showLoading({
                title: '数据提交中...',
                mask: true,
            });
            httpServer("upOrderPlan", sendData).then((results) => {
                wx.hideLoading();
                if (results.data.code == 0) {

                    wx.showToast({
                        title: '提交计划成功',
                        icon: 'none',
                        duration: 2000
                    })

                    setTimeout(() => {
                        wx.reLaunch({
                            url: '/pages/orderList/orderList?currentChoosedBar=determine'
                        })
                    },2000)

                }

            }).catch(() => {
                wx.hideLoading();
            });
        }
    }
})