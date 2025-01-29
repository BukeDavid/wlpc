App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'https://express-137278-10-1339258759.sh.run.tcloudbase.com/api/v1'
  },
  
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'wlpc-yun-2gaprdku060bbe10',
        traceUser: true,
      })
    }

    // 检查本地存储的登录状态
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.checkSession()
    }
  },

  checkSession() {
    // 验证登录态是否过期
    wx.checkSession({
      fail: () => {
        // session_key 已经失效，需要重新执行登录流程
        this.globalData.token = null
        wx.removeStorageSync('token')
      }
    })
  }
}) 