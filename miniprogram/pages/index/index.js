// pages/index/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    notice: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkAuth()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (!app.globalData.token) {
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    
    this.fetchUserInfo()
    this.fetchNotice()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

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

  checkAuth() {
    if (!app.globalData.token) {
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }
  },

  fetchUserInfo() {
    wx.cloud.callContainer({
      config: {
        env: 'prod-0gdi5v7wb36848ce'
      },
      path: '/api/v1/user/info',
      header: {
        'X-WX-SERVICE': 'express',
        'content-type': 'application/json',
        'Authorization': `Bearer ${app.globalData.token}`
      },
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          this.setData({
            userInfo: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败：', err)
      }
    })
  },

  fetchNotice() {
    wx.cloud.callContainer({
      config: {
        env: 'prod-0gdi5v7wb36848ce'
      },
      path: '/api/v1/notice/latest',
      header: {
        'X-WX-SERVICE': 'express',
        'content-type': 'application/json',
        'Authorization': `Bearer ${app.globalData.token}`
      },
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          this.setData({
            notice: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('获取公告失败：', err)
      }
    })
  }
})