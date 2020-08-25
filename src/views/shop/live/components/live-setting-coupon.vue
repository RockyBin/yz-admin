<template>
  <div class="live-setting-products">
    <div class="container-nobtn">
      <div class="member">
        <div style="position: relative;">
          <add-more
              :text="'选择优惠券'"
              @onAddMoreClick="onAddMoreClick"
              perm="live.operate"
          ></add-more>
          <span
              style="color: #666;font-size: 12px;margin-left: 14px;position: absolute;margin-top: 8px;"
          >(最多选择50张优惠券)</span
          >
        </div>
        <div class="wrapper">
          <Table
            width="741"
            border
            :columns="deliveryColumns"
            :data="listData"
            align="center"
            class="delivery-table"
          ></Table>
        </div>
      </div>
    </div>
    <modal-select-list
      v-model="modalProductSelect"
      :selectInfo="selectInfo"
      text="选择优惠券"
      :cloud="true"
      @onGetProductInfo="onGetProductInfo"
    ></modal-select-list>
  </div>
</template>

<script>
import addMore from "COMPONENTS/button/add-more.vue";
import modalSelectList from "COMPONENTS/modal/modal-coupon-select";
export default {
  components: { addMore, modalSelectList },
  props: {
    value: {
      required: true,
      type: Array
    },
    coupon_list: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      page: 1,
      loading: false,
      modalProductSelect: false, // 新增运费模板
      deliveryList: [],
      selectInfo: [],
      isChecked: [],
      listData: [],
      deliveryColumns: [
        {
          title: "优惠券标题",
          align: "left",
          width: 200,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  "align-items": "center"
                }
              },
              [
                h(
                  "div",
                  {
                  },
                  params.row.title
                ),
                params.row.status == 2 || params.row.status == 0
                  ? h(
                      "div",
                      {
                        class: "table-error",
                        style:{"margin-left":"8px"}
                      },
                      "已失效"
                    )
                  : ""
              ]
            );
          }
        },
        {
          title: "门槛/面值/类型",
          align: "center",
          width: 150,
          render: (h, params) => {
            var arr = [];
            if (params.row.doorsill_type == 1) {
              arr.push(`满${params.row.doorsill_full_money}元可用`);
            } else {
              arr.push("无门槛使用");
            }
            if (params.row.coupon_type == 1) {
              arr.push(`${parseFloat(params.row.coupon_money)}折`);
            } else {
              arr.push(`${params.row.coupon_money}元`);
            }
            if (params.row.coupon_type == 1) {
              arr.push("折扣券");
            } else {
              arr.push("现金券");
            }
            return h("span", [arr[0], h("br"), arr[1], h("br"), arr[2]]);
          }
        },
        {
          title: "可用商品",
          align: "center",
          width: 150,
          render: (h, params) => {
            if (!params.row.product_type) {
              return h("div", params.row.product_info?params.row.product_info:'--');
            } else {
              return h(
                "div",
                ((render, params) => {
                  const rows = [];
                  rows.push(
                    h(
                      "Tooltip",
                      {
                        props: {
                          content: params.row.product_info,
                          placement: "top-start",
                          "max-width": 400,
                          disabled: params.row.product_info === "全场商品"
                        }
                      },
                      [
                        h(
                          "div",
                          { class: "table-area-shape" },
                          params.row.product_info?params.row.product_info:'--'
                        )
                      ]
                    )
                  );
                  return rows;
                })(h, params)
              );
            }
          }
        },
        {
          title: "可领取",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "span",
              params.row.can_received === -1 ? "无限" : params.row.can_received
            );
          }
        },
        {
          title: "操作",
          align: "center",
          width: 140,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  class: {
                    "table-operation": true
                  },
                  style: {
                    cursor: "pointer"
                  },
                  attrs: {
                    perm: "coupon.view"
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: "marketingManageEdit",
                        query: {
                          id: params.row.id
                        }
                      });
                    }
                  }
                },
                "查看详情"
              ),
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  style: {
                    marginLeft: "10px"
                  }
                },
                "|"
              ),
              h(
                "span",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  class: {
                    "primary-font-color": true
                  },
                  style: {
                    cursor: "pointer",
                    marginLeft: "10px"
                  },
                  attrs: {
                    perm: "live.operate"
                  },
                  on: {
                    click: () => {
                      this.listData.splice(params.index, 1);
                      this.selectInfo = this.listData.map(item => item.id);
                      this.coupon_list.some((item, i) => {
                        if (item.coupon_id == params.row.id) {
                          this.coupon_list.splice(i, 1);
                          //在数组的some方法中，如果return true，就会立即终止这个数组的后续循环
                          return true;
                        }
                      });
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      // 分页
      total: 0,
      current: 0,
      size: 0
    };
  },
  watch: {
    value(val) {
      if (val) {
        if (!this.listData.length) {
          val.forEach(item => {
            this.listData.push(item.coupon);
          });
          this.selectInfo = this.listData.map(item => item.id);
        }
      }
    }
  },
  methods: {
    checkInsertNum(value, index, key) {
      const reg = /^\d+(\.\d{1,2})?$/;
      if (!reg.test(value)) {
        this.$set(this.delivery_area[index], key, true);
        return false;
      } else {
        this.$set(this.delivery_area[index], key, false);
      }
    },
    onPageSizeChange(num) {
      this.onRefushList(this.page, num);
    },
    removeListData(id, index) {
      this.$httpGet("/shop/admin/freighttemplate/delete", { id }, res => {
        if (res.code) {
          this.deliveryList.splice(index, 1);
          if (this.deliveryList.length === 1 && this.page > 1) {
            this.page - 1;
          }
          this.$Message.success("删除成功");
          this.onRefushList(this.page);
          this.$Modal.remove();
          this.$Message.success("删除成功");
        } else {
          this.$Message.error(res.msg);
          this.$Modal.remove();
        }
      });
    },
    onChangePage(page) {
      this.page = page;
      this.onRefushList(page);
    },
    // 因为是特殊列表必须刷新
    onRefushList(page = 1, page_size = 10) {
      this.$httpGet(
        "/shop/admin/freighttemplate/list",
        { page, page_size },
        res => {
          // 成功
          if (res.msg === this.$store.state.SUCCESS) {
            this.deliveryList = [];
            this.$nextTick(() => {
              this.deliveryList = res.data.list;
              this.total = res.data.total;
              this.current = res.data.current;
              this.size = res.data.page_size;
            });
          }
        }
      );
    },
    // 提交保存的方法
    /* 显示modal框 */
    onAddMoreClick() {
      if (this.listData.length >= 50) {
        this.$Message.error("最多选择50张优惠券");
        return;
      }
      this.modalProductSelect = true;
    },
    //获取选择的商品
    onGetProductInfo(val) {
      let serlecProduct = this.listData.length + val.length;
      if (serlecProduct > 50) {
        this.$Message.error("最多选择50张优惠券");
        return;
      }
      this.modalProductSelect = false;
      if (val) {
        if (this.listData.length) {
          this.listData = val.concat(this.listData);
        } else {
          this.listData = val;
        }
        this.selectInfo = this.listData.map(item => item.id);
        val.filter(item => {
          this.coupon_list.unshift({
            coupon_id: item.id
          });
        });
      }
    },
    /* 取消 */
    cancel() {
      this.showModal = false;
    }
  }
};
</script>

