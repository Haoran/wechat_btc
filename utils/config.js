// 配置信息
const language=wx.getSystemInfoSync().language;
const config= {
    lang: ~language.indexOf('zh') ? 'zh_CN' : 'en',
    search: 'https://btcapp.api.btc.com/v1/search',
    status:'https://btcapp.api.btc.com/v1/status',
    lastHeight:'https://btcapp.api.btc.com/v1/block/list?limit=1',
    currentPrice:'https://price3.api.btc.com/v3/ticker/snapshot?symbol=huobibtccny',
    rate:'https://btcapp.api.btc.com/v1/exchange-rate',
    searchAddressLength:30, //本地储存搜索历史地址最大数
}

module.exports=config