// pages/room/enter/enter.js
const app = getApp()
const utils = app.require("./utils/util.js")

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

var sotk = null;
var socketOpen = false;
var wsbasePath = app.globalData.wsBaseUrl + "room/wsChannel?openId=" // 由于websocket不携带cookie，这里粗暴点直接传入user的openId (page外面貌似用不了app的globalData, 只能在onload里用了)

Page({
    data: {
        roomId: "",
        isRoomOwner: false,
        // roomOwner: {
        //     nickName: "",
        //     openId: ""
        // },
        avatarUrl: defaultAvatarUrl, // 结果展示区
        nickName: "等待房主开始摇人",
        resUser: { // 摇中的用户
            avatarUrl: "",
            nickName: ""
            // openid
        },
        randomAnimationRunning: false, 
        messages: [],
        users: [], // [openId: {nickName, avatarUrl, openId}]
    },
    onLoad: function(option) {
        // 由于小程序页面推出后再进入相同路径的页面（与url参数无关）在page外的语句不会重复执行，这里需要重新赋值一下（特别是wsbasePath, 不然会出错)
        sotk = null
        socketOpen = false;
        wsbasePath = app.globalData.wsBaseUrl + "room/wsChannel?openId="

        this.setData({
            roomId: option.roomId, // url?roomId=xxxxxx&isRoomOwner=false&nickName
            isRoomOwner: option.isRoomOwner == "true" ? true : false
        })
        // console.log(that.data.isRoomOwner)
        // this.getRoomOwnerInform()
        wsbasePath +=  app.globalData.openId
        if (this.data.isRoomOwner) {
            this.setData({
                nickName: "点击头像摇人"
            })
        }

        // get all users
        var url = app.globalData.baseUrl + "room/allUsers"
        utils.requestPromise(url).then(res => {
            this.setData({
                users: res.data
            })
            this.webSocketStart()
        })
    },
    onUnload(){
        this.closeWebsocket()
    },
    // getRoomOwnerInform(){
    //     var url = app.globalData.baseUrl + "room/owner"
    //     var callback = res => {
    //         this.setData({
    //             roomOwner: {
    //                 nickName: res.data.nickName,
    //                 openId: res.data.openId
    //             },
    //         })
    //     }
    //     await utils.request(url, callback)
    // },
    addUser(user) {
        var users = this.data.users
        if (users.hasOwnProperty(user.openId)) {return}
        users[user.openId] = user
        this.setData({
            users,
        })
        // console.log(users)
    },
    deleteUser(user) {
        var users = this.data.users
        delete users[user.openId]
        this.setData({
            users,
        })
    },
    addMessage(message) {
        let messages = this.data.messages
        messages.push(message)
        if (messages.length > 3) {
            messages.shift()
        }
        this.setData({
            messages
        })
    },
    randomAnimation() {
        var users = []
        for (var openId in this.data.users) {
            users.push(this.data.users[openId])
        }
        var index = -1;
        let that = this
        var changeDisplay = setInterval(function(){
            index++
            index %= users.length
            that.setData({
                avatarUrl: users[index].avatarUrl,
                nickName: users[index].nickName
            })
            if (!that.data.randomAnimationRunning) {
                clearInterval(changeDisplay)
                that.setData({
                    avatarUrl: that.data.resUser.avatarUrl,
                    nickName: that.data.resUser.nickName
                })
                that.addMessage(`最终的摇人结果是 ${that.data.resUser.nickName}`)
            }
        }, 50)
    },
    randChooseUser(){
        wx.showToast({
          title: '开始摇人',
          icon: "success",
          duration: 500
        })
        var url = app.globalData.baseUrl + "room/rand1"
        utils.request(url)
    },
    webSocketStart() {
        // console.log(wsbasePath)
        sotk = wx.connectSocket({
            url: wsbasePath,
            success: res => {
                console.log('开始websocket');
            },
            fail: err => {
                console.log('打开websocket失败：' + err);
                wx.showToast({
                    title: '打开websocket失败',
                    icon: "error",
                    duration: 2000
                })
            }
        })
        this.webSokcketMethods();
    },

    //监听指令
    webSokcketMethods(e){
        sotk.onOpen(res => {
            socketOpen = true;
            console.log('成功建立websocket连接');
        })
        sotk.onClose(onClose => {
            console.log('服务端WebSocket关闭')
            socketOpen = false;
        })
        sotk.onError(onError => {
            console.log('websocket发生错误，错误信息：', onError)
            socketOpen = false
        })
        sotk.onMessage(onMessage => {
            var data = JSON.parse(onMessage.data);
            if (data.type == 0) { // 检查存活
                this.sendSocketMessage("ok")
            } else if (data.type == 1) { // communication
                if (data.action == "进入"){
                    this.addUser(data.user)
                } else if (data.action == "退出") {
                    this.deleteUser(data.user)
                }
                this.addMessage(`${data.user.nickName} ${data.action}了房间`)
            } else if (data.type == 2) { // random
                this.addMessage(`房主开始了摇人...`)
                this.setData({
                    randomAnimationRunning: true
                })
                this.randomAnimation() // 摇人动画 异步
                let that = this
                setTimeout(function(){
                    that.setData({
                        resUser: {
                            avatarUrl: data.user.avatarUrl,
                            nickName: data.user.nickName
                            // openId
                        },
                        randomAnimationRunning: false
                    })
                },2000)
            }
        })
    },

    //发送消息
    sendSocketMessage(msg) {
        if (socketOpen){
            // console.log('通过 WebSocket 连接发送')
            sotk.send({
                data: JSON.stringify(msg)
                })
        }
    },

    //关闭连接
    closeWebsocket(str){
        if (socketOpen) {
            sotk.close({
                code: "1000",
                reason: str,
                success: function () {
                    console.log("成功关闭websocket连接");
                }
            })
        }
    },
})