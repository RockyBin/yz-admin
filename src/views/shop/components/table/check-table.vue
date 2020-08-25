<template>  
  <div>
    <Table :columns="columnsHead"
      :data="dataHead"
      @on-select-all="selectAll"
      @on-select-all-cancel="cancelSelectALL"
      class="hide-body">
    </Table>

    <div v-for="(item, index) in listes" :key="index" class="table-list">
      <div class="table-head">
        <Checkbox v-model='item.checked'></Checkbox>
        <label>下单时间: 2018.11.27</label>
        <label>总订单号:2015524521452545</label>
        <label>总订单状态: 代发货</label>
        <label>终端来源: 公众号</label>
      </div>
      <Table border :ref="'table' + index" :columns="columns1.map(el => {el = Object.assign({},el),el.indexTable = index;return el})" :data="item.lists" :show-header="false"></Table>
    </div>    
  </div>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default: []
    },
    headData: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      dataHead: [
        {
          _checked: false,       
          shop: '',
          price: '',
          nums: '',
          news: '',
          preferential: '',
          subtotal: '',
          orderMoney: '',
          orderStatus: '',
          note: ''
        }
      ],
      columnsHead: [
        {          
          type: "selection", // 开启checkbox
          width: 60,             
        },
        {
          title: '商品',
          key: 'shop'
        },
        {
          title: '单价',
          key: 'price'
        },
        {
          title: '数量',
          key: 'nums'
        },
        {
          title: '买家信息',
          key: 'news'
        },
        {
          title: '优惠',
          key: 'preferential'
        },
        {
          title: '小计',
          key: 'subtotal'
        },
        {
          title: '订单金额',
          key: 'orderMoney' 
        },
        {
          title: '订单状态',
          key: 'orderStatus'            
        },
        {
          title: '用户留言/备注',
          key: 'note'  
        }
      ],
       columns1: [
          {
            title: '商品',
            key: 'shop'
          },
          {
            title: '单价',
            key: 'price'
          },
          {
            title: '数量',
            key: 'nums'
          },
          {
            title: '买家信息',
            key: 'news'
          },
          {
            title: '优惠',
            key: 'preferential'
          },
          {
            title: '小计',
            key: 'subtotal'
          },
          {
          title: '订单金额', 
          render: (h, params) => {
            return this.tableExpand(h, params, params.row.orderMoney)
          }        
        },
        {
          title: '订单状态',              
          render: (h, params) => {
            return this.tableExpand(h, params, params.row.orderStatus)
          }
        },
        {
          title: '用户留言/备注',
          render: (h, params) => {
            return this.tableExpand(h, params, params.row.note)
          }      
        }
      ],
      listes: [
        { 
          id: '1',
          lists: [
            {
              shop: '玩具车',
              price: 18,
              nums: 5,
              news: '株洲',
              preferential: '5',
              subtotal: 200,
              orderMoney: 200,
              orderStatus: 0,
              note: '1221'
            },
            {
              shop: '玩具车',
              price: 18,
              nums: 5,
              news: '株洲',
              preferential: '5',
              subtotal: 200,
              orderMoney: 200,
              orderStatus: 0,
              note: '1221'
            },
            {
              shop: '玩具车',
              price: 18,
              nums: 5,
              news: '株洲',
              preferential: '5',
              subtotal: 200,
              orderMoney: 200,
              orderStatus: 0,
              note: '1221'
            }                                   
          ]                     
        },
        { 
          id: '2', 
          lists: [
            {
              shop: '玩具车',
              price: 18,
              nums: 5,
              news: '株洲',
              preferential: '5',
              subtotal: 200,
              orderMoney: 200,
              orderStatus: 0,
              note: '1221'
            },
            {
              shop: '玩具车',
              price: 18,
              nums: 5,
              news: '株洲',
              preferential: '5',
              subtotal: 200,
              orderMoney: 200,
              orderStatus: 0,
              note: '1221'
            }                                  
          ]                     
        }
      ]
    }
  },
  watch: {
    listes: {
      handler (val) {
        for (let i = 0; i < val.length; i++) {
          if (val[i].checked === true) {    
            this.$set(this.dataHead[0], '_checked', true)
          } else {            
            this.$set(this.dataHead[0], '_checked', false)
            return
          }
        }
      },
      deep:true
    }
  },
  methods: {
    // 全选
    selectAll (val) {
      this.dataHead._checked = !this.dataHead._checked
      for (let i = 0; i < this.listes.length; i++) {         
          this.listes[i].checked = true
      }
    },
    cancelSelectALL (val) {
      this.dataHead._checked = !this.dataHead._checked
      for (let i = 0; i < this.listes.length; i++) {         
          this.listes[i].checked = false
      }
    },
    // 合并单元格
    tableExpand (h, params, data) {
      if (typeof params.column.indexTable === 'undefined') {
        return h('span')
      }
      if (params.index === 0) {
        this.$nextTick(() => {          
          this.$refs['table' + params.column.indexTable][0].$el.querySelector('.ivu-table-tbody tr td:nth-child('+ params.column._index +')').setAttribute('rowspan', this.listes[params.column.indexTable].lists.length)                    
        })        
      } else {
        this.$nextTick(() => {          
          this.$refs['table' + params.column.indexTable][0].$el.querySelector('.ivu-table-tbody tr:nth-child(' + (params.index + 1) + ') td:nth-child('+ params.column._index +')').style.display="none"
        })                
      }
      return h('span', data)
    }
  },
  mounted () {
    for (let i = 0; i < this.listes.length; i++) {
      this.$set(this.listes[i], 'checked', false)
    }
  }
};
</script>
<style lang="less" scoped>
.table-list{
  margin-top: 20px;
  .table-head{
    border: 1px solid #ddd;
    border-bottom: 0;
    height: 38px;
    line-height: 38px;
  }
  /deep/.ivu-table td{
    height: 70px;
  }
}
.hide-body{
  /deep/.ivu-table-tip{
    display: none;
  }
  /deep/.ivu-table-body{
    display: none;
  }
}
</style>
