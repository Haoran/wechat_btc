
const i18n = require('../../utils/i18n.js');
const QR = require("../../utils/qrcode.js");
const request = require('../../utils/request.js');

Page({
  data: {
    i18n: i18n,
    keywords: '',
    type: '',
    detail: {},
    imagePath: '',
  },
  onShow:function(){

  },
  onLoad: function (options) {
    if (options.keywords) {
      request.getQueryInfo(this, options.keywords);
    }
    else if (options.type) {
      request.getNetworkStatus(this);
    }
    else {
      this.getDataInfo(''); // 不带参数情况下(本地已缓存数据)
    }
  },

  //查询高度
  getHeight: function (e) {
    let height = e.currentTarget.dataset.height;
    let that = this;
    request.getQueryInfo(that, height);
  },

  //查询数据
  getDataInfo: function (result, status) {
    if (status == 'network') {
      this.setData({
        type: 'network',
        detail: result
      });
    }
    else {
      this.setData({
        type: result == '' ? wx.getStorageSync('detail').type : result.type,
        detail: result == '' ? wx.getStorageSync('detail').data : result.data
      });
    }

    switch (this.data.type) {
      case 'block':
        wx.setNavigationBarTitle({ title: i18n[this.data.type] + ' ' + this.data.detail.formatHeight }); //设置标题
        this.setData({ keywords: this.data.detail.height }); //定义分享标题
        break;
      case 'address':
        wx.setNavigationBarTitle({ title: i18n[this.data.type] });
        this.setData({ keywords: this.data.detail.address }); //定义分享标题
        var initUrl = this.data.detail.address;
        this.createQrCode(initUrl, "mycanvas"); //创建二维码
        break;
      case 'tx':
        wx.setNavigationBarTitle({ title: i18n[this.data.type] });
        this.setData({ keywords: this.data.detail.hash }); //定义分享标题
        break;
      default:
        wx.setNavigationBarTitle({ title: i18n['networkStatus'] });
        this.setData({ keywords: i18n["statusInfo"] }); //定义分享标题
        break;
    }
  },

  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        that.setData({
          imagePath: tempFilePath,
        });
      },
      fail: function (res) {
        // console.log(res);
      }
    });
  },

  //创建二维码
  createQrCode: function (url, canvasId, cavW, cavH) {
    QR.qrApi.draw(url, canvasId, 256, 256);  //调用插件中的draw方法，绘制二维码图片
    this.canvasToTempImage();
  },

  //分享
  onShareAppMessage: function () {
    return {
      title: this.data.type == 'network' ? i18n['networkStatus'] : i18n[this.data.type] + i18n['detail'],
      desc: this.data.keywords,
      path: this.data.type == 'network' ? '/pages/detail/detail?type=status' : '/pages/detail/detail?keywords=' + this.data.keywords
    }
  },
})