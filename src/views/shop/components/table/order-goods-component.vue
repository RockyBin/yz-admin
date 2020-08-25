<template>
  <div>
    <div v-if="status === 'news'">
      <div>
        <label>ID：</label>
        <label> {{ datas.member_id }}</label>     
      </div>
      <div>
        <label>昵称：</label>
        <label> {{ datas.member_nickname }}</label>     
      </div>
      <div>
        <label>手机：</label>
        <label> {{ datas.member_mobile }}</label>     
      </div>
    </div> 
    <div v-if="status === 'order'">
      <div>
        <label>￥</label>
        <label> {{ datas.money }}</label>     
      </div>     
    </div> 
    <div v-if="status === 'status'">
      <div>       
        <label> {{ matchName(datas.status, orderStatus) }}</label>     
      </div>
    </div>  
    <div v-if="status === 'remark'">
      <div>       
        <label> {{ datas.remark }}</label>     
      </div>
    </div> 
    <div v-if="status === 'operation'">
      <div>   
        <div class="common-order-style" @click="onCheckOrder">查看订单</div>
        <div class="common-order-style" @click="onDelivery" v-if="datas.status === 1">发货</div>
        <div class="common-order-style" @click="onSplitSingle" v-if="datas.status === 1">拆单发货</div> 
      </div>
    </div>       
  </div>
</template>
<script>
export default {
  props: {
    datas: {
      type: Object,
      default: () => {}
    },
    status: {
      type: String,
      default:''
    }
  },
  data () {
    return {     
      orderStatus: [
        {
          value: '',
          name: '所有'
        },
        {
          value: -1,
          name: '已删除'
        },
        {
          value: 0,
          name: '待付款'
        },
        {
          value: 1,
          name: '待发货'
        },
        {
          value: 2,
          name: '待收货'
        },
        {
          value: 3,
          name: '已收货'
        },
        {
          value: 4,
          name: '交易成功'
        },
        {
          value: 5,
          name: '交易完成'
        },{
          value: 6,
          name: '交易关闭'
        },
        {
          value: 7,
          name: '退款处理中'
        },
        {
          value: 8,
          name: '订单取消'
        },
      ]
    }
  },
  methods: {
    // 查看订单
    onCheckOrder () {
      this.$router.push({name: 'orderDetail',query: {
        id: this.datas.id
      }})
    },
    // 拆单发货
    onSplitSingle () {
      this.$router.push({name: 'orderDemolitionOrder',query: {
        id: this.datas.id
      }})
    },
    // 发货
    onDelivery () {
      this.$router.push({name: 'orderDetail',query: {
        id: this.datas.id, showModal: true
      }})
    },
    // 匹配名称
    matchName (val, data) {
      let names = ''
      data.forEach(item => {
        if (val === item.value) {
          names = item.name
        }
      })
      return names
    }
  }
}
</script>
<style lang="less" scoped>
.common-order-style{
  cursor: pointer;
}
</style>

