// pages/waybillList/waybillList.js
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
    choosedFieldIndex:1,
    topBarList:[{
      label:'装车',
      param:'all_truck_loaded',
      isChoosed:true
    },{
      label:'匹配卸车',
      param:'all_match',
      isChoosed:false
    },{
      label:'卸车',
      param:'all_unload',
      isChoosed:false
    },{
      label:'变更中',
      param:'all_change',
      isChoosed:false
    },{
      label:'全部',
      param:'',
      isChoosed:false
    }],
    currentChoosedBar:'all_truck_loaded',

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  chooseField(e){
     console.log('e.detail',e.detail,this.data.choosedFieldIndex);
     this.setData({
      choosedFieldIndex: e.detail.value
    })
  },
  getWaybillList(){
    
  },
  confirmMatch(){

  }
})