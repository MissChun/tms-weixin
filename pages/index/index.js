Page({
  onShareAppMessage() {
    return {
      title: 'form',
      path: 'page/component/pages/form/form'
    }
  },
  data: {
    isSendAjax:false,
  },
  verifyForm(formData){
    let   verifyFormResult = {
      isVerify : true,
      errorMsg:'',
    };
    if(formData.name.length){
      if(!formData.name.match(/^1\d{10}$/)){
        verifyFormResult = {
          isVerify : false,
          errorMsg:'请填写正确的电话号码',
        };
        return verifyFormResult
      }
    }else{
      verifyFormResult = {
        isVerify : false,
        errorMsg:'请填写电话号码',
      };
      return verifyFormResult
    }

    if(!formData.password.length){
      verifyFormResult = {
        isVerify : false,
        errorMsg:'请填写密码',
      };
      return verifyFormResult
    }

    return verifyFormResult;

  },
  formSubmitRequest(formData){

    wx.request({
      url: 'test.php', //仅为示例，并非真实的接口地址
      data: {
        username: formData.name,
        password: formData.password,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        if (results.data && results.data.code === 0) {
          
        }else{

        }
      } 
    })
  },
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    const formData = e.detail.value;
    const verifyFormResult = this.verifyForm(formData);
    if(verifyFormResult.isVerify){
      //this.formSubmitRequest(formData);
      wx.redirectTo({
        url:'/pages/dashborad/dashborad'
      })
    }else{
      wx.showModal({
        content: verifyFormResult.errorMsg,
        showCancel:false,
      })
    }
  },
})
