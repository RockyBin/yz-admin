export const buyOrderStatus = [
  {name:"全部", value: null, className: ""},
  {name:"待付款", value: 0, className: "table-warning"},
  {name:"待财务审核", value: 1, className: "table-warning"},
  {name:"待配仓", value: 2, className: "table-warning"},
  {name:"已完成", value: 3, className: "table-success"},
  {name:"订单取消", value: 4, className: "table-error"}
]
export const getOrderStatus = [
  {name:"全部", value: null, className: ""},
  {name:"待付款", value: 4, className: "table-warning"},
  {name:"待发货", value: 0, className: "table-warning"},
  {name:"待收货", value: 1, className: "table-warning"},
  {name:"已完成", value: 2, className: "table-success"},
  {name:"订单取消", value: 3, className: "table-error"}
  // {name:"订单关闭", value: 3, className: "table-error"},
]
export const payTypesMap = {
  6: "线下结算-微信钱包",
  7: "线下结算-支付宝",
  8: "线下结算-支付宝账户",
  9: "线下结算-银行账户"
}
export const paymentStatus = {
  0: "未审核",
  1: "审核通过",
  2: "审核不通过"
}