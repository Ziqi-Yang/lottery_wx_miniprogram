const defaultFailFunc = res => {
    console.log(res.data)
    wx.showToast({
        title: "请求失败",
        icon: "error",
        duration: 2000
    });
}
// 异步请求
const request = (url, callback, data, method = "GET", failFunc = defaultFailFunc) => {
    // 每次请求的时候都需检查set-cookie，防止sessoin过期失效
    var cookie = wx.getStorageSync('Cookie')
    if (cookie != "") {
        getApp().globalData.header["Cookie"] = cookie
    }
    wx.request({
        header: getApp().globalData.header,
        method: method,
        url: url,
        data: data,
        success: function(res){
            if (res.header["Set-Cookie"] != null){
                getApp().globalData.header["Cookie"] = res.header["Set-Cookie"]
                wx.setStorageSync("Cookie", res.header["Set-Cookie"])
            }
            if (callback != null) {
                callback(res)
            }
        },
        fail: failFunc
    })
}

// 同步请求，调用: utils.requestPromise(url).then(res => {}) // do then when success
const requestPromise = myUrl => {
    // 每次请求的时候都需检查set-cookie，防止sessoin过期失效
    var cookie = wx.getStorageSync('Cookie')
    if (cookie != "") {
        getApp().globalData.header["Cookie"] = cookie
    }
    // 返回一个Promise实例对象
    return new Promise((resolve, reject) => {
        wx.request({
        header: getApp().globalData.header,
        url: myUrl,
        success: res => resolve(res),
        fail: defaultFailFunc
        })
    })
}

module.exports = {
  request, requestPromise
}