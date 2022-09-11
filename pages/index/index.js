// index.js
// 获取应用实例
const app = getApp()
const utils = app.require("./utils/util.js")

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    nickName: "微信用户",
    avatarUrl: defaultAvatarUrl,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },
  // 事件处理函数
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
        nickName: app.globalData.nickName,
        avatarUrl: app.globalData.avatarUrl,
      })
    }
  },
  createRoom(e) {
      var url = app.globalData.baseUrl + "room/create"
      var callback = res => {
        console.log("创建房间成功， 房间号：", res.data.roomId)
        // 直接转到room page
        wx.navigateTo({
          url: '/pages/room/index/index?roomId=' + res.data.roomId + "&isRoomOwner=true",
        })
        }
      utils.request(url, callback)
  }, 
  enterRoom(e) {
      wx.navigateTo({
        url: '/pages/room/enter/enter',
      })
  }
})