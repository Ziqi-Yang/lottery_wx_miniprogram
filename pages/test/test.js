// pages/test/test.js
Page({
    data: {

    },
    onLoad(options) {
        var linked = options.linked
        if (linked) {
            console.log(options.linked)
        }
    },
    onShareAppMessage() {
        return {
            title: "进入列奥那多是勇者的房间",
            desc: "参与摇人",
            path: "/pages/test/test"
        }
    }
})