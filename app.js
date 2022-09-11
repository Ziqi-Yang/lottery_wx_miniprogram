// app.js
var utils = require("./utils/util.js")

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

App({
  globalData: {
    header: {
      'Cookie': ''
    },
    baseUrl: "https://lottery.animer.live:8080/",
    wsBaseUrl: "wss://lottery.animer.live:8080/",
    // baseUrl: "https://localhost:8080/",
    // wsBaseUrl: "wss://localhost:8080/",
    openId: "",
    nickName: "微信用户",
    avatarUrl: defaultAvatarUrl
  },
  require(path) {
    // 解决直接require相对路径麻烦的问题，调用app.require的路径从根目录开始的(相对于app)
    return require(`${path}`)
  },
  onLaunch() {
    // 登录
    wx.login({
      success: res => {
          if (res.code) {
            var url = getApp().globalData.baseUrl + "login/wx?code=" + res.code
            var callback = (res) => {
                this.globalData.openId = res.data.openId
                // 由于request异步的，在login页面还是显示默认的头像昵称
                // this.globalData.avatarUrl = res.data.avatarUrl
                // this.globalData.nickName = res.data.nickName
            }
            var failFunc = res => {
                // console.log(res.data)
                wx.showToast({
                    title: "连接服务器失败",
                    icon: "error",
                    duration: 2000
                });
            }
            utils.request(url, callback, null, "GET", failFunc)
          }
      }
    })
  }
})

