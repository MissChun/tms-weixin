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
    login: {
        url: '/tmswechat/MjtXBj/tmslogin/',
        method: 'post',
        desc: '登录',
        notNeedToken: true,
        param: {

        }
    },
    logout: {
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
    getUserInfo: {
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
    getTractor: {
        url: '/tmswechat/MjtXBj/truck/tractor_semitrailers/',
        method: 'get',
        desc: '获取运力id',
        param: {

        }
    },
    getSectionTrips: {
        url: '/tmswechat/MjtXBj/order/section-trips/record/',
        method: 'get',
        desc: '获取运单分段进程记录',
        param: {

        }
    },
    getWaybillDetail: {
        url: '/tmswechat/MjtXBj/order/section-trip/:id/',
        method: 'get',
        desc: '获取平台/线下运单状态详细',
        param: {

        }
    },

    confirmMatch: {
        url: '/tmswechat/MjtXBj/order/section-trips/confirm/',
        method: 'put',
        desc: '确认卸货地',
        param: {

        }
    },

    getDepartment:{
        url: '/tmswechat/MjtXBj/carrier/users/',
        method: 'get',
        desc: '获取用户职位信息',
        param: {

        }
    }


}

export default api;