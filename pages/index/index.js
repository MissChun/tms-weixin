import {
    httpServer
} from '../../api/request.js'

Page({
    onShareAppMessage() {
        return {
            title: 'form',
            path: 'page/component/pages/form/form'
        }
    },
    onLoad() {
        //如果已经登录则含有token,如果有token则为已登录，直接跳转到dashborad
        wx.getStorage({
            key: 'token',
            success(res) {
                if (res.data) {
                    wx.switchTab({
                        url: '/pages/dashborad/dashborad',
                    })
                }
            }
        })
    },
    data: {
        isSendAjax: false,
    },
    verifyForm(formData) {
        let verifyFormResult = {
            isVerify: true,
            errorMsg: '',
        };
        if (formData.name.length) {
            if (!formData.name.match(/^1\d{10}$/)) {
                verifyFormResult = {
                    isVerify: false,
                    errorMsg: '请填写正确的电话号码',
                };
                return verifyFormResult
            }
        } else {
            verifyFormResult = {
                isVerify: false,
                errorMsg: '请填写电话号码',
            };
            return verifyFormResult
        }

        if (!formData.password.length) {
            verifyFormResult = {
                isVerify: false,
                errorMsg: '请填写密码',
            };
            return verifyFormResult
        }

        return verifyFormResult;

    },
    formSubmitRequest(formData) {

        const postData = {
            username: formData.name,
            password: formData.password,
            sms_verify_code: '1111',
            platform: 'WX_PROGRAM'
        }

        this.setData({
            isSendAjax: true
        })

        httpServer('login', postData).then(res => {
            this.setData({
                isSendAjax: false
            })
            if (res.data && res.data.code === 0) {
                const token = res.data.content.data.ticket;
                wx.setStorage({
                    key: "token",
                    data: token,
                    success() {
                        wx.switchTab({
                            url: '/pages/dashborad/dashborad',
                        })
                    }
                })

            }
        }).catch(error =>{
            this.setData({
                isSendAjax: false
            })
        })
    },
    formSubmit(e) {
        const formData = e.detail.value;
        const verifyFormResult = this.verifyForm(formData);
        if (verifyFormResult.isVerify) {
            this.formSubmitRequest(formData);
        } else {
            wx.showToast({
                title: verifyFormResult.errorMsg,
                icon: 'none',
            })
        }
    },
})