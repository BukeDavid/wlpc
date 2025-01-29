const app = getApp()

Page({
  data: {
    phone: '',
    serviceCode: '',
    canSubmit: false,
    isLogin: true // To toggle between login and register views
  },

  handlePhoneInput(e) {
    const phone = e.detail.value
    this.setData({
      phone,
      canSubmit: this.validateInputs(phone, this.data.serviceCode)
    })
  },

  handleServiceCodeInput(e) {
    const serviceCode = e.detail.value
    this.setData({
      serviceCode,
      canSubmit: this.validateInputs(this.data.phone, serviceCode)
    })
  },

  validateInputs(phone, serviceCode) {
    return phone.length === 11 && this.validateServiceCode(serviceCode)
  },

  validateServiceCode(code) {
    // 客服代码规则：6位数字和字母的组合
    return /^[A-Za-z0-9]{6}$/.test(code)
  },

  handleSubmit() {
    if (!this.data.canSubmit) return

    // 验证手机号
    if (!/^1\d{10}$/.test(this.data.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    // 验证客服代码
    if (!this.validateServiceCode(this.data.serviceCode)) {
      wx.showToast({
        title: '客服代码格式：6位数字和字母组合',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const path = this.data.isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register'

    wx.showLoading({
      title: this.data.isLogin ? '登录中...' : '注册中...'
    })

    wx.cloud.callContainer({
      config: {
        env: 'prod-0gdi5v7wb36848ce'
      },
      path: path,
      header: {
        'X-WX-SERVICE': 'express',
        'content-type': 'application/json'
      },
      method: 'POST',
      data: {
        phone: this.data.phone,
        serviceCode: this.data.serviceCode
      },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200 && res.data.success) {
          if (this.data.isLogin) {
            app.globalData.token = res.data.token
            wx.setStorageSync('token', res.data.token)
          }
          wx.showToast({
            title: this.data.isLogin ? '登录成功' : '注册成功',
            icon: 'success',
            mask: true // 防止用户多次点击
          })
          
          // 延迟跳转，确保用户看到成功提示
          setTimeout(() => {
            // 先清除所有页面栈，防止用户返回到登录页
            wx.reLaunch({
              url: '/pages/index/index',
              complete: () => {
                // 重置数据
                this.setData({
                  phone: '',
                  serviceCode: '',
                  canSubmit: false
                })
              }
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.message || (this.data.isLogin ? '登录失败' : '注册失败'),
            icon: 'error'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('请求失败：', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'error'
        })
      }
    })
  },

  toggleMode() {
    this.setData({
      isLogin: !this.data.isLogin
    })
  }
}) 