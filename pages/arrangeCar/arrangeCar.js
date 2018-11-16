// pages/waybillList/waybillList.js
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

        tractor_semitrailers_List: [], //运力列表
        delivery_list: [], //提货单拥有的运单，审核后
        upTo_list: [], //最近三天已经被使用的运力
        alreadyList: { //上一次修改的列表
            add_capacities: [],
            capacities: [],
            del_capacities: [],
        },

        now_capacities: [], //已经选择的运力表
        default_del_capacities: [], //默认需要取消的运力
        trueAll_list: [], //查询筛选后的所有数据
        renderAll_list: [], //查询筛选后的所有需要渲染列表

        renderPage_list: [], //当前页渲染的数据

        pageData: {
            currentPage: 1,
            totalPage: 1,
            pageSize: 10,
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

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
    chooseField(e) {
        this.setData({
            choosedFieldIndex: e.detail.value
        })
    },
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
        Promise.all([p1, p2]).then(res => {
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
                const resultsThreeData = results[3].data.data;
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
            this.sortData();
        }).catch(error => {
            wx.hideLoading();
            wx.showToast({
                title: '数据请求失败',
                icon: 'none'
            })
        })
    },
    sortData() {
        let operationArr = [...this.data.tractor_semitrailers_List];
        let newArr = [];
        let fifterArr = [];
        for (let i = 0; i < operationArr.length; i++) { //循环所有运力列表
            var addflag = false;
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
                                now_capacities: this.data.now_capacities
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
                    now_capacities: this.data.now_capacities
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
        this.setData({
            trueAll_list: newArr,
            renderAll_list: newArr

        })
        this.bindChekboxFunction(0, this.data.renderAll_list);
    },

    bindChekboxFunction(page, list) {
        let page_list = this.pbFunc.deepcopy(list).splice(page * this.pageData.pageSize, this.pageData.pageSize);
        let rowsArr = [];

        this.setData({
            "pageData.totalPage": Math.ceil(list.length / this.pageData.pageSize),
            lastSearch_list: list,
            renderPage_list: page_list
        })

        page_list.forEach((item, index) => {
            if (item.bindCheckBox) {
                rowsArr.push(item);
            }
        });

        rowsArr.forEach(row => {
            vm.$refs.multipleTable.toggleRowSelection(row, true);
            this.data.start_capacities.push(row.waybill.capacity ? row.waybill : row);
            this.setData({
                start_capacities: this.data.start_capacities
            })
        });

    },
    checkRows: function(e) {
        const index = e.currentTarget.dataset.index;
        const currentItem = this.data.renderPage_list[index];

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
                        transport_id: row.id,
                        delivery_order_id: this.id
                    };
                    //判断车辆是否在别的订单。
                    httpServer('searchNoUse', postData).then((results) => {
                        this.searchNoUseCallback(currentItem, results);
                    })
                } else {
                    wx.showModal({
                        title: '请注意',
                        content: '预匹配卸货地订单只能匹配一辆车',
                        showCancel: false,
                        success(res) {

                        }
                    })
                }
            } else { //如果是取消勾选,判断当前车辆是否能取消勾选
                let concelConfirm = () => {
                    currentItem.bindCheckBox = !currentItem.bindCheckBox;
                    this.data.trueAll_list.forEach((Titem) => {
                        if (Titem.id == currentItem.id) {
                            Titem.bindCheckBox = false;
                        }
                    });
                    let new_now_capacities = [];
                    this.data.now_capacities.forEach((item, index) => {
                        if (item.id != currentItem.id) {
                            new_now_capacities.push(item);
                        }
                    });
                    this.data.now_capacities = new_now_capacities;
                }
                if (currentItem.waybill.waybill) {
                    //判断是否能够取消
                    httpServer("judgeCanCancle", {
                        waybill_id: currentItem.waybill.waybill_id
                    }).then((results) => {
                        if (results.data.code == 0) {
                            if (results.data.data.status) {
                                concelConfirm();
                            } else {
                                wx.showModal({
                                    title: '请注意',
                                    content: '当前运单不能被取消',
                                    showCancel: false,
                                    success(res) {

                                    }
                                })
                            }
                        }
                    })
                } else {
                    concelConfirm();
                }
            }
        }
    },

    searchNoUseCallback(currentItem, results) {
        let confirmChoose = () => {
            currentItem.bindCheckBox = !currentItem.bindCheckBox;
            this.data.now_capacities.push(currentItem);

            this.setData({
                now_capacities: this.data.now_capacities,
            })

            //这里需要setData改造
            this.data.trueAll_list.forEach((Titem) => {
                if (Titem.id == currentItem.id) {
                    Titem.bindCheckBox = true;
                }
            });
        }
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
                var orderListText = "";
                resultsData.forEach((item) => {
                    orderListText += item + ",";
                });

                let noticeStr = '车号 ' + row.tractor.plate_number + ' 已存在于订单' + orderListText + '是否继续添加进入订单';

                wx.showModal({
                    title: '提示',
                    content: noticeStr,
                    confirmText: '继续添加',
                    cancelText: '返回',
                    success(res) {
                        if (res.confirm) {
                            confirmChoose();
                        }
                    }
                })

            } else if (resultsData.trips_driver_unconfirm_list.length != 0) {
                //司机有未确认的
                let noticeStr = '司机有未确认订单，继续操作可能导致司机上传磅单和后续流程错误，是否继续添加进本订单？';
                wx.showModal({
                    title: '提示',
                    content: noticeStr,
                    confirmText: '继续',
                    cancelText: '返回',
                    success(res) {
                        if (res.confirm) {
                            confirmChoose();

                        }
                    }
                })
            } else if (resultsData.trips_driver_unconfirm_list.length == 0 && resultsData.delivery_list.length == 0 && results.data.data.interrupt_waybill_number.length == 0) {
                //正常派单
                confirmChoose();
            }
        }
    },
    operation(type) {
        if (type == 'addCar') {
            if (this.data.now_capacities.length > 0) {
                let sendData = {
                    delivery_order_id: "",
                    add_capacities: []
                };
                this.data.now_capacities.forEach(item => {
                    sendData.add_capacities.push(item.id);
                });
                sendData.delivery_order_id = this.data.delivery_list.id;

                this.judgeIsDataChange((flage) => {
                    if (flage == '1') {
                        this.judgeIsOrderStatus((oerderStatus) => {
                            if (oerderStatus == '0') { //状态为变更
                                this.$$http("addCarPower", sendData).then((results) => {

                                    if (results.data.code == 0) {
                                        if (this.operationStatus == 'add') {
                                            vm.$router.push({
                                                path: "/orders/pickupOrders/ordersList?goTo=appoint"
                                            });
                                        } else {
                                            vm.$router.push({
                                                path: "/orders/pickupOrders/ordersList?goTo=determine"
                                            });
                                        }
                                    }
                                });
                            } else if (oerderStatus == '1') { //状态变更为修改
                                vm.$confirm('当前订单已经提交计划', '请注意', {
                                    confirmButtonText: '继续修改计划',
                                    cancelButtonText: '返回列表',
                                    type: 'warning',
                                    center: true,
                                    closeOnClickModal: false,
                                    showClose: false,
                                    closeOnPressEscape: false
                                }).then(() => {
                                    vm.$router.push({
                                        path: `/orders/pickupOrders/orderDetail/arrangeCarTab/arrangeCarList/${this.id}/edit`
                                    });
                                }).catch(() => {
                                    vm.$router.push({
                                        path: "/orders/pickupOrders/ordersList?goTo=determine"
                                    });
                                })
                            } else if (oerderStatus == '2') { //状态变更为不能修改
                                vm.$confirm('当前订单状态已经不能新增', '请核实', {
                                    confirmButtonText: '确认',
                                    showCancelButton: false,
                                    type: 'warning',
                                    center: true,
                                    closeOnClickModal: false,
                                    showClose: false,
                                    closeOnPressEscape: false
                                }).then(() => {
                                    vm.$router.push({
                                        path: "/orders/pickupOrders/ordersList?goTo=all"
                                    });
                                })
                            }
                        });

                    } else {
                        vm.$confirm('订单数据已更新，请重新操作', '请注意', {
                            confirmButtonText: '确认',
                            showCancelButton: false,
                            type: 'warning',
                            center: true,
                            closeOnClickModal: false,
                            showClose: false,
                            closeOnPressEscape: false
                        }).then(() => {
                            vm.$router.go(0);
                        })
                    }
                });

            } else {
                wx.showModal({
                    title: '请注意',
                    content: '提交车辆不能为0',
                    showCancel: false,
                    success(res) {

                    }
                })
            }
        } else if (type == 'changeCar') {
            var sendData = {
                delivery_order_id: "",
                add_capacities: [],
                del_capacities: [],
                id: this.data.delivery_list.id,
                yid: this.data.delivery_list.id,
                delivery_order_id: this.data.delivery_list.id
            };
            this.data.now_capacities.forEach(item => {
                var addFalg = true;
                vm.start_capacities.forEach(startItem => {
                    if (item.id == startItem.capacity) {
                        addFalg = false;
                    }
                });
                if (addFalg && !(vm.allStatus.indexOf(item.waybill.status) > -1)) {
                    sendData.add_capacities.push(item.id);
                }
            });
            this.start_capacities.forEach(item => {
                var cancleFalg = true;
                vm.now_capacities.forEach(nowItem => {
                    if (item.capacity == nowItem.id) {
                        cancleFalg = false;
                    }
                });
                if (cancleFalg && item.waybill_id && vm.allStatus.indexOf(item.status) > -1) {
                    sendData.del_capacities.push(item.capacity);
                }
            });

            var ischange = false;
            this.start_capacities.forEach(item => {
                var isfalge = false;
                vm.now_capacities.forEach(nowItem => {
                    if ((item.capacity || item.id) == nowItem.id) {
                        isfalge = true;
                    }
                });
                if (!isfalge) {
                    ischange = true;
                }
            });

            sendData.del_capacities = sendData.del_capacities.concat(this.default_del_capacities);
            if (!ischange && this.start_capacities.length == this.data.now_capacities.length) {
                vm.$confirm('您没有任何修改', '请注意', {
                    confirmButtonText: '确定',
                    showCancelButton: false,
                    type: 'warning',
                    center: true,
                    closeOnClickModal: false,
                    showClose: false,
                    closeOnPressEscape: false
                }).then(() => {}).catch(() => {})
            } else {
                vm.upchange(sendData);
            }
        }
    },
    judgeIsDataChange(callbackFun) {
        request('searchOrderHasPower', {
            id: this.data.id
        }).then((results) => {
            if (results.data && results.data.code == 0) {
                var returnFlag = true;
                var nowData = {};
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
                    callbackFun(false);
                } else {
                    for (var addIndex in this.data.alreadyList.add_capacities) {
                        if (nowData.add_capacities.indexOf(this.data.alreadyList.add_capacities[addIndex]) == -1) {
                            callbackFun(0);
                            returnFlag = false;
                            break;
                        }
                    }
                    for (var delIndex in this.data.alreadyList.del_capacities) {
                        if (nowData.del_capacities.indexOf(this.data.alreadyList.del_capacities[delIndex]) == -1) {
                            returnFlag = false;
                            callbackFun(0);
                            break;
                        }
                    }
                }
                if (returnFlag) {
                    callbackFun(1);
                }
            }
        }).catch((err) => {
            callbackFun(0);
        });
    },
    judgeIsOrderStatus: function(callFunc) {
        this.$$http('getPickOrderDetail', {
            id: this.id
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
        }).catch((err) => {
            console.log('cc', err);
        });
    },

})