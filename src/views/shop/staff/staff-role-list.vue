<template>
  <div class="main-board">
    <div class="content">
      <div class="row">
        <!--<Button-->
          <!--class="btn-add"-->
          <!--type="primary"-->
          <!--shape="circle"-->
          <!--icon="md-add"-->
          <!--@click="$router.push('/setting/account/addRole')"-->
          <!--perm="role.operate"-->
        <!--&gt;新增角色</Button>-->
        <add-more text="新增角色" @onAddMoreClick="onCoupons" perm="role.operate"></add-more>
      </div>
      <div class="wrapper2">
        <Table ref="role" border :columns="roleColumns" :data="roleList"></Table>
      </div>
    </div>
    <div class="bar-pager">
      <Page
        v-if="roleTotal"
        :current="roleCurrentPage"
        :total="roleTotal"
        :page-size="rolePageSize"
        show-elevator
        show-sizer
        :transfer="true"
        @on-change="roleCurrentPage=$event;loadRoleData()"
        @on-page-size-change="roleCurrentPage=1;rolePageSize=$event;loadRoleData()"
      />
    </div>
  </div>
</template>
<script>
import axios from "axios";
// import myTable from "iview/src/components/table/table.vue"
import addMore from "@/views/shop/components/button/add-more.vue";
export default {
  components: {
      addMore,
  },
  data() {
    return {
      // 角色信息分页
      roleTotal: 0,
      roleCurrentPage: 1,
      rolePageSize: 20,
      roleList: [],
      roleColumns: [
        {
          title: "角色权限",
          key: "name",
          align: "center"
        },
        {
          title: "账号数量",
          align: "center",
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  class: "edit-link",
                  perm: params.row.admin_num ? "staff.view" : "",
                  href: "javascript:void(0)"
                },
                style: {
                  cursor: params.row.admin_num ? "pointer" : "default"
                },
                on: {
                  click: () => {
                    params.row.admin_num &&
                      this.$router.push({
                        name: "staffList",
                        params: {
                          role_id: params.row.id
                        }
                      });
                  }
                }
              },
              params.row.admin_num
            )
          }
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          render: (h, params) => {
            var self = this;
            return [
              h(
                "a",
                {
                  attrs: {
                    class: "edit-link",
                    href: "javascript:void(0)",
                    perm: "role.operate"
                  },
                  on: {
                    click() {
                      self.$router.push(
                        "/staff/edit-role?roleId=" + params.row.id
                      );
                    }
                  }
                },
                "编辑"
              ),
              h(
                "a",
                {
                  style: {
                    marginRight: "10px"
                  }
                },
                "|"
              ),
              h(
                "a",
                {
                  attrs: {
                    href: "javascript:void(0)",
                    perm: "role.operate"
                  },
                  on: {
                    click() {
                      self.deleteRole(params.row);
                    }
                  }
                },
                "删除"
              )
            ];
          }
        }
      ]
    };
  },
  created() {
    this.loadRoleData();
  },
  // watch: {
  //   currentPane: {
  //     handler: function(newVal) {
  //       //解决表格切换显示状态时宽度为0导致表头与内容单元格不对齐的bug
  //       this.$nextTick(() => {
  //         this.$refs[newVal] && this.$refs[newVal].$emit("on-visible-change", true)
  //       })
  //     },
  //     immediate: true
  //   }
  // },
  methods: {
    //获取角色列表
    loadRoleData() {
      this.$store.state.COMMON_loading = true;
      axios
        .get("/shop/admin/role/list", {
          params: {
            page: this.roleCurrentPage,
            page_size: this.rolePageSize
          }
        })
        .then(res => {
          this.$store.state.COMMON_loading = false
          if (res.code == 200) {
            this.roleList = [];
            this.$nextTick(() => {
              this.roleList = res.data.list;
              this.roleTotal = res.data.total;
            });
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    },
    //删除角色
    deleteRole(role) {
      let showModal = true;
      this.$Modal.confirm({
        loading: true,
        title: "提示",
        content: "是否确定删除该角色权限？",
        onOk: () => {
          axios
            .post("/shop/admin/role/delete", {
              id: role.id
            })
            .then(res => {
              if (res.code == 200) {
                this.$Message.success("删除成功");
                this.roleCurrentPage = 1;
                this.loadRoleData();
              } else {
                this.$Message.error(res.msg);
              }
              this.$Modal.remove();
            })
            .catch(err => {
              this.$Message.error(err);
              this.$Modal.remove();
            });
        }
      });
    },
    onCoupons(){
      this.$router.push('/staff/add-role')
    }
  }
};
</script>
<style lang="less" scoped>
.main-board {
  .content {
    padding: 24px 24px 0;
  }
  .bar-pager {
    padding-right: 24px;
  }
  .select-role {
    width: 210px;
    height: 32px;
    margin-right: 15px;
  }
  .input-role {
    width: 211px;
    height: 32px;
    margin-right: 15px;
  }
  .select-status {
    width: 210px;
    height: 32px;
    margin-right: 15px;
  }
  .row {
    // margin-bottom: 24px;
    .label {
      margin-right: 5px;
    }
  }
  /deep/.ivu-table-header th {
    background: #f8f9fd;
  }
  /deep/.ivu-table-body td {
    font-size: 12px;
    color: #657180;
  }
  /deep/.ivu-table-body a {
    color: #3f66d3;
  }
  // .wrapper1/deep/.ivu-table-body {
  //   height: calc(100vh - 381px);
  //   width:calc(100% + 6px);
  //   overflow-y: auto;
  //   overflow-x:hidden;
  // }
  // .wrapper2/deep/.ivu-table-body {
  //   height: calc(100vh - 335px);
  //   width:calc(100% + 6px);
  //   overflow-y: auto;
  //   overflow-x:hidden;
  // }
  .ivu-table-wrapper/deep/table {
    min-width: 1093px;
    width: 100% !important;
    table-layout: auto;
  }
  /deep/.enabled {
    display: inline-block;
    height: 22px;
    line-height: 22px;
    padding: 0 8px;
    font-size: 12px;
    border-radius: 4px;
    color: #589a0a;
    background: #e1fbc3;
    border: 1px solid #78c122;
    white-space: nowrap;
  }
  /deep/.disabled {
    display: inline-block;
    height: 22px;
    line-height: 22px;
    padding: 0 8px;
    font-size: 12px;
    border-radius: 4px;
    color: #f5222d;
    background: #fff1f0;
    border: 1px solid #ffa39e;
    white-space: nowrap;
  }
  /deep/.edit-link:not(:last-child) {
    margin-right: 10px;
  }
}
</style>