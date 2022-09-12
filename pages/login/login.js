// index.js
// 获取应用实例
const app = getApp()
const utils = app.require("./utils/util.js")

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const defaultNickName = "请选择当前微信昵称填入"

Page({
  data: {
    nickName: defaultNickName,
    avatarUrl: defaultAvatarUrl,
    canIUseGetUserProfile: false,
    roomId: "",
    dialogShow: false,
    buttons: [{
        text: '确定'
    }],
    dialogText: "房间号输入错误 或者 房间已被创建者删除"
  },
  // 事件处理函数
  onLoad(options) {
    var roomId = options.roomId; // 通过分享链接传来的url参数
    if (roomId) {
        this.setData({
            roomId: roomId
        })
    }
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
    // if (value != "asdf") { // 分享链接测试用
    //     this.setData({
    //         roomId: "333333"
    //     })
    // }
  },
  login(e) {
    var url = app.globalData.baseUrl + "login/login"
    var nickName = this.data.nickName
    if (nickName == defaultNickName || nickName == ""){ // TODO
        nickName = "未知用户"
        app.globalData.nickName = "未知用户"
    }
    var data = {
        openId: app.globalData.openId,
        nickName: nickName,
        avatarUrl: this.data.avatarUrl
    }
    var callback  = res => {
        if (this.data.roomId == ""){ // 正常注册
            wx.navigateTo({
                url: '/pages/index/index',
            })
        } else { // 通过分享链接注册
            var url = app.globalData.baseUrl + "room/enter"
            var callback  = res => {
                // console.log(res.data)
                if (res.data.err != 0) {
                    console.log(res.data.errmsg)
                    this.setData({
                        dialogShow: true,
                        dialogText: "房间号输入错误 或者 房间已被创建者删除"
                    })
                    return
                }
                wx.navigateTo({
                    url: '/pages/room/index/index?roomId=' + this.data.roomId + "&isRoomOwner=false",
                })
            }
            var data = {
                "roomId": this.data.roomId
            }
            utils.request(url, callback, data, "POST")
        }
    }
    utils.request(url, callback, data, "POST")
  },
})