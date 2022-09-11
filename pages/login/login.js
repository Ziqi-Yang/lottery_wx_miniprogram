// index.js
// 获取应用实例
const app = getApp()
const utils = app.require("./utils/util.js")

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    nickName: "请选择当前微信昵称填入",
    avatarUrl: defaultAvatarUrl,
    canIUseGetUserProfile: false,
  },
  // 事件处理函数
  onLoad() {
    if (wx.getUserProfile) {
        this.setData({
            // 2022.10.26日后把这行代码注释
            // canIUseGetUserProfile: true
        })
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      // 貌似 desc 长度超出一定范围会无法弹出
      desc: "展示用途", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
        })
        app.globalData.nickName = res.userInfo.nickName
        app.globalData.avatarUrl = res.userInfo.avatarUrl
        this.login()
      }
    })
  },
  onChooseAvatar(e) {
    const {avatarUrl} = e.detail
    this.setData({
      avatarUrl,
    })
    app.globalData.avatarUrl = avatarUrl
  },
  collectNickName(e) {
    const {value} = e.detail
    this.setData({
      nickName: value,
    })
    app.globalData.nickName = value
  },
  login(e) {
    var url = app.globalData.baseUrl + "login/login"
    var data = {
        openId: app.globalData.openId,
        nickName: this.data.nickName,
        avatarUrl: this.data.avatarUrl
    }
    var callback  = res => {
        wx.navigateTo({
          url: '/pages/index/index',
        })
    }
    utils.request(url, callback, data, "POST")
  },
})