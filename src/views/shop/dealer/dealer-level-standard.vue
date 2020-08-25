<template>
  <div class="dealer-level-standard">
    <Button type="primary" shape="circle" icon="md-add" perm="dealer.level.operate" @click="addLevel">新增等级</Button>
    <common-table :minWidth="1158" :columnsData="columns" :listData="list"></common-table> 
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import logicOrAnd from "@/views/shop/components/logic/logic-or-and.vue";
export default {
  components: {
    commonTable
  },
  data() {
    return {
      list: [],
      columns: [
        {
          width: 123,
          align: "center",
          key: "weight",
          title: "等级权重"
        },
        {
          width: 192,
          key: "name",
          title: "经销商等级名称"
        },
        {
          width: 149,
          align: "center",
          key: "discount",
          title: "拿货云仓折扣",
          render: (h, p) => {
            return h("span", parseFloat(p.row.discount) + "%")
          }
        },
        {
          minWidth: 262,
          key: "condition_text",
          title: "升级条件",
          renderHeader: (h, p) => {
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
                  maxWidth: 500,
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
              : "不自动升级");
          }
        },
        {
          width: 123,
          key: "dealers_count",
          align: "center",
          title: "等级使用情况",
          render: (h, p) => {
            return h("div",[
              h("div","使用中：" + p.row.dealers_count),
              h("div","申请中：" + p.row.applying_dealers_count)
            ])
          }
        },
        {
          width: 111,
          key: "status",
          align: "center",
          title: "状态",
          render: (h, p) => {
            return h('div', {
              class: p.row.status ? "table-success" : "table-error"
            }, p.row.status ? "启用" : "禁用") //状态1启用 0禁用
          }
        },
        {
          width: 198,
          title: "操作",
          render: (h, p) => {
            var edit = h('a',{
              class: 'table-operation',
			  attrs: {
				  href: "javascript:void(0);",
                  perm: "dealer.level.view"
              },
              on: {
                click: () => {
                  this.$router.push({
                    name: "dealerLevelStandardEdit",
                    query: {
                      id: p.row.id
                    }
                  })
                }
              }
            }, '修改');
            var levelInUse = p.row.dealers_count || p.row.applying_dealers_count
            var enable = !p.row.status || !levelInUse ? 
            h('span',{
              class: 'table-operation',
              attrs: {
                perm: "dealer.level.operate"
              },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: "提示",
                    content: p.row.status ? 
                      `当前经销商等级下还没有任何经销商，是否确定禁用【${p.row.name}】经销商等级？` : 
                      `是否确定启用【${p.row.name}】经销商等级？`,
                    onOk: () => {
                      this.levelOperate(p.row.status ? "disable" : "enable", p.row.id)
                    }
                  })
                }
              }
            }, p.row.status ? '禁用' : '启用') : null;
            var del = !p.row.status ? h('span',{
              class: 'table-operation',
              attrs: {
                perm: "dealer.level.operate"
              },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: "提示",
                    content: `是否确定删除【${p.row.name}】经销商等级？`,
                    onOk: () => {
                      this.levelOperate("delete", p.row.id)
                    }
                  })
                }
              }
            }, '删除') : null;
            var verticalLine = h("span", {
              style: {
                color: "#3352D9",
                margin: "0 10px"
              }
            }, "|")
            var result = [];
            [edit, enable, del].filter(item => item).forEach((item, index, arr) => {
              result.push(item)
              if(index < arr.length - 1) {
                result.push(verticalLine)
              }
            })
            return result
          }
        },
      ]
    }
  },
  created() {
    this.getList();
    if(this.hasLicensePerm("ENABLE_DEALER_HIDE_LEVEL")) {
      this.columns.splice(4, 0, {
        width: 111,
        align: "center",
        key: "hiddenLevel",
        title: "隐藏等级",
        render: (h, p) => {
          return h('div', {
              class: p.row.has_hide ? "table-success" : "table-warning"
            }, p.row.has_hide ? "使用中" : "未使用")
        }
      })
    }
  },
  methods: {
    addLevel() {
      this.$router.push("/dealer/level/standard/add");
    },
    levelOperate(op, id) {
      this.http.post("/shop/admin/dealer/level/" + op, {id}).then(res => {
        if(res.code == 200) {
          this.$Message.success(op == "delete" ? "删除成功" : "操作成功")
          this.getList();
        } else {
          this.$Message.error(res.msg)
        }
      }).catch(err => {
        this.$Message.error(err)
      })
    },
    getList() {
      this.$store.state.COMMON_loading = true;
      this.http.post("/shop/admin/dealer/level/perm/list", {
        is_hide: 0, //是否是隐藏等级 1是 0不是
      }).then(res => {
        this.$store.state.COMMON_loading = false
        if(res.code == 200) {
          this.list = res.data.list
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
  .dealer-level-standard {
    padding: 24px;
    .ivu-btn-primary {
      margin-bottom: 24px;
    }
  }
</style>