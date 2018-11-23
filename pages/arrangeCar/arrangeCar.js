// pages/waybillList/waybillList.js

/***这个页面主要有四大功能，代码基本继承web端代码
 ****1、获取列表数据并排序getList，sortData
 ****2、勾选或者取消勾选时各种状态判断 checkRows
 ****3、提交数据addCar，changeCar
 ****4、前端自己做搜索startSearch
 */
import {
    httpServer
} from '../../api/request.js'

Page({
    data: {
        fieldList: [{
            value: '车号',
            id: 'tractor.plate_number',
        }, {
            value: '姓名',
            id: 'master_driver.name',
        }, {
            value: '电话',
            id: 'master_driver.mobile_phone',
        }],
        choosedFieldIndex: 0,
        searchword: '',

        tractor_semitrailers_List: [], //运力列表
        delivery_list: [], //提货单拥有的运单，审核后
        upTo_list: [], //最近三天已经被使用的运力
        alreadyList: { //上一次修改的列表
            add_capacities: [],
            capacities: [],
            del_capacities: [],
        },

        now_capacities: [], //已经选择的运力表
        start_capacities: [], //初始的已选择的运力表
        default_del_capacities: [], //默认需要取消的运力
        trueAll_list: [], //查询筛选后的所有数据
        renderAll_list: [], //查询筛选后的所有需要渲染列表

        pageData: {
            currentPage: 1,
            totalPage: 1,
            pageSize: 10,
        },

        isSendAjax: false,

        operationStatus: 'add', //表示是添加车辆还是提交修改
        id: '',
        allStatus: ['driver_pending_confirmation', 'to_fluid', 'reach_fluid', 'waiting_seal', 'loading_waiting_audit'],
        noCanceled: ['loading_audit_failed', 'waiting_match', 'already_match', 'to_site', 'reach_site', 'unloading_waiting_audit', 'unloading_audit_failed', 'waiting_settlement', 'in_settlement', 'finished', 'confirm_match', 'abnormal'],

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            operationStatus: options.operationStatus || 'add',
            id: options.id
        })
        this.getList();

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
    //获取列表数据
    getList() {
        const postData1 = {
            pagination: false,
            complete_status: true
        };
        const postData2 = {
            id: this.data.id
        };
        const postData3 = {

        }
        const postData4 = {
            id: this.data.id
        };
        const q1 = httpServer('searchCapacityList', postData1);
        const q2 = httpServer('getPickOrderDetail', postData2);
        const q3 = httpServer('searchNoUse', postData3);
        const q4 = httpServer('searchOrderHasPower', postData4);

        wx.showLoading({
            title: '数据加载中',
            mask: true,
        });
        this.setData({
            isGettingList: true,
        })
        Promise.all([q1, q2, q3, q4]).then(res => {
            if (res[0].data.code === 0) {
                this.setData({
                    tractor_semitrailers_List: res[0].data.data
                })
            }
            if (res[1].data.code === 0) {
                this.setData({
                    delivery_list: res[1].data.data
                })
            }
            if (res[2].data.code === 0) {
                this.setData({
                    upTo_list: res[2].data.data
                })
            }
            if (res[3].data.code === 0) {
                const resultsThreeData = res[3].data.data;
                if (!resultsThreeData || !resultsThreeData.capacities) {
                    this.setData({
                        alreadyList: {
                            add_capacities: [],
                            capacities: [],
                            del_capacities: [],
                        }
                    })
                } else {
                    this.setData({
                        alreadyList: {
                            add_capacities: resultsThreeData.add_capacities,
                            capacities: resultsThreeData.capacities,
                            del_capacities: resultsThreeData.del_capacities,
                        }
                    })
                }
            }

            wx.hideLoading();
            setTimeout(() => {
                this.setData({
                    isGettingList: false,
                })
            }, 500)

            this.sortData();
        }).catch(error => {
            wx.hideLoading();
            this.setData({
                isGettingList: false,
            })
        })
    },
    //获取列表数据后对列表数据进行排序，后端没有办法排序，因此全部放在前端，并且后端没有做分页，这里是把所有列表数据一次行拿回来排序并渲染
    sortData() { //这里的排序方法我继承web端的代码，没有做修改，只做了代码小程序化,这里代码太乱了，需要优化
        let operationArr = [...this.data.tractor_semitrailers_List];
        let newArr = [];
        let fifterArr = [];

        for (let i = 0; i < operationArr.length; i++) { //循环所有运力列表

            let addflag = false;
            for (let j = 0; j < this.data.delivery_list.trips.length; j++) { //筛选当前订单的列表
                //筛选
                if (operationArr[i].id == this.data.delivery_list.trips[j].capacity) {
                    operationArr[i].waybill = this.data.delivery_list.trips[j];
                    //如果是已取消
                    if (this.data.delivery_list.trips[j].status != "canceled" && this.data.delivery_list.trips[j].waybill_change_status != "canceled") {
                        operationArr[i].isDisable = false;
                        operationArr[i].bindCheckBox = true;
                        addflag = true;
                        this.data.now_capacities.push(operationArr[i]);
                        this.setData({
                                now_capacities: this.data.now_capacities,
                            })
                            //这里蛋疼
                        this.data.start_capacities.push(operationArr[i].waybill.capacity ? operationArr[i].waybill : operationArr[i]);
                        this.setData({
                                start_capacities: this.data.start_capacities
                            })
                            //如果是取消中    
                    } else if (this.data.delivery_list.trips[j].waybill_change_status == "canceled") {
                        operationArr[i].isDisable = true;
                        operationArr[i].bindCheckBox = false;
                        addflag = true;
                        this.data.default_del_capacities.push(operationArr[i].id);
                        this.setData({
                            default_del_capacities: this.data.default_del_capacities
                        })
                    }
                }
            }
            if (addflag) {
                newArr.push(operationArr[i]);
            } else {
                fifterArr.push(operationArr[i]);
            }
        }
        //后端返回数据中可能没有waybill字段，这里统一初始化waybill字段
        fifterArr.forEach((item) => {
            if (!item.waybill) {
                item.waybill = {};
            }
        });
        //筛选出待确认列表中不在已确认列表的数据 加入到绑定选择列表 并且删除
        let fifterArr4 = [];
        for (let findex1 = 0; findex1 < fifterArr.length; findex1++) {
            let addAlreaListflag = false;
            for (let findex4 = 0; findex4 < this.data.alreadyList.add_capacities.length; findex4++) {
                if (fifterArr[findex1].id == this.data.alreadyList.add_capacities[findex4]) {
                    addAlreaListflag = true;
                    break;
                }
            }
            if (addAlreaListflag) {
                fifterArr[findex1].bindCheckBox = true;
                newArr.push(fifterArr[findex1]);
                this.data.now_capacities.push(fifterArr[findex1]);
                this.setData({
                        now_capacities: this.data.now_capacities,
                    })
                    //这里蛋疼
                this.data.start_capacities.push(fifterArr[findex1].waybill.capacity ? fifterArr[findex1].waybill : fifterArr[findex1]);
                this.setData({
                    start_capacities: this.data.start_capacities
                })
            } else {
                fifterArr4.push(fifterArr[findex1]);
            }
        }
        //筛选出最近三天没有使用过的运力
        let fifterArr2 = [];
        for (let findex = 0; findex < fifterArr4.length; findex++) {
            let upaddfalg = false;
            for (let o = 0; o < this.data.upTo_list.length; o++) {
                if (fifterArr4[findex].id == this.data.upTo_list[o]) {
                    upaddfalg = true;
                    break;
                }
            }
            if (!upaddfalg) {
                newArr.push(fifterArr4[findex]);
            } else {
                fifterArr2.push(fifterArr4[findex]);
            }
        }
        newArr = newArr.concat(fifterArr2);
        if (this.data.delivery_list.status.key == 'canceled') {
            newArr.forEach(item => {
                item.isDisable = true;
            });
        }


        newArr.map(item => {
            if (item.waybill && this.data.allStatus.indexOf(item.waybill.status) > -1) {
                item.isConfirmed = true;
            }
            if (item.waybill && this.data.noCanceled.indexOf(item.waybill.status) > -1) {
                item.isNotCancel = true;
            }
        })


        this.setData({
            trueAll_list: newArr,
            renderAll_list: newArr

        })

    },
    //取消勾选或者勾选
    checkRows: function(e) {
        const currentIndex = e.currentTarget.dataset.index;
        const currentItem = this.data.renderAll_list[currentIndex];
        if (currentItem.id) {
            if (!currentItem.bindCheckBox) { //如果当前为勾选
                let nextStatus = true; //判断是否是预匹配
                if (this.data.delivery_list.pre_business_order_list && this.data.delivery_list.pre_business_order_list.length) {
                    if (this.data.now_capacities.length) {
                        nextStatus = false;
                    }
                }
                if (nextStatus) {
                    let postData = {
                        transport_id: currentItem.id,
                        delivery_order_id: this.data.id
                    };
                    //判断车辆是否在别的订单。
                    httpServer('searchNoUse', postData).then((results) => {
                        this.searchNoUseCallback(currentIndex, results);
                    })
                } else {
                    wx.showToast({
                        title: '请注意,预匹配卸货地订单只能匹配一辆车',
                        icon: 'none',
                        duration: 2000
                    })
                }
            } else { //如果是取消勾选,判断当前车辆是否能取消勾选
                if (currentItem.waybill.waybill) {
                    //判断是否能够取消
                    httpServer("judgeCanCancle", {
                        waybill_id: currentItem.waybill.waybill_id
                    }).then((results) => {
                        if (results.data.code == 0) {
                            if (results.data.data.status) {
                                this.concelConfirm(currentIndex);
                            } else {
                                wx.showToast({
                                    title: '请注意,当前运单不能被取消',
                                    icon: 'none',
                                    duration: 2000
                                })
                            }
                        }
                    })
                } else {
                    this.concelConfirm(currentIndex);
                }
            }
        }
    },
    //判断车辆是否在别的订单的回调
    searchNoUseCallback(currentIndex, results) {
        let currentItem = this.data.renderAll_list[currentIndex];
        let _this = this;
        if (results.data && results.data.code == 0) {
            let resultsData = results.data.data;
            if (resultsData.interrupt_waybill_number.length > 0) {
                //车辆正在变更中
                let noticeStr = currentItem.tractor.plate_number + '正变更在运单' + resultsData.interrupt_waybill_number[0] + '下，请不要重复操作，需托运方相关人员确认！';
                wx.showModal({
                    title: '请注意',
                    content: noticeStr,
                    showCancel: false,
                    success(res) {

                    }
                })
            } else if (resultsData.trips_driver_unconfirm_list.length == 0 && resultsData.delivery_list.length) {
                //这个车已经存在订单，可以继续添加，这里需提示用户是否继续
                let orderListText = resultsData.delivery_list.join(',');
                let noticeStr = '车号 ' + currentItem.tractor.plate_number + ' 已存在于订单' + orderListText + '是否继续添加进入订单';

                wx.showModal({
                    title: '提示',
                    content: noticeStr,
                    confirmText: '继续添加',
                    cancelText: '返回',
                    success(res) {
                        if (res.confirm) {
                            _this.confirmChoose(currentIndex);
                        }
                    }
                })

            } else if (resultsData.trips_driver_unconfirm_list.length != 0) {
                //司机有未确认的订单
                let orderNum = resultsData.trips_driver_unconfirm_list.map(item => item.delivery_order_number);
                let noticeStr = '司机有未确认订单，订单号为：' + orderNum.join('、') + '，继续操作可能导致司机上传磅单和后续流程错误，是否继续添加进本订单？';
                wx.showModal({
                    title: '提示',
                    content: noticeStr,
                    confirmText: '继续',
                    cancelText: '返回',
                    success(res) {
                        if (res.confirm) {
                            _this.confirmChoose(currentIndex);

                        }
                    }
                })
            } else if (resultsData.trips_driver_unconfirm_list.length == 0 && resultsData.delivery_list.length == 0 && results.data.data.interrupt_waybill_number.length == 0) {
                //正常派单
                _this.confirmChoose(currentIndex);
            }
        }
    },
    //取消勾选变更数据
    concelConfirm(currentIndex) {
        let currentItem = this.data.renderAll_list[currentIndex];
        //从当前渲染列表修改bindCheckBox
        let currentItemKey = `renderAll_list[${currentIndex}].bindCheckBox`;
        this.setData({
                [currentItemKey]: false
            })
            //从所有列表修改bindCheckBox
        this.data.trueAll_list.forEach((Titem, index) => {
            if (Titem.id == currentItem.id) {
                let nowItemKey = `trueAll_list[${index}].bindCheckBox`;
                this.setData({
                    [nowItemKey]: false
                })
            }
        });
        //从已选择的列表中去除
        let new_now_capacities = [];
        this.data.now_capacities.forEach((item, index) => {
            if (item.id != currentItem.id) {
                new_now_capacities.push(item);
            }
        });
        this.setData({
            now_capacities: new_now_capacities
        })
    },
    //勾选变更数据
    confirmChoose(currentIndex) {
        let currentItem = this.data.renderAll_list[currentIndex];
        //从当前渲染列表修改bindCheckBox
        let currentItemKey = `renderAll_list[${currentIndex}].bindCheckBox`;
        this.setData({
                [currentItemKey]: true
            })
            //添加到已选择的列表
        this.data.now_capacities.push(currentItem);
        this.setData({
                now_capacities: this.data.now_capacities,
            })
            //从所有列表修改bindCheckBox
        this.data.trueAll_list.forEach((Titem, index) => {
            if (Titem.id == currentItem.id) {
                let nowItemKey = `trueAll_list[${index}].bindCheckBox`;
                this.setData({
                    [nowItemKey]: true
                })
            }
        });
    },
    //添加车辆
    addCar() {
        if (this.data.now_capacities.length > 0) {
            let _this = this;
            this.judgeIsDataChange().then(() => {
                this.judgeIsOrderStatus((oerderStatus) => {
                    if (oerderStatus == '0') { //可正常添加
                        let sendData = {
                            delivery_order_id: this.data.delivery_list.id,
                            add_capacities: []
                        };
                        this.data.now_capacities.forEach(item => {
                            sendData.add_capacities.push(item.id);
                        });
                        this.setData({
                            isSendAjax: true
                        })
                        httpServer("addCarPower", sendData).then((results) => {
                            this.setData({
                                isSendAjax: false
                            })
                            if (results.data.code == 0) {
                                if (this.data.operationStatus == 'add') {
                                    wx.reLaunch({
                                        url: '/pages/orderList/orderList?currentChoosedBar=appoint'
                                    })
                                } else {
                                    wx.reLaunch({
                                        url: '/pages/orderList/orderList?currentChoosedBar=determine'
                                    })
                                }
                            }
                        }).catch(() => {
                            this.setData({
                                isSendAjax: false
                            })
                        });
                    } else if (oerderStatus == '1') { //在操作过程中，已有其他业务员操作，状态变更为修改
                        wx.showModal({
                            title: '请注意',
                            content: '当前订单已经提交计划',
                            confirmText: '继续修改计划',
                            cancelText: '返回列表',
                            success(res) {
                                if (res.confirm) {
                                    wx.reLaunch({
                                        url: '/pages/arrangeCar/arrangeCar?id=' + _this.data.id + '&operationStatus=edit'
                                    })
                                } else if (res.cancel) {
                                    wx.reLaunch({
                                        url: '/pages/orderList/orderList?currentChoosedBar=determine'
                                    })
                                }

                            }
                        })
                    } else if (oerderStatus == '2') { //状态变更为不能修改
                        wx.showModal({
                            title: '请核实',
                            content: '当前订单状态已经不能新增',
                            showCancel: false,
                            success(res) {
                                if (res.confirm) {
                                    wx.reLaunch({
                                        url: '/pages/orderList/orderList?currentChoosedBar=all'
                                    })
                                }
                            }
                        })
                    }
                });
            }).catch((err) => {
                wx.showModal({
                    title: '请注意',
                    content: '订单数据已更新，请重新操作',
                    showCancel: false,
                    success(res) {
                        if (res.confirm) {
                            wx.reLaunch({
                                url: '/pages/arrangeCar/arrangeCar?id=' + _this.data.id + '&operationStatus=' + _this.data.operationStatus
                            })
                        }
                    }
                })
            })
        } else {
            wx.showToast({
                title: '请注意,提交车辆数不能为0',
                icon: 'none',
                duration: 2000
            })
        }
    },
    //修改计划
    changeCar() {
        //这里也全部继承web端代码，有优化空间啊
        let sendData = {
            delivery_order_id: "",
            add_capacities: [],
            del_capacities: [],
            id: this.data.delivery_list.id,
            yid: this.data.delivery_list.id,
            delivery_order_id: this.data.delivery_list.id
        };
        this.data.now_capacities.forEach(item => {
            let addFalg = true;
            this.data.start_capacities.forEach(startItem => {
                if (item.id == startItem.capacity) {
                    addFalg = false;
                }
            });
            if (addFalg && !(this.data.allStatus.indexOf(item.waybill.status) > -1)) {
                sendData.add_capacities.push(item.id);
            }
        });
        this.data.start_capacities.forEach(item => {

            let cancleFalg = true;
            this.data.now_capacities.forEach(nowItem => {
                if (item.capacity == nowItem.id) {
                    cancleFalg = false;
                }
            });
            if (cancleFalg && item.waybill_id && this.data.allStatus.indexOf(item.status) > -1) {
                sendData.del_capacities.push(item.capacity);
            }
        });

        let ischange = false;
        this.data.start_capacities.forEach(item => {
            let isfalge = false;
            this.data.now_capacities.forEach(nowItem => {
                if ((item.capacity || item.id) == nowItem.id) {
                    isfalge = true;
                }
            });
            if (!isfalge) {
                ischange = true;
            }
        });
        sendData.del_capacities = sendData.del_capacities.concat(this.data.default_del_capacities);
        if (!ischange && this.data.start_capacities.length == this.data.now_capacities.length) {
            wx.showToast({
                title: '请注意,您没有做任何修改',
                icon: 'none',
                duration: 2000
            })
        } else {
            this.upchange(sendData);
        }
    },
    //判断数据是否有变化
    judgeIsDataChange() {
        return new Promise((resolve, reject) => {
            httpServer('searchOrderHasPower', {
                id: this.data.id
            }).then((results) => {
                if (results.data && results.data.code == 0) {
                    let returnFlag = true;
                    let nowData = {};
                    if (results.data.data.add_capacities) {
                        nowData = results.data.data;
                    } else {
                        nowData = {
                            add_capacities: [],
                            del_capacities: []
                        }
                    }
                    //最新的列表
                    if (nowData.add_capacities.length != this.data.alreadyList.add_capacities.length || nowData.del_capacities.length != this.data.alreadyList.del_capacities.length) {
                        returnFlag = false;
                        reject(results)
                    } else {
                        for (let addIndex in this.data.alreadyList.add_capacities) {
                            if (nowData.add_capacities.indexOf(this.data.alreadyList.add_capacities[addIndex]) == -1) {
                                returnFlag = false;
                                reject(results)
                                break;
                            }
                        }
                        for (let delIndex in this.data.alreadyList.del_capacities) {
                            if (nowData.del_capacities.indexOf(this.data.alreadyList.del_capacities[delIndex]) == -1) {
                                returnFlag = false;
                                reject(results)
                                break;
                            }
                        }
                    }
                    if (returnFlag) {
                        resolve(results);
                    }
                }
            }).catch((err) => {
                reject(err)
            });
        })

    },
    //判断订单状态是否发生变化
    judgeIsOrderStatus(callFunc) {
        httpServer('getPickOrderDetail', {
            id: this.data.id
        }).then((results) => {
            if (results.data && results.data.code == 0) {
                if (results.data.data.status.key == "determine" || results.data.data.status.key == 'confirmed') {
                    callFunc(1);
                } else if (results.data.data.status.key == "appoint") {
                    callFunc(0);
                } else {
                    callFunc(2);
                }
            }
        });
    },
    editCarPowerAjax(sendData) {
        wx.showLoading({
            title: '数据提交中...',
            mask: true,
        });
        this.setData({
            isSendAjax: true
        })
        httpServer("editCarPower", sendData).then((results) => {
            wx.hideLoading();
            this.setData({
                isSendAjax: false
            })
            if (results.data.code == 0) {
                wx.reLaunch({
                    url: '/pages/orderList/orderList?currentChoosedBar=determine'
                })
            }
        }).catch(() => {
            wx.hideLoading();
            this.setData({
                isSendAjax: false
            })
        });
    },
    upchange(sendData) {

        let _this = this;
        this.judgeIsDataChange().then((results) => {
            if (this.data.now_capacities.length > 0) {
                if (sendData.del_capacities.length > 0 || sendData.add_capacities.length > 0) {
                    this.editCarPowerAjax(sendData);
                }
            } else {
                wx.showModal({
                    title: '请注意',
                    content: '修改后车辆为0,状态会置为待指派',
                    confirmText: '确认提交',
                    cancelText: '取消',
                    success(res) {
                        if (res.confirm) {
                            _this.editCarPowerAjax(sendData);
                        }
                    }
                })
            }
        }).catch((err) => {
            wx.showModal({
                title: '请注意',
                content: '订单数据已更新，请重新操作',
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        wx.reLaunch({
                            url: '/pages/arrangeCar/arrangeCar?id=' + _this.data.id + '&operationStatus=' + _this.data.operationStatus
                        })
                    }
                }
            })
        })
    },
    searchInputChange(e) {
        this.setData({
            searchword: e.detail.value
        })
    },
    startSearch: function(searchPage, type) {
        let keyArr = this.data.fieldList[this.data.choosedFieldIndex].id.split(".");
        let value = this.data.searchword;
        let newArr = [];
        if (keyArr.length == 0) {
            newArr = this.data.trueAll_list;
        } else {
            for (let i = 0; i < this.data.trueAll_list.length; i++) {
                let searchParam = Object.assign({}, this.data.trueAll_list[i]);
                for (let j = 0; j < keyArr.length; j++) {
                    searchParam = searchParam[keyArr[j]];
                }
                if (searchParam.indexOf(value) > -1) {
                    newArr.push(this.data.trueAll_list[i]);
                }
            }
        }
        this.setData({
            renderAll_list: newArr
        })
    },
})