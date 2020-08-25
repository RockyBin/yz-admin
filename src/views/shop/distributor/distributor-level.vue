<template>
  <div class="distributor-level">
    <Button
      type="primary"
      style="height: 34px;border-radius: 17px;"
      class="btn-add"
      @click="onAddDistributor"
      icon="md-add"
      perm="distributor.level.operate"
    >新增分销商等级</Button>
    <common-table :minWidth="1156" :columnsData="levelTableColumn" :listData="levelData"></common-table>
    <Modal
      :title="title"
      :width="430"
      v-model="isShowModal"
      class="distributor-level-tip"
      :ok-text="text"
      @on-ok="onChangeStatus"
    >
      <p style="font-size: 13px;line-height: 24px;" v-html="textContainer"></p>
    </Modal>
    <Modal
      title="转移分销商"
      v-model="isTransferDistributor"
      ok-text="确定转移"
      :width="390"
      :loading="transferLoading"
      @on-ok="onChangeDistributor"
      class="distributor-level-transfer"
    >
      <div class="distributor-level-transfer-info">
        <div>
          <label>当前等级：</label>
          <label>{{acceptData.name}}</label>
        </div>
        <div>
          <label>拥有分销商：</label>
          <label>{{acceptData.member_count}} 人</label>
        </div>
      </div>
      <div class="ivu-form-item-required" :class="{'ivu-form-item-error': transferErrorTip}" style="position: relative;">
        <label style="margin-right: 6px;" class="ivu-form-item-label">目标等级：</label>
        <Select v-model="acceptData.weight" style="width:160px" @on-change="transferErrorTip = false" transfer>
          <template v-for="(item, index) in levelData">
            <Option
              :value="item.id"
              :key="index"
              :disabled="item.id === acceptData.id || !item.status"
            >{{item.name}}</Option>
          </template>
        </Select>
        <div class="ivu-form-item-error-tip" v-if="transferErrorTip" style="left: 78px;">请选择目标等级</div>
      </div>
    </Modal>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import distributorLogic from "@/views/shop/components/logic/logic-or-and.vue";
