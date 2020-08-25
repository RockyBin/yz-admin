<template>
  <div class="common-tabs">
    <Tabs :animated="false" v-model="tabSelect">
      <TabPane label="基础设置">
        <create-base ref="createBase" :info="dataInfo"></create-base>
      </TabPane>
      <TabPane label="活动商品">
        <create-product ref="createProduct" :info="dataInfo"></create-product>
      </TabPane>
    </Tabs>
    <foot-button
      perm="group.buying.operate"
      @onSaveClick="onSaveClick"
      :loading="loadingStatus"
    ></foot-button>
  </div>
</template>
<script>
import createBase from "./components/marketing-groupbuying-create-base";
import createProduct from "./components/marketing-groupbuying-create-product";
import footButton from "@/views/shop/components/button/foot-button.vue";
export default {
  components: {
    createBase,
    createProduct,
    footButton
  },
  data() {
    return {
      tabSelect: 0,
      loadingStatus: false,
      dataInfo: {
        base_info: {
          id: this.$route.query.id || 0,
          type: 0,
          title: "",
          people_num: null,
          close_day: 1,
          close_hour: 0,
          close_minute: 0,
          open_order_base_num: 0,
          open_buy_limit:0,
          open_mock_group: 0,
          open_virtual_group: 1,
          open_coupon: 0,
          open_point: 0,
          open_distribution: 1,
          open_agent: 1,
		  open_area_agent: 1,
          open_head_discount: 0,
          open_inventory: 0,
          rule_info: "",
          start_time: null,
          end_time: null,
          created_at: null,
          updated_at: null,
          status: 0
        },
        product_list: []
      }
    };
  },
  created() {
    if (this.dataInfo.base_info.id) {
      this.getInfo();
    }
  },
  methods: {
    getInfo() {
      this.$store.state.COMMON_loading = true;
      this.$httpPost(
        "/shop/admin/group/buying/info",
        { id: this.dataInfo.base_info.id },
        res => {
          this.$store.state.COMMON_loading = false;
          if (res.code === 200) {
            res.data.product_list.forEach(n => {
              n.sku_list.forEach(n => {
                n._checked = true;
                n.group_price = n.group_price ? Number(n.group_price) : null;
                n.head_price = n.head_price ? Number(n.head_price) : null;
              });
              n.order_base_num = n.order_base_num?Number(n.order_base_num):null;
              n.buy_limit_num = n.buy_limit_num?Number(n.buy_limit_num):null;
              n.group_price = n.group_price ? Number(n.group_price) : null;
              n.head_price = n.head_price ? Number(n.head_price) : null;
            });
            this.dataInfo = res.data;
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    onSaveClick() {
      let tabSelect = null;
      let status = true;
      this.$refs["createBase"].$refs["formValidate"].validate(valid => {
        status = valid;
        if (!valid) {
          tabSelect = 0;
        }
      });
      status = status && !this.$refs["createBase"].activityTimeErrorShow;
      status = status && this.$refs["createProduct"].checkData();
      if (!status && tabSelect === null) {
        tabSelect = 1;
      }
      if (tabSelect !== null) {
        this.tabSelect = tabSelect;
      }
      if (status) {
        this.saveData();
      } else {
        this.$Message.error("保存失败");
      }
    },
    // 日期转成字符串
    formatDateToString(time) {
      if (typeof time === "string") {
        time = new Date(time);
      }
      let date = new Date(time);
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? "0" + m : m;
      var d = date.getDate();
      d = d < 10 ? "0" + d : d;
      var h = date.getHours();
      h = h < 10 ? "0" + h : h;
      var minute = date.getMinutes();
      minute = minute < 10 ? "0" + minute : minute;
      var second = date.getSeconds();
      second = second < 10 ? "0" + second : second;
      return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
    },
    saveData() {
      this.loadingStatus = true;
      let base_info = this.dataInfo.base_info;
      let data = {
        base_info: Object.assign({}, base_info, {
          start_time: this.formatDateToString(base_info.start_time),
          end_time: this.formatDateToString(base_info.end_time)
        }),
        product_info: this.dataInfo.product_list.map(n => {
          let multi = parseInt(n.sku_code.replace(",", ""));
          let info = {
            master_product_id: n.master_product_id,
            order_base_num:n.order_base_num,
            buy_limit_num:n.buy_limit_num,
            skus: multi
              ? n.sku_list
              : [
                  Object.assign(n.sku_list ? n.sku_list[0] : {}, {
                    group_price: n.group_price,
                    head_price: n.head_price,
                    group_inventory: n.group_inventory,
                    sku_id: n.skus_id
                  })
                ]
          };
          if (n.id) {
            info.id = n.id;
          }
          return info;
        })
      };
      delete data.base_info.status;
      this.$httpPost("/shop/admin/group/buying/save", data, res => {
        this.loadingStatus = false;
        if (res.code === 200) {
          this.$Message.success("保存成功");
          this.$router.push({
            name: "marketingGroupbuyingList"
          });
        } else {
          this.$Message.error(res.msg);
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.common-tabs {
  /deep/.ivu-tabs-bar {
    padding-left: 24px;
    margin-bottom: 0;
  }
}
</style>
