<template>
  <div class="main-board">
    <Tabs v-model="currentPane" :animated="false">
      <TabPane label="员工列表" v-if="paneShow.staff" name="staff">
        <div class="content">
          <div class="row">
            <!--<Button-->
            <!--class="btn-add"-->
            <!--type="primary"-->
            <!--shape="circle"-->
            <!--icon="md-add"-->
            <!--@click="$router.push('/setting/account/addStaff')"-->
            <!--perm="staff.operate"-->
            <!--&gt;新增员工</Button>-->
            <add-more text="新增员工" @onAddMoreClick="onAddCoupons" perm="staff.operate"></add-more>
          </div>
          <div class="row" style="margin-bottom:20px">
            <Input
              class="input-role"
              v-model="keyword"
              prefix="ios-search"
              placeholder="姓名/账号/手机"
              @on-enter="(staffCurrentPage = 1) && searchTaffData()"
            />
            <span class="label">部门：</span>
            <singleSelect class="select-role" v-model="departmentID" :levelList="departmentList" />
            <span class="label">角色：</span>
            <Select class="select-role" v-model="roleID">
              <Option :value="-1">全部角色</Option>
              <Option
                v-for="(role, index) in allRoleList"
                :value="role.id"
                :key="index"
              >{{ role.name }}</Option>
            </Select>
            <span class="label">状态：</span>
            <Select class="select-status" v-model="status" style="width: 100px;">
              <Option :value="-1">全部</Option>
              <Option :value="1">启用</Option>
              <Option :value="0">禁用</Option>
            </Select>
            <Button type="primary" style="width:58px;height:32px;" @click="searchTaffData">查询</Button>
            <Button :disabled="!canExport" style="width:58px;height:32px;margin-left: 12px;" @click="doExport">导出</Button>
          </div>
          <div class="wrapper1" style="min-width: 1158px;">
            <Table ref="staff" border :columns="staffColumns" :data="staffList"></Table>
          </div>
        </div>
        <div class="bar-pager">
          <Page
            v-if="staffTotal"
            :current="staffCurrentPage"
            :total="staffTotal"
            :page-size="staffPageSize"
            show-elevator
            show-sizer
            :transfer="true"
            @on-change="
              staffCurrentPage = $event;
              loadStaffData();
            "
            @on-page-size-change="
              staffPageSize = $event;
              loadStaffData();
            "
          />
        </div>
      </TabPane>
      <TabPane label="角色权限" v-if="paneShow.role" name="role">
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
            @on-change="
              roleCurrentPage = $event;
              loadRoleData();
            "
            @on-page-size-change="
              roleCurrentPage = 1;
              rolePageSize = $event;
              loadRoleData();
            "
          />
        </div>
      </TabPane>
    </Tabs>
    <transfer-modal
      v-model="transferStatus"
      :dataInfo="dataInfo"
      :levelList="departmentList"
      :levelObj="departmentObj"
      @on-ok="
        deleteRole({
          id: dataInfo.id,
          delete_type: 1
        })
      "
    ></transfer-modal>
  </div>
