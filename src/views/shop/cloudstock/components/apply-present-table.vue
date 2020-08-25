<template>
<div class="present-table-container">
  <Tabs type="card" v-model="currentLevel" @on-click="validateCurrentLevel">
    <TabPane label="一级云仓" name="1"></TabPane>
    <TabPane label="二级云仓" name="2"></TabPane>
    <TabPane label="三级云仓" name="3"></TabPane>
  </tabs>
  <Form :model="formData" ref="tableForm">
    <Table :width="712" :columns="columns" :data="currentList" @on-selection-change="selectionChange"></Table>
    <!-- <add-more text="添加商品" @onAddMoreClick="onAddMoreClick" perm="logistics.operate"></add-more> -->
    <Button type="primary" style="padding: 5px 13px;margin-right:14px;" shape="circle" icon="md-add" @click="showProductDialogState=true">添加商品</Button>
    <span class="table-operation" @click="batchDelete">批量删除商品</span>
    <FormItem prop="currentList" :rules="listRule"></FormItem>
  </Form>
  <ProductDialog
    v-model="showProductDialogState"
    confirmCheck
    :productIds="[]"
    @onGetProductInfo="onGetProductInfo"
  ></ProductDialog>
  <settingStockModal 
    v-model="isShowSettingStockModal" 
    :productIds="productIds"
    :currentList="currentList"
    @newGiveStock="getNewGiveStock"
  ></settingStockModal>
