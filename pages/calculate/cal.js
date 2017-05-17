// pages/calculate/cal.js
const i18n = require('../../utils/i18n.js');
const lang = require('../../utils/config.js').lang;
const request = require('../../utils/request.js');

var defaultConf = {
  'zh_CN': {
    currency: 'CNY',
    Symbol: '¥',
    hashrate: 1,
    incomeBTC: '',
    poolFee: 0,
    currencyIndex: 0,
    lastHeight: '',
    diff: '',
    BTCPrice: '',
    rateIncome: 0,
    USD2CNY: 1,
  },
  'en': {
    currency: 'USD',
    Symbol: '$',
    hashrate: 1,
    incomeBTC: '',
    poolFee:0,
    currencyIndex: 1,
    lastHeight: '',
    diff: '',
    BTCPrice: '',
    rateIncome: 0,
    USD2CNY: 1,
  }
};

Page({
  data: {
    i18n: i18n,
    config: defaultConf[lang],
    loading: false,
    currencyMap: ['CNY - ¥', 'USD - $']
  },

  onShow: function () {
    wx.setNavigationBarTitle({ title: i18n['calTitle'] }); //设置标题
    request.getDefaultConfig(this, defaultConf, lang); //获取币价、 难度 、汇率信息,高度
  },

  //切换币种
  currencyChange: function (e) {
    this.setData({
      config: e.detail.value == 0 ? defaultConf['zh_CN'] : defaultConf['en']
    })
  },

  //改变价格
  changePrice: function (e) {
    let reg = /^\d+(\.\d+)?$/;
    let flagPrice = reg.test(e.detail.value);
    if (flagPrice) {

      if (this.data.config.currencyIndex == 0) {
        defaultConf['zh_CN'].BTCPrice = e.detail.value;
        defaultConf['en'].BTCPrice = parseFloat(e.detail.value / defaultConf['en'].USD2CNY).toFixed(2);
      }
      else {
        defaultConf['zh_CN'].BTCPrice = parseFloat(e.detail.value * defaultConf['en'].USD2CNY).toFixed(2);
        defaultConf['en'].BTCPrice = e.detail.value;
      }

      defaultConf['zh_CN'].rateIncome = defaultConf['zh_CN'].incomeBTC ?
        parseFloat(defaultConf['zh_CN'].incomeBTC * defaultConf['zh_CN'].BTCPrice).toFixed(2) : 0;
      defaultConf['en'].rateIncome = defaultConf['en'].incomeBTC ?
        parseFloat(defaultConf['en'].incomeBTC * defaultConf['en'].BTCPrice).toFixed(2) : 0;
    }
    else {
      if (this.data.config.currencyIndex == 0) {
        defaultConf['zh_CN'].BTCPrice = e.detail.value;
      }
      else {
        defaultConf['en'].BTCPrice = e.detail.value;
      }
      defaultConf['zh_CN'].rateIncome = 0;
      defaultConf['en'].rateIncome = 0;
    }
    this.setData({
      config: this.data.config.currencyIndex == 0 ? defaultConf['zh_CN'] : defaultConf['en']
    })

  },

  //改变难度
  changeDiff: function (e) {
    defaultConf['zh_CN'].diff = e.detail.value;
    defaultConf['en'].diff = e.detail.value;
    this.setData({
      config: this.data.config.currencyIndex == 0 ? defaultConf['zh_CN'] : defaultConf['en']
    })
    this.calculateIncomeBTC(e, true, false)
  },

  //设定推荐矿池费率
  changePoolFee: function (e) {
    let poolFee = e.detail.value ? e.detail.value : e.currentTarget.dataset.fee;
    defaultConf['zh_CN'].poolFee = poolFee;
    defaultConf['en'].poolFee = poolFee;
    this.setData({
      config: this.data.config.currencyIndex == 0 ? defaultConf['zh_CN'] : defaultConf['en']
    })
    this.calculateIncomeBTC(e, false, true)
  },

  //计算收益
  calculateIncomeBTC: function (e, changeDiff, changePoolFee) {
    let hashrate = changeDiff || changePoolFee ? this.data.config.hashrate : e.detail.value;
    let incomeBTC = request.calculate(true, hashrate, this.data.config.diff, this.data.config.poolFee, this.data.config.lastHeight);
    defaultConf['zh_CN'].hashrate = hashrate;
    defaultConf['en'].hashrate = hashrate;
    defaultConf['zh_CN'].incomeBTC = incomeBTC;
    defaultConf['en'].incomeBTC = incomeBTC;
    defaultConf['zh_CN'].rateIncome = incomeBTC ? parseFloat(incomeBTC * defaultConf['zh_CN'].BTCPrice).toFixed(2) : 0;
    defaultConf['en'].rateIncome = incomeBTC ? parseFloat(incomeBTC * defaultConf['en'].BTCPrice).toFixed(2) : 0;
    this.setData({
      config: this.data.config.currencyIndex == 0 ? defaultConf['zh_CN'] : defaultConf['en']
    })
  },

  //计算算力
  calculateHashrate: function (e) {
    let incomeBTC = e.detail.value;
    let reg = /^\d+(\.\d+)?$/;
    let flagIncomeBTC = reg.test(incomeBTC);
    let hashrate = request.calculate(false, incomeBTC, this.data.config.diff, this.data.config.poolFee, this.data.config.lastHeight);
    defaultConf['zh_CN'].hashrate = hashrate;
    defaultConf['en'].hashrate = hashrate;
    defaultConf['zh_CN'].incomeBTC = incomeBTC;
    defaultConf['en'].incomeBTC = incomeBTC;
    defaultConf['zh_CN'].rateIncome = incomeBTC && flagIncomeBTC ? parseFloat(incomeBTC * defaultConf['zh_CN'].BTCPrice).toFixed(2) : 0;
    defaultConf['en'].rateIncome = incomeBTC && flagIncomeBTC ? parseFloat(incomeBTC * defaultConf['en'].BTCPrice).toFixed(2) : 0;
    this.setData({
      config: this.data.config.currencyIndex == 0 ? defaultConf['zh_CN'] : defaultConf['en']
    })
  },

  //下拉重置config
  onPullDownRefresh: function () {
    request.getDefaultConfig(this, defaultConf, lang, true); //获取币价、 难度 、汇率信息,高度
    wx.stopPullDownRefresh();
  },


  //分享
  onShareAppMessage: function () {
    return {
      title: i18n.calTitle,
      desc: i18n.cal_desc,
      path: '/pages/calculate/cal'
    }
  },
})