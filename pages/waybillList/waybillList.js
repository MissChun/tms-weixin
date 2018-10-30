// pages/waybillList/waybillList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fieldList:[
      { id: 'carrier_name', label: '承运商' },
      { id: 'order_number', label: '订单号' },
      { id: 'truck_no', label: '车号' },
      { id: 'fluid_name', label: '液厂名' },
      { id: 'waybill_number', label: '运单号' },
      { id: 'order_station', label: '卸货站点' }
    ],
    choosedFieldIndex:2,
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
    waybillListData:[{
      waybill_number:'运单号：T8188832323',
      fluid_name:'福建海投新能源有限公司',
      load_time:'2018-10-18',
      arrival_time:'2018-10-18',
      tun:'20',
      waybill_status:'a',
      id:'1',
    },{
      waybill_number:'运单号：T8188832323',
      fluid_name:'福建海投新能源有限公司',
      load_time:'2018-10-18',
      arrival_time:'2018-10-18',
      tun:'20',
      waybill_status:'a',
      id:'2',
    },{
      waybill_number:'运单号：T8188832323',
      fluid_name:'福建海投新能源有限公司',
      load_time:'2018-10-18',
      arrival_time:'2018-10-18',
      tun:'20',
      waybill_status:'a',
      id:'3',
    },{
      waybill_number:'运单号：T8188832323',
      fluid_name:'福建海投新能源有限公司',
      load_time:'2018-10-18',
      arrival_time:'2018-10-18',
      tun:'20',
      waybill_status:'a',
      id:'4',
    }],
    ajaxdata:[{
      waybill_number:'运单号：T8188832323',
      fluid_name:'福建海投新能源有限公司',
      load_time:'2018-10-18',
      arrival_time:'2018-10-18',
      tun:'20',
      waybill_status:'a',
      id:'35',
    },{
      waybill_number:'运单号：T8188832323',
      fluid_name:'福建海投新能源有限公司',
      load_time:'2018-10-18',
      arrival_time:'2018-10-18',
      tun:'20',
      waybill_status:'a',
      id:'36',
    },{
      waybill_number:'运单号：T8188832323',
      fluid_name:'福建海投新能源有限公司',
      load_time:'2018-10-18',
      arrival_time:'2018-10-18',
      tun:'20',
      waybill_status:'a',
      id:'37',
    },{
      waybill_number:'运单号：T8188832323',
      fluid_name:'福建海投新能源有限公司',
      load_time:'2018-10-18',
      arrival_time:'2018-10-18',
      tun:'20',
      waybill_status:'a',
      id:'38',
    }]

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
    console.log('xxx');
    wx.showLoading({
      title:'数据加载中',
      mask:true,
    });
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
  chooseBar(e){
    console.log('e',e);
    const choosedParam = e.currentTarget.dataset.param;
    if(this.currentChoosedBar !== choosedParam){
      let topBarListCopy = [...this.data.topBarList];
      console.log('topBarListCopy',topBarListCopy);
      topBarListCopy.map(item => {
        item.isChoosed = item.param === choosedParam ? true : false;
      })
      this.setData({
        topBarList:topBarListCopy,
        currentChoosedBar:choosedParam,
      })
    }
  },
  goMatch(e){
    wx.navigateTo({
        url:'/pages/matchWaybill/matchWaybill'
    })
  }
})