//index.js
//获取应用实例
var app = getApp()
const i18n = require('../../utils/i18n.js');
const request = require('../../utils/request.js')

Page({
  data: {
    i18n: i18n,
    focus: false,
    hidden: true,
    keywords: '',
    addressHistory: wx.getStorageSync('addressHistory'),
    arrayBlank: new Array(15)
  },
  onShow: function () {
    wx.setNavigationBarTitle({ title: i18n['search'] });
  },
  bindKeyInput: function (e) {
    this.setData({ keywords: e.detail.value })
  },
  bindInputFocus: function (e) {
    this.setData({ focus: true, hidden: true });
  },
  onblur: function (e) {
    this.setData({ focus: false });
  },
  scanQrCode: function (e) {
    var that = this;
    that.setData({ hidden: true })
    wx.scanCode({
      success: (res) => {
        let qrcode;
        console.log(res.result);
        if (res.result.indexOf('https://') > -1) {
          qrcode = res.result.split('https://')[1];
        }
        else if (res.result.indexOf('http://') > -1) {
          qrcode = res.result.split('http://')[1];
        }
        else {
          qrcode = res.result;
        }
        let search = qrcode.split('bitcoin:')[0] ? qrcode : qrcode.split('bitcoin:')[1]; //针对btc.com 带bitcoin：地址优化
        console.log(search);
        if (search) {
          request.getQueryInfo(that, search);
        }
        else {
          that.setData({ hidden: false })
        }
      },

    })
  },
  network: function (e) {
    wx.navigateTo({ url: '../detail/detail?type=status' });
  },
  submitSearch: function (e) {
    let eventAddress = e.currentTarget.dataset.address; //历史地址
    let search = eventAddress ? eventAddress : this.data.keywords;
    if (search) {
      let that = this;
      request.getQueryInfo(that, search);
    }
    else {
      this.setData({ hidden: false })
    }
  },
  nolistHidden: function (e) {
    this.setData({ hidden: true });
  },
  clear: function () {
    wx.clearStorageSync();
    this.setData({ addressHistory: wx.getStorageSync('addressHistory') });
  },
  clearKeywords: function () {
    this.setData({ keywords: '' });
  },
  onShareAppMessage: function () {
    return {
      title: 'BTC.com ' + i18n['search'],
      desc: i18n['description'],
      path: '/pages/index/index'
    }
  },

})
