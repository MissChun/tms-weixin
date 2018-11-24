/* wx.request
 * desc:
 * 统一捕获接口报错
 * 统一报错弹窗提示
 * 接入api
 */

import api from './api';

/* 配置访问url */

let isProduction = false;

let domainUrl = isProduction ? 'https://api.91lng.com/wechat' : 'http://39.104.71.159:6602';

/* 统一处理网络问题或者代码问题造成的错误 */
const errorState = function(error) {
    console.log('error',error);
    let errorMsg = '';
    if (error && error.statusCode) {
        switch (error.statusCode) {
            case 400:
                errorMsg = '参数错误';
                break;
            case 401:
                errorMsg = '未授权或登录过期，请重新登录';
                break;
            case 403:
                errorMsg = '拒绝访问';
                break;
            case 404:
                errorMsg = '请求出错(404)';
                break;
            case 405:
                errorMsg = '拒绝访问(405)';
                break;
            case 408:
                errorMsg = '请求超时，请检查网络';
                break;
            case 500:
                errorMsg = '服务器错误(500)';
                break;
            case 501:
                errorMsg = '服务未实现(501)';
                break;
            case 502:
                errorMsg = '网络错误(502)';
                break;
            case 503:
                errorMsg = '服务不可用(503)';
                break;
            case 504:
                errorMsg = '网络超时(504)';
                break;
            case 505:
                errorMsg = 'HTTP版本不受支持(505)';
                break;
            default:
                errorMsg = `连接出错(${error.response.status})!`;
        }
    } else {
        errorMsg = '连接服务器失败!'
    }

    if (error && error.response && error.response.status === 401) {
        wx.showToast({
            title: '登录过期，请重新登录',
            icon: 'none',
        })


        wx.clearStorage();

        setTimeout(() => {
            wx.redirectTo({
                url: '/pages/index/index'
            })
        }, 2000)
    } else {
        wx.showToast({
            title: errorMsg,
            icon: 'none',
        })
    }

}


/* 根据后端接口文档统一处理错误信息 */
const successState = function(response) {

    if (response.data && response.data.code) {
        if (response.data.code == 401) {
            wx.showToast({
                title: '登录过期，请重新登录',
                icon: 'none',
            })

            wx.clearStorage();

            setTimeout(() => {
                wx.redirectTo({
                    url: '/pages/index/index'
                })
            }, 2000)

        } else if (response.data.code == 403) {
            wx.showToast({
                title: '无操作权限',
                icon: 'none',
            })
        } else if (response.data.code == 0) {

        } else {
            if (response.data.msg) {
                wx.showToast({
                    title: response.data.msg,
                    icon: 'none',
                })
            }
        }
    }
}

/* 处理url */
const dealApiUrlParam = function(apiName, postData) {
    let httpUrl = api[apiName].url;

    if (httpUrl) {
        //设置最大循环数,以免死机
        let maxTimes = 0;
        while (httpUrl.match(/:([0-9a-z_]+)/i)) {
            let tempV = RegExp.$1;
            maxTimes++;
            //httpUrl最大支持10个变量替换
            if (maxTimes > 10) break;
            let reg = new RegExp(":" + tempV, "ig");
            if (postData.hasOwnProperty(tempV)) {
                httpUrl = httpUrl.replace(reg, postData[tempV])
                delete postData[tempV];
            }
        }
    }
    return httpUrl;
}


/* 处理http请求config */
const dealConfig = function(apiName, postData) {

    const httpConfig = {
        method: '',
        url: '',
        data: postData,
        headers: '',
    }

    if (api.hasOwnProperty(apiName)) {
        let apiUrl = api[apiName].url ? api[apiName].url : '';
        let method = api[apiName].method ? api[apiName].method.toLowerCase() : '';
        httpConfig.method = method;

        httpConfig.headers = apiName.header || {
            'content-type': 'application/json'
        };

        if (apiUrl) {
            apiUrl = dealApiUrlParam(apiName, postData);
            httpConfig.url = domainUrl + apiUrl;
        } else {
            return false
        }

    } else {
        return false;
    }

    return httpConfig;

}


/* http请求统一函数 */
export const httpServer = (apiName, postData, defaultSuccessCallback, defaultErrorCallback) => {

    if (!apiName) return false;

    let httpConfig = dealConfig(apiName, postData);

    let request = function(apiName, postData, defaultSuccessCallback, defaultErrorCallback, resolve, reject) {
        wx.request({
            url: httpConfig.url,
            method: httpConfig.method,
            data: postData,
            header: httpConfig.headers,
            success(res) {
                //默认使用successState
                if (res.statusCode && res.statusCode != 200) {
                    errorState(res)
                } else {
                    if (defaultSuccessCallback === undefined) {
                        successState(res);
                    } else if (typeof defaultSuccessCallback === 'function') {
                        defaultSuccessCallback(res);
                    }
                }
                resolve(res)
            },
            fail(error) {
                //默认使用errorState
                if (defaultErrorCallback === undefined) {
                    errorState(error)
                } else if (typeof defaultErrorCallback === 'function') {
                    defaultErrorCallback(error);
                }
                reject(error)
            }
        })
    }

    let promise = new Promise(function(resolve, reject) {
        if (!api[apiName].notNeedToken) {
            wx.getStorage({
                key: 'token',
                success(res) {
                    let token = res.data;
                    httpConfig.headers.Authorization = token;
                    request(apiName, postData, defaultSuccessCallback, defaultErrorCallback, resolve, reject);
                }
            });
        } else {
            request(apiName, postData, defaultSuccessCallback, defaultErrorCallback, resolve, reject);
        }
    })
    return promise
}