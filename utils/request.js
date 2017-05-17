
// 发起Http请求，处理逻辑
const config = require('config.js');

/*千分位数据格式化*/
function formatnum(num) {
    return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
}

/*格式化BTC*/
function formatBTC(amout) {
    return (amout / Math.pow(10, 8)).toFixed(8);
}

//算力公式
function networkHashAndDiff(v, type) {
    var unit = ["", " K", " M", " G", " T", " P", " E", " Z", " Y"];
    var index = 0;
    while (v >= 1000) {
        v = v / 1000;
        index++;
    }
    if (type == 'size') {
        return parseFloat(v).toFixed(2) + unit[index] + 'B';
    }
    else {
        return parseFloat(v).toFixed(2) + unit[index] + 'H/s';
    }

}

/*格式化时间戳*/
function formatTime(time) {
    let date = new Date(time * 1000),
        Y = date.getFullYear().toString() + '-',
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
        D = date.getDate() < 10 ? '0' + (date.getDate()) + ' ' : date.getDate() + ' ',
        h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':',
        m = date.getMinutes() < 10 ? '0' + date.getMinutes() + '' : date.getMinutes() + '',
        s = date.getSeconds() < 10 ? ':0' + date.getSeconds() : ':' + date.getSeconds();
    return Y + M + D + h + m + s;
}

/** 块收益*/
function blockRewards(height) {
    return 50 / Math.pow(2, Math.floor(height / 210000));
}


