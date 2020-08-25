export default {
  getConstantsValue: function (group, keyname, keyval, valkey) {
    var g = this[group];
    if (!valkey) valkey = "value";
    var res = "";
    g.forEach(element => {
      //+""转为字符串，避免数字0==false这类的问题
      if (element[keyname] + "" === keyval + "") {
        res = element[valkey];
      }
    });
    return res;
  },
  terminalSearch: [
    // 1-PC，2-H5（移动端网页），3-微信公众号，4-微信小程序 搜索
    {
      id: -1,
      value: "全部"
    },
    /*{
      id: 1,
      value: 'PC'
    },*/
    {
      id: 2,
      value: "H5"
    },
    {
      id: 3,
      value: "微信公众号"
    },
    {
      id: 4,
      value: "微信小程序"
    },
    {
      id: 6,
      value: "企业微信"
    }
  ],
  // 终端来源 0 未知 额外处理
  terminalTypes: [
    //0-未知 1-PC，2-H5（移动端网页），3-微信公众号，4-微信小程序 渲染
    {
      id: -1,
      value: "全部"
    },
    {
      id: 0,
      value: "未知"
    },
    /*{
      id: 1,
      value: 'PC'
    },*/
    {
      id: 2,
      value: "H5"
    },
    {
      id: 3,
      value: "微信公众号"
    },
    {
      id: 4,
      value: "微信小程序"
    },
    {
      id: 5,
      value: "手工录入"
    },
    {
      id: 6,
      value: "企业微信"
    }
  ],
  sourceArray: [
    // 来源/用途
    {
      name: "其他",
      val: 0
    },
    {
      name: "注册会员",
      val: 1
    },
    {
      name: "登录",
      val: 2
    },
    {
      name: "完善个人资料",
      val: 3
    },
    {
      name: "购物",
      val: 4
    },
    // {
    //   name: '评论商品',
    //   val: 5,
    // },
    {
      name: "充值",
      val: 6
    },
    {
      name: "首次分享",
      val: 7
    },
    {
      name: "推荐新会员",
      val: 8
    },
    {
      name: "推荐新分销商",
      val: 9
    },
    {
      name: "申请成为分销商",
      val: 10
    }
    // {
    //   name: "积分转赠收入",
    //   val: 13
    // },
    // {
    //   name: "积分转赠支出",
    //   val: 14
    // }
  ],
  // 交易类型
  transactionType: [
    {
      id: "-1",
      value: "全部"
    },
    {
      id: "1",
      value: "订单支付"
    },
    {
      id: "3",
      value: "订单退款"
    },
    {
      id: "13",
      value: "代理加盟费"
    },
    {
      id: "12",
      value: "云仓进货支付"
    },
    {
      id: "19",
      value: "云仓提货运费"
    },
    // {
    //     id: "20",
    //     value: "经销商加盟费"
    // },
    {
      id: "2",
      value: "余额充值"
    },
    {
      id: "16",
      value: "充值赠送"
    },
    {
      id: "17",
      value: "余额转现收入"
    },
    {
      id: "18",
      value: "余额转现支出"
    },
    {
      id: "8",
      value: "手工充值"
    },
    {
      id: "9",
      value: "手工扣减"
    },
    {
      id: "6",
      value: "余额提现(至第三方)"
    },
    {
      id: "4",
      value: "分销佣金提现(至余额)"
    },
    {
      id: "5",
      value: "分销佣金提现(至第三方)"
    },
    {
      id: "21",
      value: "区代返佣提现(至余额)"
    },
    {
      id: "22",
      value: "区代返佣提现(至第三方)"
    },
    {
      id: "10",
      value: "代理分红提现(至余额)"
    },
    {
      id: "11",
      value: "代理分红提现(至第三方)"
    },
    {
      id: "14",
      value: "经销商资金提现(至余额）"
    },
    {
      id: "15",
      value: "经销商资金提现(第三方）"
    },
    {
      id: "23",
      value: "供应商货款提现(至余额)"
    },
    {
      id: "24",
      value: "供应商货款提现(至第三方)"
    }
  ],
  collectionType: [
    // 付款类型
    {
      value: 1,
      name: "余额"
    },
    {
      value: 2,
      name: "微信"
    },
    {
      value: 3,
      name: "支付宝"
    },
    {
      value: 4,
      name: "Paypal"
    },
    {
      value: 11,
      name: "通联支付"
    },
    {
      value: 99,
      name: "佣金"
    }
  ],
  orderStatus: [
    // 订单
    {
      id: "",
      value: "全部"
    },
    {
      id: -1,
      value: "删除"
    },
    {
      id: 0,
      value: "待付款"
    },
    {
      id: 1,
      value: "待发货"
    },
    {
      id: 2,
      value: "待收货"
    },
    {
      id: 3,
      value: "已收货"
    },
    {
      id: 4,
      value: "已完成"
    },
    {
      id: 5,
      value: "已完成"
    },
    {
      id: 6,
      value: "交易关闭"
    },
    {
      id: 7,
      value: "退款处理中"
    },
    {
      id: 8,
      value: "订单取消"
    }
  ],
  refundStatus: [
    // 售后状态
    {
      id: -1,
      value: "取消"
    },
    {
      id: 0,
      value: "申请"
    },
    {
      id: 1,
      value: "同意退款"
    },
    {
      id: 2,
      value: "拒绝退款"
    },
    {
      id: 3,
      value: "买家已发货"
    },
    {
      id: 4,
      value: "卖家已收货"
    },
    {
      id: 5,
      value: "成功"
    }
  ],
  payChannel: [
    // 支付渠道
    {
      id: 1,
      value: "余额"
    },
    {
      id: 2,
      value: "微信"
    },
    {
      id: 3,
      value: "支付宝"
    },
    {
      id: 11,
      value: "通联支付"
    }
  ],
  afterSaleApplyType: [
    // 售后的申请类型
    {
      id: 0,
      value: "退款"
    },
    {
      id: 1,
      value: "退货"
    }
  ]
};
