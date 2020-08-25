<template>
  <div class="list">
    <Modal
      class="list-modal"
      v-model="modalStatus"
      :width="700"
      :styles="{top: '50px'}"
      title="选择优惠券"
      @on-cancel="onCancelClick"
      @on-ok="onComfrimClick"
    >
      <div class="mglr">
        <i-input
          v-model="keyword"
          style="margin-bottom: 16px;margin-top: 26px;"
          placeholder="请输入优惠券标题"
        >
          <Select v-model="couponType" slot="prepend" style="width: 100px" placeholder="优惠券类型">
            <Option value>全部</Option>
            <Option value="0">现金券</Option>
            <Option value="1">折扣券</Option>
          </Select>
          <Button slot="append" icon="ios-search" style="width: 42px;" @click="onSearchClick"></Button>
        </i-input>
      </div>
      <div class="list-table">
        <common-table
          style="width: 100%;"
          v-if="value"
          :columnsData="columnsData"
          :listData="listData"
          :loading="tableLoading"
          :hasBorder="true"
          :height="355"
        ></common-table>
      </div>
      <div class="mglr">
        <Page
          style="text-align: right;margin-top: 20px;"
          :total="total"
          size="small"
          :page-size="20"
          :current="currentPage"
          @on-change="onPageChange"
          show-elevator
        />
      </div>
      <div
        v-show="selectedCoupons.length + this.couponIds.length > 0"
        class="list-show-select mglr"
      >已选择 {{selectedCoupons.length + this.couponIds.length}} 张</div>
    </Modal>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import jQuery from "jquery";
export default {
  components: {
    commonTable
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    couponIds: {
      type: Array
    }
  },
  data() {
    return {
      selectedCoupons: [],
      selectedCouponsCancel: [], // 记录没有使用的已选上数据，下次打开窗口要使用
      hasSelectedAll: false,
      modalStatus: false,
      currentPage: 1,
      total: 0,
      tableLoading: false,
      couponType: "",
      keyword: "",
      columnsData: [
        {
          title: "操作",
          align: "center",
          width: 30,
          renderHeader: h => {
            let checkBoxOption = {
              on: {
                "on-change": value => {
                  if (!value) {
                    jQuery(".cb-item .ivu-checkbox-input:checked").click();
                  } else {
                    jQuery(
                      ".cb-item .ivu-checkbox-input:not(:checked)"
                    ).click();
                  }
                }
              },
              props: { value: this.hasSelectedAll }
            };
            return h("div", {}, [h("Checkbox", checkBoxOption, "")]);
          },
          render: (h, params) => {
            let checkBoxOption = {
              on: {
                "on-change": value => {
                  if (!value) {
                    this.hasSelectedAll = false;
                    this.selectedCoupons = this.selectedCoupons.filter(
                      item => item.id !== params.row.id
                    );
                  } else {
                    // 不能超过10个优惠券
                    if (
                      this.selectedCoupons.length + this.couponIds.length >=
                      10
                    ) {
                      checkItem.child.currentValue = false;
                      checkItem.child.value = false;
                      this.$Message.error("最多可添加10张优惠券");
                    } else {
                      this.selectedCoupons.push(params.row);
                    }
                  }
                }
              },
              props: {
                value: this.couponIds.indexOf(params.row.id) > -1||this.selectedCoupons.findIndex((item)=>{return params.row.id==item.id})>-1,
                disabled: this.couponIds.indexOf(params.row.id) > -1
              },
              class: "cb-item"
            };
            let checkItem = h("Checkbox", checkBoxOption, "");
            return h("div", {}, [checkItem]);
          }
        },
        {
          title: "标题",
          render: (h, params) => {
            return h("div", {}, [
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    // width: "114px",
                    verticalAlign: "middle",
                    textAlign: "left"
                  }
                },
                params.row.title
              )
            ]);
          }
        },
        {
          title: "类型",
          width: 80,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.coupon_type == 0 ? "现金券" : "折扣券"
            );
          }
        },
        {
          title: "可领取数",
          width: 90,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.can_received == -1 ? "无限" : params.row.can_received
            );
          }
        },
        {
          title: "有效期",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h("div", {}, params.row.effective_time);
          }
        }
      ],
      listData: [],
      couponInfo: null
    };
  },
  watch: {
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
      }
      // 当弹窗显示时，清空已经被删除的选项
      if (val) {
        this.hasSelectedAll=false;
        this.selectedCoupons = this.selectedCouponsCancel;
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    }
  },
  mounted() {
    this.getCouponList();
  },
  methods: {
    /**
     * 取消的时候还原数据
     */
    onCancelClick() {
      this.selectedCouponsCancel = this.selectedCoupons;
    },
    /**
     * 提交到上级组件
     */
    onComfrimClick() {
      this.selectedCouponsCancel = [];
      this.$emit("onGetCouponInfo", this.selectedCoupons);
    },
    /**
     * 获取产品列表
     */
    getCouponList() {
      this.tableLoading = true;
      let data = {
        page: this.currentPage,
        title: this.keyword,
        coupon_type: this.couponType,
        status: 1,
        valid: 1
      };
      this.$httpGet("/shop/admin/coupon/list", data, res => {
        this.tableLoading = false;
        this.currentPage = Number(res.data.current);
        this.total = res.data.total;
        this.listData = res.data.list || [];
      });
    },
    /**
     * 分页切换
     */
    onPageChange(index) {
      this.currentPage = index;
      this.getCouponList();
    },
    /**
     * 开始搜索
     */
    onSearchClick() {
      this.currentPage = 1;
      this.getCouponList();
    }
  }
};
</script>
<style lang="less" scoped>
.list-modal {
  /deep/.ivu-modal-content {
    height: 600px;
  }
  /deep/.ivu-modal-wrap {
    .ivu-modal-body {
      .ivu-select-placeholder {
        color: #464c5b;
      }
      padding: 0;
      height: calc(100% - 95px);
      box-sizing: border-box;
      overflow: hidden;
      .list-show-select {
        position: absolute;
        bottom: 21px;
      }
      .ivu-table-tip table {
        min-height: 278px;
      }
      .mglr {
        margin-left: 30px;
        margin-right: 30px;
      }
      table {
        .ivu-table-row {
          button {
            span {
              display: block;
            }
          }
        }
      }
    }
  }
  .list-table {
    height: 355px;
    padding: 0 20px 0 30px;
    overflow-y: auto;
    margin-right: 5px;
    /deep/.ivu-table-body tr:nth-child(2n) td{
      background:#fff;
    }
    /deep/.ivu-table-body tr:hover td{
      background:#fcfcfd;
    }
  }
}
</style>
