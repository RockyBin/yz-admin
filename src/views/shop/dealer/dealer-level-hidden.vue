<template>
  <div class="dealer-level-hidden">
    <Button
      type="primary"
      shape="circle"
      icon="md-add"
      perm="dealer.level.operate"
      @click="addLevel"
      >新增等级</Button
    >
    <common-table
      :minWidth="1158"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="listData"
    ></common-table>
  </div>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import logicOrAnd from "@/views/shop/components/logic/logic-or-and.vue";
export default {
  components: {
    commonTable
  },
  data() {
    return {
      tableLoading: false,
      columnsData: [
        {
          title: "经销商等级名称",
          minWidth: 172,
          render: (h, params) => {
            return h("div", params.row.parent_name);
          }
        },
        {
          title: "权重",
          minWidth: 78,
          render: (h, params) => {
            return h("div", params.row.weight);
          }
        },
        {
          title: "隐藏等级名称",
          minWidth: 172,
          render: (h, params) => {
            return h("div", params.row.name);
          }
        },
        {
          title: "拿货云仓折扣",
          align: "center",
          minWidth: 130,
          render: (h, params) => {
            return h("span", parseFloat(params.row.discount) + "%")
          }
        },
        {
          title: "升级条件",
          minWidth: 232,
          renderHeader: (h, params) => {
            return h("div",[
              h("span", "升级条件"),
              h(moreMessage, {
                style: {
                  verticalAlign: "middle",
                  fontWeight: "normal",
                  marginLeft: "5px"
                },
                props: {
                  maxWidth: 350,
                  text: "没有设置升级条件则表示将没有会员可以自动升级到该等级。"
                }
              })
            ])
          },
          render: (h, params) => {
            return h("div", params.row.condition_text
              ? [h("Tooltip", {
                props: {
                  content: params.row.condition_text.or.join("\x20\x20或\x20\x20") + (params.row.condition_text.or.length && params.row.condition_text.and.length ? "\x20\x20与\x20\x20" : "") + params.row.condition_text.and.join("\x20\x20与\x20\x20"),
                  transfer: true
                }
              }, [
                h(logicOrAnd, {
                  style: {
                    overflow: "hidden",
                    "text-overflow": "ellipsis",
                    display: "-webkit-box",
                    "-webkit-line-clamp": 3,
                    "-webkit-box-orient": "vertical"
                  },
                  props: {
                    logic: params.row.condition_text
                  }
                })
              ])]
              : "无");
          }
        },
        {
          title: "等级人数",
          align: "center",
          minWidth: 102,
          render: (h, params) => {
            return h("div", params.row.dealers);
          }
        },
        {
          title: "状态",
          align: "center",
          minWidth: 92,
          render: (h, params) => {
            return h(
              "div",
              {
                class: params.row.status === 1 ? "table-success" : "table-error"
              },
              params.row.status === 1 ? "启用" : "禁用"
            );
          }
        },
        {
          title: "操作",
          width: 180,
          key: "operation",
          render: (h, params) => {
            let btn = h(
              "a",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                attrs: {
				  href: "javascript:void(0);",
                  perm: "dealer.level.operate"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: "提示",
                      content:
                        Number(params.row.status) === 1 ? `当前隐藏等级下还没有任何经销商，是否确定禁用【${params.row.name}】隐藏等级？` : `是否确定启用【${params.row.name}】隐藏等级？`,
                      loading: true,
                      onOk: () => {
                        this.changeLevelStatus(params, Number(params.row.status) === 1 ?  "disable" : "enable");
                      }
                    });
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
                  display: "inline-block",
                  verticalAlign: "text-top",
                  width: "1px",
                  height: "12px",
                  backgroundColor: "#3352D9",
                  marginLeft: "13px",
                  marginRight: "13px",
                  marginTop: "1px"
                }
              },
              ""
            );
            let edit = h(
              "a",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                attrs: {
				  href: "javascript:void(0);",
                  perm: "dealer.level.view"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    this.$router.push({
                      name: "dealerLevelHiddenEdit",
                      query: {
                        id: params.row.id
                      }
                    })
                  }
                }
              },
              "修改"
            );
            let del = h(
              "a",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                attrs: {
				  href: "javascript:void(0);",
                  perm: "dealer.level.operate"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: "提示",
                      content: `是否确定删除【${params.row.name}】隐藏等级？`,
                      loading: true,
                      onOk: () => {
                        this.changeLevelStatus(params, "delete");
                      }
                    });
                  }
                }
              },
              "删除"
            );
            let showItem = [edit];
            if (!params.row.dealers) {
              showItem.push(line, btn);
            }
            if (Number(params.row.status) !== 1) {
              showItem.push(line, del);
            }
            return h("div", showItem);
          }
        }
      ],
      listData: []
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getList();
  },
  methods: {
    /**
     * 获取经销商等级
     */
    getList() {
      this.$httpPost("/shop/admin/dealer/level/perm/list", { is_hide: 1 }, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          let list = res.data.list || [];
          this.listData = list.sort((a, b) => {
            let parent = b.parent_weight - a.parent_weight;
            if (parent) {
              return parent;
            } else {
              return b.weight - a.weight;
            }
          });
        } else {
          this.$Message.error(res.msg);
        }
      })
    },
    addLevel() {
      this.$router.push("/dealer/level/hidden/add");
    },
    changeLevelStatus(params, operate) {
      this.$httpGet(
        "/shop/admin/dealer/level/" + operate,
        { id: params.row.id },
        res => {
          this.$Modal.remove();
          if (res.code === 200) {
            this.$Message.success(operate == "delete" ? "删除成功" : "操作成功");
            if (operate === "delete") {
              this.listData.splice(params.index, 1);
            } else {
              this.$set(this.listData[params.index], "status", operate === "disable" ? 0 : 1);
            }
          } else {
            this.$Message.error("操作失败");
          }
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
.dealer-level-hidden {
  padding: 24px;
  & > button {
    margin-bottom: 24px;
  }
}
</style>