module.exports = {
    getQueryInfo(that, search) {
        //搜索
        wx.request({
            url: config.search + '/' + search,
            success(res) {
                if (res.data.error_msg == 'success') {
                    if (res.data.data.type == "block") {
                        res.data.data.data['confirm'] = formatnum(res.data.data.data['confirm']);
                        res.data.data.data['time'] = formatTime(res.data.data.data['time']);
                        res.data.data.data['prev_block'] = formatnum(parseInt(res.data.data.data['height']) - 1);
                        res.data.data.data['next_block'] = formatnum(parseInt(res.data.data.data['height']) + 1);
                        res.data.data.data['formatHeight'] = formatnum(res.data.data.data['height']);
                        res.data.data.data['size'] = formatnum(res.data.data.data['size']);
                        res.data.data.data['bits'] = parseInt(res.data.data.data['bits']).toString(16);
                        res.data.data.data['nonce'] = parseInt(res.data.data.data['nonce']).toString(16);
                        res.data.data.data['n_tx'] = formatnum(res.data.data.data['n_tx']);
                        res.data.data.data['difficulty'] = formatnum(res.data.data.data['difficulty']);
                    }
                    else if (res.data.data.type == 'address') {
                        let arrayList = wx.getStorageSync('addressHistory') ? wx.getStorageSync('addressHistory') : [];
                        arrayList.length >= config.searchAddressLength ? arrayList.pop() : '';  //最大本地搜索地址历史
                        arrayList.indexOf(res.data.data.data.address) == -1 ? arrayList.unshift(res.data.data.data.address) : ''; //历史地址去重
                        wx.setStorageSync('addressHistory', arrayList);  //增加历史地址
                        res.data.data.data['final_balance'] = formatBTC(res.data.data.data['final_balance']);
                        res.data.data.data['total_sent'] = formatBTC(res.data.data.data['total_sent']);
                        res.data.data.data['total_received'] = formatBTC(res.data.data.data['total_received']);
                        res.data.data.data['n_tx'] = formatnum(res.data.data.data['n_tx']);
                        res.data.data.data['first_tx_timestamp'] = formatTime(res.data.data.data['first_tx_timestamp']);
                        res.data.data.data['last_tx_timestamp'] = res.data.data.data['last_tx_timestamp'] == '-1' ? '-1' : formatTime(res.data.data.data['last_tx_timestamp']);
                        res.data.data.data['unconfirmed_tx_count'] = formatnum(res.data.data.data['unconfirmed_tx_count']);
                        res.data.data.data['unconfirmed_send'] = formatBTC(res.data.data.data['unconfirmed_send']);
                        res.data.data.data['unconfirmed_received'] = formatBTC(res.data.data.data['unconfirmed_received']);
                    }
                    else {
                        res.data.data.data['timestamp'] = formatTime(res.data.data.data['timestamp']);
                        res.data.data.data['formatHeight'] = formatnum(res.data.data.data['height']);
                        res.data.data.data['fee'] = formatBTC(res.data.data.data['fee']);
                    }
                    //搜索结果存在localStorage
                    wx.setStorageSync('detail', res.data.data);
                    if (that.data.hidden) {  //非detail页面活分享情况下
                        that.setData({
                            hidden: true,
                            keywords: '',
                            addressHistory: wx.getStorageSync('addressHistory')
                        });
                        wx.navigateTo({ url: '../detail/detail' });
                    }
                    else {
                        that.getDataInfo(res.data.data);
                    }
                }
                else {
                    if (that.data.hidden) {
                        that.setData({ hidden: false, });
                    }
                    else {
                        wx.switchTab({ url: '../index/index' })
                    }
                }
            }
        })
    },

    getNetworkStatus(that) {
        //网络状态
        wx.request({
            url: config.status,
            success(res) {
                res.data.data['hash_rate'] = networkHashAndDiff(res.data.data['hash_rate']);
                res.data.data['difficulty'] = networkHashAndDiff(res.data.data['difficulty']);
                res.data.data['income'] = res.data.data['income'].toFixed(8);
                res.data.data['tx_24h_rate'] = parseFloat(res.data.data['tx_24h_rate']).toFixed(2);
                res.data.data['fees_recommended'] = parseFloat(res.data.data['fees_recommended'] / 100000).toFixed(4);
                res.data.data['median_block_size'] = networkHashAndDiff(parseFloat(res.data.data['median_block_size']), 'size');
                res.data.data['next_difficulty'] = networkHashAndDiff(res.data.data['next_difficulty']);
                res.data.data['next_income'] = res.data.data['next_income'].toFixed(8);
                res.data.data['unconfirmed_txs_count'] = formatnum(res.data.data['unconfirmed_txs_count']);
                res.data.data['adjust_time'] = formatTime(res.data.data['adjust_time']);
                res.data.data['left_block'] = formatnum(res.data.data['left_block']);
                res.data.data['unconfirmed_txs_size'] = networkHashAndDiff(parseFloat(res.data.data['unconfirmed_txs_size']), 'size');
                res.data.data['estimated_reward_drop_time'] = formatTime(res.data.data['estimated_reward_drop_time']);
                res.data.data['estimated_reward_drop_block'] = formatnum(res.data.data['estimated_reward_drop_block']);
                that.getDataInfo(res.data.data, 'network');
            }
        })
    },

    getDefaultConfig(that, defaultConf, lang, reset) {

        let BTCPrice, USD2CNY, diff, lastHeight;
        that.setData({
            loading: false
        })
        wx.request({
            url: config.currentPrice,
            success(res) {
                BTCPrice = res.data.data.huobibtccny.last;   //币价

                wx.request({
                    url: config.rate,
                    success(res) {
                        USD2CNY = res.data.data.USD2CNY; //汇率

                        wx.request({
                            url: config.status,
                            success(res) {
                                diff = res.data.data.difficulty;//难度

                                wx.request({
                                    url: config.lastHeight,
                                    success(res) {
                                        lastHeight = res.data.data.block_list[0].height;  //块高
                                        defaultConf['zh_CN'].BTCPrice = BTCPrice;
                                        defaultConf['en'].BTCPrice = parseFloat(BTCPrice / USD2CNY).toFixed(2);
                                        defaultConf['zh_CN'].diff = diff;
                                        defaultConf['en'].diff = diff;
                                        defaultConf['zh_CN'].lastHeight = lastHeight;
                                        defaultConf['en'].lastHeight = lastHeight;
                                        defaultConf['zh_CN'].USD2CNY = USD2CNY;
                                        defaultConf['en'].USD2CNY = USD2CNY;
                                        if (reset) {
                                            defaultConf['zh_CN'].hashrate = 1;
                                            defaultConf['en'].hashrate = 1;
                                            defaultConf['zh_CN'].incomeBTC = '';
                                            defaultConf['en'].incomeBTC = '';
                                            defaultConf['zh_CN'].rateIncome = 0;
                                            defaultConf['en'].rateIncome = 0;
                                            defaultConf['zh_CN'].poolFee = 0;
                                            defaultConf['en'].poolFee = 0;
                                        }
                                        that.setData({
                                            config: defaultConf[lang],
                                            loading: true
                                        })
                                        that.calculateIncomeBTC('',diff,0)
                                    }
                                })
                            }
                        })
                    },
                    complete: function () {

                    }
                })
            }
        })

    },

    calculate(calcType, hashRateOrIncomeBTC, diff, poolFee, lastHeight) {
        //计算收益
        let result = '';
        let reg = /^\d+(\.\d+)?$/;
        let poolFeeReg=/^(-?\d+)(\.\d+)?$/;
        let flagHashOrIncome = reg.test(hashRateOrIncomeBTC);
        let flagDiff = reg.test(diff);
        let flagPoolFee = poolFeeReg.test(poolFee);
        let flagLastHeight = reg.test(lastHeight);
        if (flagHashOrIncome && flagDiff && flagPoolFee && flagLastHeight) {
            if (calcType) {
                result = parseFloat((hashRateOrIncomeBTC * 1e12 * 86400 * (blockRewards(lastHeight) * (1 - poolFee / 100)))
                    / (Math.pow(2, 32) * diff)).toFixed(8);
            }
            //计算算力
            else {
                result = parseFloat((hashRateOrIncomeBTC * Math.pow(2, 32) * diff) /
                    (1e12 * 86400 * (blockRewards(lastHeight) * (1 - poolFee / 100)))).toFixed(2);
            }
        }
        return result;

    }

}

