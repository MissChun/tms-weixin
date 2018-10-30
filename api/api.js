/**
 * @description 接口文档API,用于后端接口查询
 * @param
 *   url:后端接口url（必需）
 *   method:后端接口方法（必需）
 *   desc:后端接口描述 （可选）
 *   param:接口参数 （可选）
 *     desc:参数描述（可选）
 */

const api = {
  login:{
    url: '/tmswechat/MjtXBj/tmslogin/',
    method: 'post',
    desc: '登录',
    notNeedToken:true,
    param: {

    }
  },
  logout:{
    url: '/tmswechat/MjtXBj/tmslogin/out/',
    method: 'post',
    desc: '登出',
    param: {

    }
  },
  getDashborad: {
    url: '/tmswechat/MjtXBj/order/section-trips/dashborad/',
    method: 'get',
    desc: '获取dashborad数据',
    param: {

    }
  },
  getUserInfo:{
    url: '/tmswechat/MjtXBj/user/users/profile/',
    method: 'get',
    desc: '获取用户信息',
    param: {

    }
  },
  getWaybillList: {
    url: '/tmswechat/MjtXBj/order/section-trips/',
    method: 'get',
    desc: '获取waybill列表数据',
    param: {

    }
  },


  getMatchedList:{
    url: '/bpmwechat/iYdejC/match-helpers/check-order/',
    method: 'post',
    desc: '获取已匹配业务单',
    param: {

    }
  },
  getBusinessList: {
    url: '/bpmwechat/iYdejC/business_order',
    method: 'get',
    desc: '匹配运单时获取业务单列表',
    param: {

    }
  },
  matchOrder:{
    url: '/bpmwechat/iYdejC/waybill-business/match-business-order/',
    method: 'post',
    desc: '匹配卸货单',
    param: {

    }
  },
  getTractor:{
    url: '/tmswechat/MjtXBj/truck/tractor_semitrailers/',
    method: 'get',
    desc: '获取运力id',
    param: {

    }
  },
  judeIsCancel:{
    url: '/bpmwechat/iYdejC/whether-opts/can-cancel/',
    method: 'post',
    desc: '判断已匹配的业务单是否能够更改',
    param: {

    }
  }
}

export default api;