<style lang="less" scoped>
@border-line: #e8eaec;

.live-setting-products {
  position: absolute;
  width: 100%;
  height: 100%;
  padding-bottom: 74px;
  background: #f2f4fd;
  display: flex;
  .container-nobtn {
    flex: 1;
    // width: 100%;
  }
}
.code-row-bg {
  /deep/.ivu-col-span-24 {
    text-align: right;
    margin: 20px 0;
  }
}

/deep/.ivu-table-wrapper {
  overflow: initial !important;
}

.modal-wrap {
  /deep/.ivu-modal-body {
    height: 450px;
  }
  /deep/.ivu-modal-body {
    height: 450px;
    overflow: auto;
    overflow-x: hidden;
  }
  /deep/.ivu-btn-loading {
    span {
      display: inline;
    }
  }
  /deep/.ivu-input-suffix {
    width: 40px;
    line-height: 32px;
  }
  /deep/.ivu-input-with-suffix {
    padding-right: 40px;
  }
  /deep/th:not(:first-child) {
    .ivu-table-cell:before {
      content: "*";
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      font-family: SimSun;
      font-size: 13px;
      color: #ed4014;
      font-weight: normal;
    }
  }
}
/deep/.ivu-table-cell {
  font-size: 12px;
  padding: 10px 14px;
}
.delivery-table {
  /deep/table {
    table-layout: auto;
    width: 100% !important;
    th {
      background: #f8f9fd;
    }
    td {
      color: #657180;
    }
  }
  /deep/.ivu-tooltip {
    .ivu-tooltip-rel {
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      overflow: hidden;
      -webkit-box-orient: vertical;
      width: 100%;
    }
    .ivu-tooltip-inner {
      white-space: pre-wrap;
    }
  }
  /deep/.ivu-tooltip {
    padding: 0 14px;
  }
  /deep/.ivu-tooltip:last-child {
    border-bottom: none;
  }
  /*/deep/.table-area-shape {*/
  /*text-overflow: ellipsis;*/
  /*display: -webkit-box;*/
  /*-webkit-box-orient: vertical;*/
  /*-webkit-line-clamp: 1;*/
  /*overflow: hidden;*/
  /*}*/
  /deep/.table-area-shape:last-child {
    border-bottom: 0;
  }
  /deep/.full-height {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  /deep/.flex-box {
    height: 100%;
    width: 100%;
    height: 48px;
    line-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid @border-line;
  }
  /deep/.flex-box:last-child {
    border-bottom: 0;
  }
}
.member {
  padding: 0 0 74px;
  background: white;
  height: 100%;
  overflow: auto;
  text-align: left;
  // .add-more-btn {
  //   margin-bottom: 24px;
  // }
  // .wrapper {
  //   min-height: calc(100vh - 240px);
  // }
}
.footer {
  position: fixed;
  bottom: 10px;
  height: 50px;
  line-height: 50px;
  width: 100%;
  background-color: #fff;
  text-align: center;
  border-top: 1px solid #eee;
  button {
    width: 70px;
    height: 32px;
  }
}
</style>
