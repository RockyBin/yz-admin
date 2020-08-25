<template>
  <div class="area-agent-level">
    <Button
      v-if="false"
      type="primary"
      shape="circle"
      @click="onAddAreaAgent"
      icon="md-add"
      perm="area.agent.level.operate"
      style="margin-bottom:24px;"
    >新增区代等级</Button>
    <common-table :minWidth="1156" :columnsData="levelColumn" :listData="levelData"></common-table>
    <div v-if="total" class="bar-pager">
      <Page
        :total="total"
        :page-size="pageSize"
        show-sizer
        :current="currentPage"
        @on-change="onPageChange"
        @on-page-size-change="onPageSizeChange"
        show-elevator
        class="page-style"
        :transfer="true"
      />
    </div>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
export default {
  components: {
    commonTable
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 20,
      total: 0,
      levelData: [],
      levelColumn: [
        {
          title: "等级名称",
          key: "name",
          align: "left",
          minWidth: 230,
          render: (h, p) => {
            return h("div", {}, [
              h("span", p.row.name),
              h("span", {
                style: {
                  display: false ? "inline-block" : "none",
                  width: "36px",
                  height: "20px",
                  lineHeight: "20px",
                  borderRadius: "4px",
                  color: "#fff",
                  textAlign: "center",
                  backgroundColor: "#FF9900",
                  marginLeft: "8px"
                }
              }, "默认")
            ])
          }
        },{
          title: "省代返佣比例",
          key: "province",
          align: "center",
          minWidth: 150,
          render: (h, p) => {
            return h("div", (p.row.commission ? p.row.commission.province : 0) + "%")
          }
        },{
          title: "市代返佣比例",
          key: "city",
          align: "center",
          minWidth: 150,
          render: (h, p) => {
            return h("div", (p.row.commission ? p.row.commission.city : 0) + "%")
          }
        },{
          title: "区代返佣比例",
          key: "district",
          align: "center",
          minWidth: 150,
          render: (h, p) => {
            return h("div", (p.row.commission ? p.row.commission.district : 0) + "%")
          }
        },{
          title: "使用情况",
          align: "center",
          minWidth: 180,
          render: (h, p) => {
            return h("div", {}, [
              h("div", "使用中：" + p.row.pass_count),
              h("div", "申请中：" + p.row.applying_count)
            ])
          }
        },{
          title: "状态",
          key: "status",
          align: "center",
          minWidth: 140,
          render: (h, p) => {
            return h("div", {
              class: p.row.status ? "table-success" : "table-error",
            }, p.row.status ? "启用" : "禁用",)
          }
        },{
          title: "操作",
          align: "center",
          minWidth: 160,
          render: (h, p) => {
            return h("div", {}, [
              h("span", {
                class: "table-operation",
                attrs: {
                  perm: "area.agent.level.view"
                },
                on: {
                  click: () => {
                    this.$router.push({
                      name: "areaAgentLevelEdit",
                      query: {
                        id: p.row.id
                      }
                    })
                  }
                }
              }, "修改")
            ])
          }
        }
      ]
    }
  },
  created() {
    this.getAreaAgentLevel();
  },
  methods: {
    onAddAreaAgent() {

    },
    onPageChange(page) {

    },
    onPageSizeChange(size) {

    },
    getAreaAgentLevel() {
      this.$httpGet("/shop/admin/area/agent/level/get", {}, res => {
        if(res.code == 200) {
          this.levelData = res.data.list;
          // this.total = res.data.total;
        } else {
          this.$Message.error(res.msg);
        }
      })
    }
  }
}
</script>
<style lang='less' scoped>
.area-agent-level {
  padding: 24px 24px 0;
}
</style>