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
            id: 'station_name',
            label: '托运方'
        }, {
            id: 'order_number',
            label: '订单号'
        }, {
            id: 'truck_no',
            label: '车号'
        }, {
            id: 'fluid_name',
            label: '液厂名'
        }, {
            id: 'waybill_number',
            label: '运单号'
        }, {
            id: 'order_station',
            label: '卸货站点'
        }],
        choosedFieldIndex: 2,
        pageSize: 10,
        currentPage: 1,
        total: '',
        totalPage: '',
        searchword: '',
        topBarList: [{
            label: '装车',
            param: 'all_truck_loaded',
            isChoosed: false
        }, {
            label: '匹配卸车',
            param: 'all_match',
            isChoosed: true
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
        currentChoosedBar: 'all_match',
        waybillListData: [],
        postDataCopy: {},

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getWaybillList();
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    onPullDownRefresh() {
        this.setData({
            currentPage: 1,
            waybillListData: [],
            isGettingList: true,

        })
        this.getWaybillList().then(res => {
            wx.stopPullDownRefresh()
        }).catch(error => {
            wx.stopPullDownRefresh()
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        this.getWaybillList(true);
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
    searinputChange(e) {
        this.setData({
            searchword: e.detail.value
        })
    },
    startSearch(e) {
        this.setData({
            currentPage: 1,
            waybillListData: [],
            isGettingList: true,
        })
        this.getWaybillList();
    },
    getWaybillList(isGetMoreData) { //isGetMoreData表示为是否为滑动加载下一页

        return new Promise((resolve, reject) => {
            let postData = {
                page: this.data.currentPage,
                pageSize: this.data.pageSize,
                search: this.data.currentChoosedBar,
                type: 'online',
            };

            if (this.data.searchword.length) {
                postData[this.data.fieldList[this.data.choosedFieldIndex].id] = this.data.searchword;
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

                httpServer('getWaybillList', postData).then(res => {

                    wx.hideLoading();
                    if (res.data && res.data.code === 0) {
                        let resultsData = res.data.data.data;
                        if (resultsData.length) {
                            let tractorList = resultsData.map(item => item.capacity);
                            //运单列表里面没有运力信息，必须单独获取运力信息
                            this.getTractor(tractorList).then(result => {
                                let tractorListData = result.data.data.results;

                                //获取到运力信息后，匹配到相应运单上。
                                resultsData.map((item, index) => {
                                    tractorListData.map((tractorItem, tractorIndex) => {
                                        if (tractorItem.id === item.capacity) {
                                            item.capacityDetail = tractorItem;
                                        }
                                    })
                                })

                                let waybillListData = [...this.data.waybillListData, ...resultsData];
                                this.setData({
                                        waybillListData: waybillListData,
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
                            });
                        } else {
                            this.setData({
                                waybillListData: [...this.data.waybillListData],
                                total: res.data.data.count,
                                totalPage: Math.ceil(res.data.data.count / this.data.pageSize),
                                isGettingList: false
                            })
                        }

                    } else {
                        if (res.data && res.data.msg) {
                            wx.showModal({
                                content: res.data.msg,
                                showCancel: false,
                            })
                        }
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
                waybillListData: [],
                isGettingList: true,
            })
            this.getWaybillList();
        }
    },
    goMatch(e) {
        const waybillId = e.currentTarget.dataset.id;
        const stepId = e.currentTarget.dataset.stepid;
        console.log('e', e);
        wx.navigateTo({
            url: '/pages/confirmWaybill/confirmWaybill?waybillId=' + waybillId + '&stepId=' + stepId
        })
    },
    getTractor(tractorList) {
        return new Promise((resolve, reject) => {
            const postData = {
                ids: tractorList.join(',')
            }
            httpServer('getTractor', postData).then(res => {
                if (res.data && res.data.code === 0) {
                    resolve(res);
                } else {
                    if (res.data && res.data.msg) {
                        wx.showModal({
                            content: res.data.msg,
                            showCancel: false,
                        })
                    }
                    reject(res)
                }
            }).catch(error => {
                reject(error)
            })
        })

    }
})