let modalTypeTransfer = "转移";
let modalTypeEdit = "修改";
export default {
  data() {
    return {
      isShowModal: false, // 小弹窗提示
      isTransferDistributor: false, // 弹窗提示
      transferLoading: true,
      transferErrorTip: false,
      // 小弹窗内容
      title: "",
      text: "",
      textContainer: "",
      // 弹窗修改数据
      acceptData: {},
      distributorList: [], // 等级列表
      // 表格参数
      levelTableColumn: [
        {
          title: "等级权重",
          minWidth: 80,
          key: "weight",
          align: "center"
        },
        {
          title: "分销商等级名称",
          minWidth: 150,
          render: (h, params) => {
            return h("div", [
              params.row.name,
              Number(params.row.weight) === 0
                ? h(
                    "span",
                    {
                      class: "table-warning",
                      style: "margin-left: 8px;"
                    },
                    "默认"
                  )
                : ""
            ]);
          }
        },
        {
          title: "一级佣金比例",
          minWidth: 130,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.commission && params.row.commission["1"] + "%"
            );
          }
        },
        {
          title: "二级佣金比例",
          minWidth: 130,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.commission && params.row.commission["2"] + "%"
            );
          }
        },
        {
          title: "三级佣金比例",
          minWidth: 130,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.commission && params.row.commission["3"] + "%"
            );
          }
        },
        {
          title: "升级条件",
          minWidth: 290,
          key: "upgrade_value",
          render: (h, params) => {
              return h(
                "span",
                params.row.condition.upgrade && params.row.condition.upgrade.length
                  ? [h("Tooltip", {
                    props: {
                      content: params.row.conditionText.or.join("\x20\x20或\x20\x20") + (params.row.conditionText.or.length && params.row.conditionText.and.length ? "\x20\x20与\x20\x20" : "") + params.row.conditionText.and.join("\x20\x20与\x20\x20"),
                      transfer: true
                    }
                  }, [
                    h(distributorLogic, {
                      style: {
                        overflow: "hidden",
                        "text-overflow": "ellipsis",
                        display: "-webkit-box",
                        "-webkit-line-clamp": 3,
                        "-webkit-box-orient": "vertical"
                      },
                      props: {
                        logic: params.row.conditionText
                      }
                    })
                  ])]
                  : "不自动升级"
              );
          }
        },
        {
          title: "状态",
          minWidth: 86,
          key: "status",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-success": Number(params.row.status) === 1,
                  "table-error": Number(params.row.status) === 0
                }
              },
              Number(params.row.status) === 1 ? "启用" : "禁用"
            );
          }
        },
        {
          title: "操作",
          width: 160,
          key: "operation",
          render: (h, params) => {
            let btn = h(
              "span",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                attrs: {
                  perm: "distributor.level.operate"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    if (params.row.status === 0) {
                      if (
                        this.levelData.filter(
                          item =>
                            item.status && item.weight === params.row.weight
                        ).length
                      ) {
                        this.$Modal.error({
                          title: "启用失败",
                          content: "当前权重已被使用，请重新设置权重。"
                        });
                      } else {
                        this.$httpGet(
                          "/shop/admin/distribution/level/enable",
                          { id: params.row.id },
                          res => {
                            if (res.code === 200) {
                              this.$Message.success("成功设置");
                              this.$set(
                                this.levelData[params.index],
                                "status",
                                1
                              );
                            } else {
                              this.$Modal.error({
                                title: "启用失败",
                                content: res.msg
                              });
                            }
                          }
                        );
                      }
                    } else {
                      if (params.row.member_count < 1) {
                        this.$Modal.confirm({
                          title: "提示",
                          content: "当前分销商等级下还没有任何分销商，是否确定禁用【" +params.row.name +"】等级？",
                          loading: true,
                          onOk: () => {
                            this.$httpGet(
                              "/shop/admin/distribution/level/disable",
                              { id: params.row.id },
                              res => {
                                this.$Modal.remove();
                                if (res.code === 200) {
                                  this.$Message.success("成功设置");
                                  this.$set(
                                    this.levelData[params.index],
                                    "status",
                                    0
                                  );
                                } else {
                                  this.$Modal.error({
                                    title: "禁用失败",
                                    content: res.msg
                                  });
                                }
                              }
                            );
                          }
                        });
                      } else {
                        this.isShowModal = true;
                        this.text = "前往" + modalTypeTransfer;
                        this.title = "注意";
                        this.acceptData = {
                          id: params.row.id,
                          name: params.row.name,
                          weight: null,
                          member_count: params.row.member_count,
                          status: params.row.status,
                          index: params.index
                        };
                        this.textContainer =
                          "当前分销商等级【" +params.row.name +"】，拥有了【" +"<span style='color:#ED4014;'>"+params.row.member_count+"</span>" +
                          "】个分销商。如继续进行禁用操作，需先将这些分销商转移到其他等级。";
                      }
                    }
                  }
                }
              },
              Number(params.row.status) === 1 ? "禁用" : "启用"
            );
            let line = h(
              "span",
              {
                class: {
                  "table-operation": true
                },
                style: {
                  marginLeft: "10px",
                  marginRight: "10px"
                }
              },
              "|"
            );
            let edit = h(
              "span",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                attrs: {
                  perm: "distributor.level.operate"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    if (params.row.status === 0) {
                      this.$router.push({
                        path: "/distributor/level/edit",
                        query: { id: params.row.id }
                      });
                      return
                    }
                    this.isShowModal = true;
                    this.text = "前往" + modalTypeEdit;
                    this.title = modalTypeEdit;
                    this.acceptData.id = params.row.id;
                    this.textContainer =
                      "修改分销商等级。修改权重、名称、佣金比例都会影响新旧用户。修改升级条件，仅影响新用户。则新用户升级到当前等级需按照新升级条件进行。";
                    this.changeId = params.row.id;
                  }
                }
              },
              "修改"
            );
            let del = h(
              "span",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                attrs: {
                  perm: "distributor.level.operate"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: "提示",
                      content: "是否确定删除该分销商等级？",
                      loading: true,
                      onOk: () => {
                        this.$httpGet(
                          "/shop/admin/distribution/level/delete",
                          { id: params.row.id },
                          res => {
                            this.$Modal.remove();
                            if (res.code === 200) {
                              this.$Message.success("删除成功");
                              this.levelData.splice(params.index, 1);
                            } else {
                              this.$Message.success("删除失败");
                            }
                          }
                        );
                      }
                    });
                  }
                }
              },
              "删除"
            );
            return h(
              "div",
              Number(params.row.weight) === 0 ? [edit] : Number(params.row.status) === 1 ? [btn, line, edit] : [btn, line, edit, line, del]
            );
          }
        }
      ],
      levelData: []
    };
  },
  mounted() {
    this.getDistributorList();
  },
  methods: {
    /**
     * 获取分销商列表
     */
    getDistributorList() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/distribution/level/list", null, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          this.levelData = res.data || [];
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 跳转到添加分销商等级
     */
    onAddDistributor() {
      this.$router.push({
        path: "/distributor/level/detail"
      });
    },
    // 转移分销商
    onChangeDistributor() {
      this.transferErrorTip = false;
      if (!this.acceptData.weight) {
        this.transferErrorTip = true;
        this.transferLoading = false;
        this.$nextTick(() => {
          this.transferLoading = true;
        });
        return;
      }
      this.$httpGet(
        "/shop/admin/distribution/level/trans",
        {
          id: this.acceptData.id,
          new_level_id: this.acceptData.weight
        },
        res => {
          if (res.code === 200) {
            this.$Message.success("转移成功");
            this.getDistributorList();
            this.isTransferDistributor = false;
          } else {
            this.$Message.success(res.msg);
            this.transferLoading = false;
            this.$nextTick(() => {
              this.transferLoading = true;
            });
          }
        }
      );
    },
    // 弹窗提示是否继续
    onChangeStatus() {
      // 如果是修改
      if (new RegExp(modalTypeEdit).test(this.title)) {
        this.$router.push({
          path: "/distributor/level/edit",
          query: { id: this.acceptData.id }
        });
        // 如果是转移
      } else {
        this.isShowModal = false;
        this.isTransferDistributor = true;
        this.transferErrorTip = false;
      }
    }
  },
  components: {
    commonTable
  }
};
</script>
<style lang="less" scoped>
.distributor-level {
  padding: 24px !important;
  height: 100%;
  overflow: auto;
  /deep/.ivu-table-wrapper {
    .ivu-table-cell {
      padding: 0;
    }
  }
}
// 提示弹窗
.distributor-level-tip {
  /deep/.ivu-modal-body {
    padding: 24px;
  }
  /deep/.ivu-modal-footer {
    button {
      padding-top: 0;
      padding-bottom: 0;
      height: 34px;
      span {
        display: block;
        line-height: 32px;
      }
    }
  }
}

// 转移弹窗
.distributor-level-transfer {
  /deep/.ivu-modal-body {
    padding: 24px;
    .distributor-level-transfer-info {
      height: 96px;
      border-radius: 5px;
      background-color: #f8f9fd;
      box-sizing: border-box;
      padding: 22px 15px;
      margin-bottom: 24px;
      & > div:first-child {
        margin-bottom: 13px;
      }
      label:first-child {
        width: 80px;
        text-align: right;
        display: inline-block;
        margin-right: 5px;
      }
    }
  }
}
</style>
