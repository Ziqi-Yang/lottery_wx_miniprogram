// pages/room/enter/enter.js
const app = getApp()
const utils = app.require("./utils/util.js")

Page({
    data: {
        roomId: "",
        dialogShow: false,
        buttons: [{
            text: '确定'
        }],
        dialogText: "房间号输入错误 或者 房间已被创建者删除"
    },
    tapDialogButton(e) {
        this.setData({
            dialogShow: false
        })
    },
    getRoomId(e) {
        const {value} = e.detail
        this.setData({
            roomId: value,
        })
    },
    enterRoom(e) {
        if (this.data.roomId == "") {
            this.setData({
                dialogShow: true,
                dialogText: "请输入房间号"
            })
            return
        }
        // 检查输入是否符合规范 （0-9或者a-f或者A-F)
        for (let i in this.data.roomId) {
            let c = this.data.roomId[i]
            if ( !((c >= "0" && c <= "9") || (c >= "a" && c <= "f") || (c >= "A" && c <= "F")) ) {
                this.setData({
                    dialogShow: true,
                    dialogText: "房间号只能由0-9以及a-f组成"
                })
                return
            }
        }

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
})