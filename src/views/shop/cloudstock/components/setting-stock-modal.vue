<template>
  <div>
    <Modal class="setting-stock" title="设置库存" width="735" v-model="isShow" @on-ok="finish">
      <Table :columns="columns" :data="products"></Table>
    </Modal>
  </div>
</template>
<script>
import axios from "axios";
export default {
  props: {
    currentList: Array,
    productIds: Array,
    value: Boolean
  },
  data() {
    return {
      isShow:false,
      batchValue: null,
      products:[],
      columns: [
        {
          key:"info",
          align: "left",
          width: 382,
          title:"商品信息",
          render: (h,p) => {
            let img = h('img', {
              style:{
                "width": "40px",
                "height": "40px",
                "object-fit": "contain",
                "border-radius": "5px",
                "flex-shrink": 0
              },
              attrs: {
                src: this.formatURL(p.row.image)
              }
            })
            let name = h('div',{
              class:"two-hide"
            }, p.row.product_name)
            let spec = p.row.sku_name && p.row.sku_name.length ? h('div',{
              style: {
                "color": "#9EA7B4"
              }
            }, this.yzArrayToString(p.row.sku_name)) : undefined
            let info = h('div',{
              style: {
                "margin-left": "14px",
                "line-height": "normal"
              }
            },[name, spec])
            return h('div',{
              style: {
                "display":"flex",
                "align-items":"center"
              }
            },[img, info])
          }
        },
        {
          key: "stockNum",
          title: "设置赠送库存",
          align: "center",
          renderHeader: (h) => {
            return h("div",{
              style: {
                "line-height": "normal",
                "padding": "5px 0"
              }
            },[
              h("div", "赠送库存量"),
              h("InputNumber",{
                style: {
                  "width": "100px"
                },
                props: {
                  min: 1,
                  max: 9999999,
                  step: 1,
                  precision: 0,
                  value: this.batchValue,
                  size: "small",
                  placeholder: "批量设置"
                },
                on: {
                  "on-blur": () => {
                    this.batchValue = null
                  },
                  "on-change": (value) => {
                    this.batchValue = value;
                    this.products.forEach(item => {
                      item.stock_num = value;
                    })
                  }
                }
              })
            ])
          },
          render: (h, p) => {
            return h("div",[
              h("InputNumber",{
                style: {
                  "width": "100px"
                },
                props:{
                  min: 1,
                  max: 9999999,
                  step: 1,
                  precision: 0,
                  value: p.row.stock_num || null,
                  placeholder: "请输入库存"
                },
                on: {
                  "on-change": (value) => {
                    this.products[p.index].stock_num = value;
                  }
                }
              })
            ])
          }
        }
      ]
    }
  },
  watch: {
    value(){
      this.isShow = this.value;
    },
    isShow(){
      this.batchValue = null;
      this.$emit("input",this.isShow)
    },
    productIds(){
      this.getSkuList();
    }
  },
  methods: {
    formatURL(url) {
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url
    },
    finish() {
      this.$emit('newGiveStock', this.products);
    },
    getSkuList(){
      axios.post("/shop/admin/cloudstock/product/skus",{
        ids: this.productIds,
        level: this.$parent.currentLevel
      }).then(res => {
        if(res.code == 200){
          this.products = res.data
          this.products.forEach(item => {
            this.$set(item, "cloudstock_level", this.$parent.currentLevel);
            var target = this.currentList.find(innerItem => {
              return (innerItem.product_sku_id == item.product_sku_id 
              || innerItem.sku_id == item.product_sku_id)
              && innerItem.cloudstock_level == item.cloudstock_level
            })
            if(target) {
              this.$set(item, "stock_num", target.stock_num);
            }
          })
        } else {
          this.$Message.error(res.msg)
        }
      }).catch(err => {
        this.$Message.error(error)
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import "../../css/my-theme/index";
.setting-stock{
  /deep/.ivu-table{
    .ivu-input-number-handler-wrap {
      display: none;
    }
    input {
      text-align: center;
    }
  }
  
  /deep/.ivu-modal-body{
    max-height: 506px;
    overflow: auto;
  }
  /deep/.ivu-table-row{
    height:70px;
  }
}
</style>