</div>
</template>
<script>
const productStatus = {
  "1": "在售",
  "0": "已下架",
  "-1": "已售罄",
  "-9": "已删除"
}
import settingStockModal from "./setting-stock-modal.vue";
import addMore from "COMPONENTS/button/add-more.vue";
import ProductDialog from "@/views/shop/store/design/components/product-list.vue";
export default {
  components:{
    ProductDialog,
    settingStockModal,
      addMore
  },
  props:{
    give_stock_list: {
      type: Object
    },
    give_stock_new: {
      type: Array
    },
    give_stock_delete: {
      type: Array
    }
  },
  data() {
    const listValidate = (rule, value, callback) => {
      if(!this.give_stock_new.length
      && (!this.give_stock_list[1] || !this.give_stock_list[1].filter(item => item.status == 1).length)
      && (!this.give_stock_list[2] || !this.give_stock_list[2].filter(item => item.status == 1).length)
      && (!this.give_stock_list[3] || !this.give_stock_list[3].filter(item => item.status == 1).length)) {
        return callback("请至少添加一个有效商品")
      } else {
        return callback()
      }
    }
    return {
      batchValue: null,
      currentLevel: "1",
      validateAllLevel: false,
      showProductDialogState:false,
      isShowSettingStockModal:false,
      productIds: [],//用户选择准备添加的商品id
      selectedProducts: [],//用户选择准备批量删除的商品
      formData: {currentList: []},
      listRule: [{validator: listValidate}],
      columns: [
        {
          type: 'selection',
          width: 40
        },
        {
          key:"productInfo",
          title:"商品信息",
          width: 448,
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
              class:"product-name"
            }, p.row.product_name)
            let spec = p.row.sku_name && p.row.sku_name.length ? h('div',{
              style: {
                "color": "#9EA7B4"
              }
            }, this.yzArrayToString(p.row.sku_name)) : undefined
            let info = h('div',{
              style: {
                "margin": "0 14px",
                "line-height": "normal"
              }
            },[name, spec])
            let tag = (p.row.status != 1 && p.row.status != undefined) ? h('div',{
              class:"tag",
              style: {
                "flex-shrink":0,
              }
            },productStatus[p.row.status]) :undefined
            return h('div',{
              style: {
                "display":"flex",
                "align-items":"center"
              }
            },[img, info, tag])
          }
        },
        {
          key: "stockNum",
          title: "赠送库存量",
          width: 128,
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
                  "width": "100px",
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
                    this.batchValue = value
                    this.currentList.forEach(item => {
                      this.$set(item, "stock_num", value)
                    })
                  }
                }
              })
            ])
          },
          render: (h, p) => {
            return h("div",[
              h("FormItem", {
                props:{
                  prop:`currentList.${p.index}.stock_num`,
                  rules:[{
                    required:true,
                    type: "number",
                    trigger:"blur",
                    message:" "
                  }]
                }
              },[
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
                    placeholder:"请输入库存"
                  },
                  on: {
                    "on-change": (value) => {
                      this.currentList[p.index].stock_num = value;
                    }
                  }
                })
              ])
            ])
          }
        },
        {
          key: "action",
          title: "操作",
          width: 94,
          align: "center",
          render: (h, p) => {
            return h("span",{
              class: "table-operation",
              on: {
                click: () => {
                  this.deleteProduct(p.row.sku_id || p.row.product_sku_id, p.row.isNew);
                }
              }
            },"删除")
          }
        }
      ]
    }
  },
  computed: {
    currentList() {
      let newList = this.give_stock_new.filter(item => item.cloudstock_level == this.currentLevel);
      let oldList = this.give_stock_list[this.currentLevel] ? this.give_stock_list[this.currentLevel] : [];
      this.formData.currentList = [...newList, ...oldList]
      this.selectedProducts = []
      return this.formData.currentList
    }
  },
  mounted() {
    const validate = this.$refs.tableForm.validate;
    this.$refs.tableForm.validate = (callback) => {
      if(this.validateAllLevel) {
        let level = this.currentLevel;
        for(var i = 1; i <=3; i++) {
          this.currentLevel = i + ''
          for(var j = 0; j < this.currentList.length; j++) {
            if(!this.currentList[j].stock_num) {
              return this.$nextTick(() => {
                validate.call(this.$refs.tableForm, callback)
              })
            }
          }
        }
        this.currentLevel = level;
        return this.$nextTick(() => {
          validate.call(this.$refs.tableForm, callback)
        })
      } else {
        validate.call(this.$refs.tableForm, callback)
      }
    }
  },
  methods:{
    formatURL(url) {
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url
    },
    selectionChange(selection) {
      this.selectedProducts = selection
    },
    validateCurrentLevel() {
      setTimeout(() => {
        this.validateAllLevel = false
        this.$refs.tableForm.validate(() => {})
      }, 50)
    },
    batchDelete() {
      if(this.selectedProducts.length) {
        this.$Modal.confirm({
          title: "提示",
          content: "是否确定批量删除所选商品？",
          onOk: () => {
            this.selectedProducts.forEach(product => {
              this.deleteProduct(product.sku_id || product.product_sku_id, product.isNew, true)
            })
            this.$Message.success("删除成功")
          }
        })
      } else {
        this.$Message.error("请选择要批量删除的商品")
      }
    },
    deleteProduct(sku_id, isNew, batchMode){
      let index = null;
      if(isNew){
        index = this.give_stock_new.findIndex(item => {return item.product_sku_id == sku_id});
        this.give_stock_new.splice(index, 1);
      } else {
        index = this.give_stock_list[this.currentLevel].findIndex(item => {return item.sku_id == sku_id});
        this.give_stock_delete.push(this.give_stock_list[this.currentLevel][index]);
        this.give_stock_list[this.currentLevel].splice(index, 1);
      }
      if(!batchMode) {
        this.$Message.success("删除成功")
      }
      this.validateCurrentLevel()
    },
    onGetProductInfo(products) {
      this.productIds = products.map(item => item.id);
      this.isShowSettingStockModal = true
    },
    onAddMoreClick(){
        this.showProductDialogState=true;
    },
    getNewGiveStock(newProducts){
      this.validateCurrentLevel()
      newProducts.filter(item => item.stock_num).forEach(item => {
        let target1 = this.give_stock_new.find(subItem => {//新的sku_id
          return subItem.product_sku_id == item.product_sku_id 
          && subItem.cloudstock_level == item.cloudstock_level
        })
        let target2 = this.give_stock_list[this.currentLevel].find(subItem => {//旧的sku_id
          return subItem.sku_id == item.product_sku_id 
          && subItem.cloudstock_level == item.cloudstock_level
        })
        let target3 = this.give_stock_delete.find(subItem => {//删除的sku_id
          return subItem.sku_id == item.product_sku_id 
          && subItem.cloudstock_level == item.cloudstock_level
        })
        if(target1) {
          target1.stock_num = item.stock_num;
        } else if(target2){
          target2.stock_num = item.stock_num;
        } else if(target3) {
          let index = this.give_stock_delete.indexOf(target3);
          this.give_stock_delete.splice(index, 1);
          target3.stock_num = item.stock_num;
          this.give_stock_list[this.currentLevel].unshift(target3);
        } else {
          item.isNew = true;
          this.give_stock_new.unshift(item);
        }
      });
    }
  }
}
</script>
<style lang="less" scoped>
  .present-table-container {
    /deep/.ivu-tabs-card {
      width: 712px;
    }
    /deep/.ivu-tabs-bar{
      padding-left: 0 !important;
      .ivu-tabs-tab{
        font-size: 12px;
        padding: 6px 16px;
      }
    }
    /deep/.ivu-btn{
      padding:5px 10px 5px;
    }
    /deep/.ivu-table-wrapper{
      margin-top: 20px;
      margin-bottom: 20px;
      .ivu-table{
        .tag{
          width: 53px;
          text-align: center;
          border: 1px solid #ffb59a;
          border-radius: 3px;
          display: inline-block;
          height: 20px;
          line-height: 20px;
          color: #f45526;
          background: #ffefe7;
        }
        .ivu-input-number-handler-wrap {
          display: none;
        }
        input {
          text-align: center;
        }
        td{
          font-size:12px;
        }
        .ivu-table-row {
          height:70px;
        }
      }
    }

    /deep/.ivu-btn.ivu-btn-primary {
      span {
        margin-left: 2px !important;
      }
    }
    
    /deep/.ivu-tabs-tab-active {
      font-weight: bold;
      color: #2C3E50 !important;
      font-size: 12px;
    }
    
  }
</style>