</template>
<script>
import axios from "axios";
import addMore from "@/views/shop/components/button/add-more.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import transferModal from "./components/setting-account-modal-transfer";
import singleSelect from "@/views/shop/components/selector/single-tree-select.vue";
import commonFunction from "@/views/shop/components/common-function.js";
export default {
  components: {
    addMore,
    transferModal,
    singleSelect
  },
  data() {
    return {
      // 查询条件
      roleID: -1,
      departmentID: -1,
      transferStatus: false,
      dataInfo: null,
      status: -1,
      keyword: "",
      defaultImg: require("@/views/shop/images/head-portrait.png"),
      canExport: false, //是否可以导出
      // 员工信息分页
      staffTotal: 0,
      staffCurrentPage: 1,
      staffPageSize: 20,
      staffSearchData: null,
      staffHasLoadLevel: false, // 判断是否加载过等级数据
      // 角色信息分页
      roleTotal: 0,
      roleCurrentPage: 1,
      rolePageSize: 20,
      // 处理浏览器回退
      currentPane: this.$route.query.pane,
      allRoleList: [],
      departmentList: [{ id: -1, name: "全部" }],
      departmentObj: {},
      roleList: [],
      staffList: [],
      staffColumns: [
        {
          title: "员工信息",
          minWidth: 220,
          render: (h, params) => {
            return h(
              memberInfor,
              {
                props: {
                  id: Number(params.row.id),
                  headurl: this.getHeadImg(params.row.headurl)
                },
                attrs: {
                  perm: "member.detail.view"
                }
              },
              [
                h("div", { class: "one-hide" }, params.row.name),
                params.row.position
                  ? h(
                      "div",
                      {
                        style: {
                          color: "#9ea7b4",
                          fontSize: "12px"
                        }
                      },
                      "职位：" + params.row.position
                    )
                  : "",
                params.row.mobile
                  ? h(
                      "div",
                      {
                        style: {
                          color: "#9ea7b4",
                          fontSize: "12px"
                        }
                      },
                      "手机：" + params.row.mobile
                    )
                  : ""
              ]
            );
          }
        },
        {
          title: "登录账号",
          key: "username",
          minWidth: 180,
          align: "center"
        },
        {
          title: "部门",
          align: "center",
          minWidth: 146,
          render: (h, params) => {
            let department = this.departmentObj[params.row.department_id];
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left"
                }
              },
              department
                ? [
                    h(
                      "div",
                      department.parent_id
                        ? department.parent_name
                        : department.name
                    ),
                    department.parent_id
                      ? h(
                          "div",
                          {
                            class: "table-second-level"
                          },
                          department.name
                        )
                      : ""
                  ]
                : "--"
            );
          }
        },
        {
          title: "发展会员",
          align: "center",
          minWidth: 180,
          render: (h, params) => {
            return h("div", [
              h("div", "总会员：" + params.row.member_count),
              Number(params.row.distributor_count)
                ? h("div", "分销商：" + params.row.distributor_count)
                : "",
              Number(params.row.agent_count)
                ? h("div", "代理商：" + params.row.agent_count)
                : "",
              Number(params.row.dealer_count)
                ? h("div", "经销商：" + params.row.dealer_count)
                : ""
            ]);
          }
        },
        {
          title: "角色权限",
          key: "role_name",
          minWidth: 180,
          align: "center"
        },
        {
          title: "状态",
          key: "status",
          minWidth: 90,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                class: params.row.status ? "enabled" : "disabled"
              },
              params.row.status ? "启用" : "禁用"
            );
          }
        },
        {
          title: "操作",
          key: "action",
          minWidth: 160,
          align: "center",
          width: 150,
          render: (h, params) => {
            var self = this;
            return [
              h(
                "a",
                {
                  attrs: {
                    class: "edit-link",
                    href: "javascript:void(0)"
                  },
                  on: {
                    click() {
                      self.$router.push({
                        name: "editStaff",
                        query: { staffId: params.row.id },
                        params: { allRoleList: self.allRoleList }
                      });
                    }
                  }
                },
                "编辑"
              ),
              params.row.role_type != 9 &&
                h(
                  "a",
                  {
                    style: {
                      marginRight: "10px"
                    }
                  },
                  "|"
                ),
              params.row.role_type != 9 &&
                h(
                  "a",
                  {
                    attrs: {
                      href: "javascript:void(0)",
                      perm: "staff.operate"
                    },
                    on: {
                      click() {
                        self.toggleStatus(params.row);
                      }
                    }
                  },
                  params.row.status ? "禁用" : "启用"
                ),
              params.row.role_type != 9 &&
                !params.row.status &&
                h(
                  "a",
                  {
                    style: {
                      margin: "0 10px"
                    }
                  },
                  "|"
                ),
              params.row.role_type != 9 &&
                !params.row.status &&
                h(
                  "a",
                  {
                    attrs: {
                      href: "javascript:void(0)",
                      perm: "staff.operate"
                    },
                    on: {
                      click() {
                        self.onDeleteRoleClick(params.row);
                      }
                    }
                  },
                  "删除"
                )
            ];
          }
        }
      ],
      roleColumns: [
        {
          title: "角色权限",
          key: "name",
          align: "center"
        },
        {
          title: "账号数量",
          key: "admin_num",
          align: "center"
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 120,
          render: (h, params) => {
            var self = this;
            return [
              h(
                "a",
                {
                  attrs: {
                    class: "edit-link",
                    href: "javascript:void(0)"
                  },
                  on: {
                    click() {
                      self.$router.push(
                        "/setting/account/editRole?roleId=" + params.row.id
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
      ],
      paneShow: {
        staff: false,
        role: false
      }
    };
  },
  created() {
    if (window.hasPerm("role.view")) {
      // this.currentPane = 'role';
      this.paneShow.role = true;
      this.loadRoleData();
    }
    if (window.hasPerm("staff.view")) {
      // this.currentPane = 'staff';
      this.paneShow.staff = true;
      this.searchTaffData();
    }
  },
  watch: {
    currentPane: {
      handler: function(newVal) {
        //处理浏览器回退
        this.$router.replace("/setting/account?pane=" + (newVal || "staff"));
        //解决表格切换显示状态时宽度为0导致表头与内容单元格不对齐的bug
        this.$nextTick(() => {
          this.$refs[newVal] &&
            this.$refs[newVal].$emit("on-visible-change", true);
        });
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 获取头像
     */
    getHeadImg(url) {
      if (url) {
        if (!/^(http)/i.test(url)) {
          url = this.$store.state.siteComdataPath + url;
        }
        return url;
      }
      return this.defaultImg;
    },
    /**
     * 修改搜索条件并加载数据
     */
    searchTaffData() {
      this.staffSearchData = {
        status: this.status,
        role_id: this.roleID === -1 ? "" : this.roleID,
        department_id: this.departmentID === -1 ? "" : this.departmentID,
        keyword: this.keyword
      };
      this.loadStaffData();
    },
    /**
     * 点击删除
     */
    async onDeleteRoleClick(item) {
      if (!item.member_count) {
        this.$Modal.confirm({
          title: "提示",
          content: `是否确定删除员工【${item.name}】？`,
          onOk: () => {
            this.deleteRole(
              {
                id: item.id,
                delete_type: 0
              },
              "删除成功"
            );
          }
        });
      } else {
        let radioValue = 0;
        let okText = ["解绑并删除", "前往转移并删除"];
        this.$Modal.confirm({
          title: "提示",
          render: h => {
            let render = h("div", [
              h(
                "div",
                "删除员工【马云】后，员工将不能再访问您的后台系统，同时对绑定该员工的所有会员做以下操作："
              ),
              h(
                "RadioGroup",
                {
                  props: {
                    vertical: true,
                    value: radioValue
                  },
                  on: {
                    "on-change": val => {
                      radioValue = val;
                      render.context._data.okText = okText[val];
                    }
                  }
                },
                [
                  h(
                    "Radio",
                    {
                      props: {
                        label: 0
                      }
                    },
                    "把与该员工绑定的会员全部解绑"
                  ),
                  h(
                    "Radio",
                    {
                      props: {
                        label: 1
                      }
                    },
                    "转移给其他员工"
                  )
                ]
              )
            ]);
            return render;
          },
          okText: okText[0],
          onOk: () => {
            if (radioValue === 0) {
              this.deleteRole({
                id: item.id,
                delete_type: 0
              });
            } else {
              this.transferStatus = true;
              this.dataInfo = item;
            }
          }
        });
      }
    },
    /**
     * 删除员工
     */
    deleteRole(data, text) {
      this.$httpPost("/shop/admin/staff/delete", data, res => {
        if (res.code === 200) {
          this.$Message.success(
            text || (data.delete_type ? "转移并删除成功" : "解绑并删除成功")
          );
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    //获取员工列表
    loadStaffData() {
      this.$store.state.COMMON_loading = true;
      axios
        .get("/shop/admin/staff/list", {
          params: Object.assign(
            {
              page: this.staffCurrentPage,
              page_size: this.staffPageSize,
              show_role_list: this.staffHasLoadLevel ? 0 : 1,
              show_department_list: this.staffHasLoadLevel ? 0 : 1
            },
            this.staffSearchData
          )
        })
        .then(res => {
          this.$store.state.COMMON_loading = false;
          if (res.code == 200) {
            this.staffList = [];
            this.$nextTick(() => {
              this.canExport = res.data.list.length > 0;
              this.staffList = res.data.list;
              this.staffTotal = res.data.total;
              if (!this.staffHasLoadLevel) {
                this.allRoleList = res.data.role_list;
                let departmentList = [{ id: -1, name: "全部" }];
                let departmentObj = {};
                res.data.department_list.forEach(m => {
                  departmentList.push(m);
                  departmentObj[m.id] = m;
                  m.sub_list.forEach(n => {
                    departmentList.push(n);
                    departmentObj[n.id] = Object.assign({}, n, {
                      parent_name: m.name
                    });
                  });
                });
                this.departmentList = departmentList;
                this.departmentObj = departmentObj;
                this.staffHasLoadLevel = true;
              }
            });
          } else {
            this.roleTotal = 0;
            this.staffTotal = 0;
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.roleTotal = 0;
          this.staffTotal = 0;
          this.$store.state.COMMON_loading = false;
          this.$Message.error(err);
        });
    },
    //获取角色列表
    loadRoleData() {
      axios
        .get("/shop/admin/role/list", {
          params: {
            page: this.roleCurrentPage,
            page_size: this.rolePageSize
          }
        })
        .then(res => {
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
    //切换员工账号的启用禁用状态
    toggleStatus(staff) {
      this.$Modal.confirm({
        title: "提示",
        render: h => {
          return h(
            "div",
            staff.status
              ? [
                  `员工【${staff.name}】绑定了${staff.member_count}个会员，禁用后员工将不能再访问您的后台系统，是否确定禁用`
                ]
              : [
                  `启用员工【${staff.name}】后，员工可以继续访问您的后台系统，是否确定启用？`
                ]
          );
        },
        onOk: () => {
          axios
            .post("/shop/admin/staff/status", {
              id: staff.id,
              status: staff.status ? 0 : 1
            })
            .then(res => {
              if (res.code == 200) {
                this.$Message.success(res.msg);
                staff.status = staff.status ? 0 : 1;
              } else {
                this.$Message.error(res.msg);
              }
            })
            .catch(err => {
              this.$Message.error(err);
            });
        }
      });
    },
    //删除角色
    // deleteRole(role) {
    //   this.$Modal.confirm({
    //     loading: true,
    //     title: "提示",
    //     content: "是否确定删除该角色权限？",
    //     onOk: () => {
    //       axios
    //         .post("/shop/admin/role/delete", {
    //           id: role.id
    //         })
    //         .then(res => {
    //           if (res.code == 200) {
    //             this.$Message.success("删除成功");
    //             this.roleCurrentPage = 1;
    //             this.loadRoleData();
    //           } else {
    //             this.$Message.error(res.msg);
    //           }
    //           this.$Modal.remove();
    //         })
    //         .catch(err => {
    //           this.$Message.error(err);
    //           this.$Modal.remove();
    //         });
    //     }
    //   });
    // },
    onAddCoupons() {
      this.$router.push("/setting/account/addStaff");
    },
    onCoupons() {
      this.$router.push("/setting/account/addRole");
    },
    //导出
    doExport() {
      if (this.staffList.length) {
        let params = Object.assign(
          {
            page: this.staffCurrentPage,
            page_size: this.staffPageSize,
            show_role_list: this.staffHasLoadLevel ? 0 : 1,
            show_department_list: this.staffHasLoadLevel ? 0 : 1
          },
          this.staffSearchData
        );
        commonFunction.exportTable(
          params,
          this.http,
          "/shop/admin/staff/export"
        );
      }
    }
  }
};
</script>
<style lang="less" scoped>
.main-board {
  /deep/.ivu-tabs-bar {
    margin-bottom: 0;
    padding-left: 24px;
  }
  // /deep/.ivu-tabs-tabpane {
  // padding: 29px 24px 0;
  // position:relative;
  // height:calc(100vh - 144px);
  // }
  /deep/.ivu-tabs-tabpane {
    padding: 24px 24px 0;
    height: calc(100vh - 120px);
    overflow: auto;
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
  /deep/.table-second-level {
    padding-left: 30px;
    position: relative;
    &:before,
    &:after {
      content: "";
      display: block;
      position: absolute;
      left: 16px;
      bottom: 12px;
      background-color: #ccc;
    }
    &:before {
      width: 1px;
      height: 10px;
    }
    &:after {
      width: 10px;
      height: 1px;
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
  .wrapper1 {
    /deep/.ivu-table-body tr {
      height: 80px;
    }
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
