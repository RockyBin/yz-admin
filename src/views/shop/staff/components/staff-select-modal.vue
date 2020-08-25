<template>
  <Modal
    v-model="isShow"
    title="选择员工"
    @on-cancel="onModalCancel"
    @on-ok="onModalComfirm"
    :width="620"
    :mask-closable="false"
    class="modal-list-select-modal"
  >
    <div class="mglr">
      <div style="margin: 0;">
        <Input v-model="keyword" placeholder="姓名/手机/账号" style="width:210px"></Input>
        <span style="margin-left:15px;margin-right:5px;">部门：</span>
        <Select v-model="department_id" style="width: 160px;">
          <Option :value="-1">全部部门</Option>
          <Option 
            :value="item.id" 
            :label="item.name"
            v-for="item in departmentList" 
            :key="item.id"
          >
            <span v-if="item.level>1" class="line"></span>
            <span>{{item.name}}</span>
          </Option>
        </Select>
        <Button type="primary" style="margin-left:10px;" @click="onSearchClick">查询</Button>
      </div>
    </div>
    <div style="padding: 0 24px;overflow-y: auto; height: 340px;" >
      <Table
        @on-selection-change="onSelectChange"
        v-if="isShow"
        :loading="tableLoading"
        :height="340"
        :columns="columns"
        :data="staffList"
      ></Table>
    </div>
    <div style="padding: 0 24px;">
      <Page
        style="text-align: right;"
        :total="total"
        size="small"
        :page-size="pageSize"
        :current="page"
        @on-change="onPageChange"
        @on-page-size-change="onPageSizeChange"
        show-elevator
      />
    </div>
  </Modal>
</template>
<script>
export default {
  props: {
    value: Boolean,
    choosedStaffs: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      isShow: false,
      keyword: "",
      page: 1,
      pageSize: 10,
      total: 0,
      tableLoading: false,
      department_id: -1,
      departmentList: [],
      staffList: [],
      newSelectedStaff: {},
      deletedStaff: {},
      columns: [
        {
          type: 'selection',
          width: 40
        },
        {
          title: "员工信息",
          width: 260,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center"
                }
              },
              [
                h("img", {
                  style: {
                    width: "40px",
                    height: "40px",
                    borderRadius: "4px",
                    marginRight: "14px"
                  },
                  attrs: {
                    src: params.row.headurl
                      ? this.padImgUrl(params.row.headurl)
                      : "images/head-portrait.png"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      width: "calc(100% - 50px)"
                    }
                  },
                  [
                    h(
                      "div",
                      {
                        style: {
                          overflow: "hidden",
                          "text-overflow": "ellipsis",
                          "white-space": "nowrap",
                          color: "#657180",
                          fontSize: "13px"
                        }
                      },
                      "姓名：" + params.row.name
                    ),
                    h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4"
                        }
                      },
                      params.row.position ? "职位：" + params.row.position : ""
                    ),
                    h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4"
                        }
                      },
                      params.row.mobile ? "手机：" + params.row.mobile : ""
                    )
                  ]
                )
              ]
            );
          }
        },
        {
          title: "账号",
          key: "username",
          align: "center",
          width: 124
        },
        {
          title: "部门",
          key: "department_name",
          align: "center",
          render: (h, params) => {
            return h("div", params.row.department_name.length ? [
              params.row.department_name[0] && h("div", params.row.department_name[0]),
              params.row.department_name[1] && h("div", [
                h("span", {style: {
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderLeft: "1px solid #ccc",
                  borderBottom: "1px solid #ccc",
                  marginRight: "5px"
                }}),
                h("span", params.row.department_name[1])
              ])
            ] : [h("div", "--")])
          }
        },
      ]
    };
  },
  watch: {
    isShow(val) {
      this.$emit("input", val);
      if(val) {
        this.getStaffList()
      } else {
        this.resetData()
      }
    },
    value(val) {
      this.isShow = val;
    }
  },
  methods: {
    padImgUrl(url) {
      if (!url) {
        return;
      }
      if (/^http/i.test(url)) {
        return url;
      } else {
        return this.$store.state.siteComdataPath + url;
      }
    },
    // 重置弹窗数据
    resetData() {
      this.page = 1;
      this.keyword = "";
      this.department_id = -1;
      this.staffList = [];
      this.newSelectedStaff = {};
      this.deletedStaff = {};
    },
    onModalCancel() {
      this.isShow = false;
    },
    onModalComfirm() {
      var newSelectedStaff = [...Object.values(this.newSelectedStaff)].reduce((acc,item) => acc.concat(item));
      var deletedStaff = [...Object.values(this.deletedStaff)].reduce((acc,item) => acc.concat(item));
      var result = newSelectedStaff.concat(this.choosedStaffs.filter(staff => !deletedStaff.some(item => item.id == staff.id)))
      this.$emit("selectChange", result);
    },
    onSelectChange(select) {
      this.newSelectedStaff[this.page] = select.filter(item => {
        return !this.choosedStaffs.some(staff => staff.id == item.id)
      });
      this.deletedStaff[this.page] = this.choosedStaffs.filter(item => {
        return this.staffList.some(staff => staff.id == item.id) && !select.some(staff => staff.id == item.id)
      });
    },
    onPageChange(val) {
      this.page = val;
      this.getStaffList();
    },
    onPageSizeChange(size) {
      this.page = 1;
      this.pageSize = size;
      this.getStaffList();
    },
    onSearchClick() {
      this.page = 1;
      this.getStaffList();
    },
    flatenData(list, level = 1) {
      var result = [];
      list.forEach(item => {
        item.level = level
        result.push(item);
        if(item.sub_list && item.sub_list.length) {
          result.push(...this.flatenData(item.sub_list, level + 1))
        }
      })
      return result
    },
    getStaffList() {
      this.tableLoading = true;
      this.http.post("/shop/admin/staff/list", {
        page: this.page,
        page_size: this.pageSize,
        status: 1, //-1全部，1启用，0禁用
        role_id: undefined,
        department_id: this.department_id == -1 ? undefined : this.department_id,
        show_department_list: 1,
        keyword: this.keyword || undefined
      })
      .then(res => {
        this.tableLoading = false;
        if (res.code == 200) {
          this.staffList = res.data.list;
          this.staffList.forEach(staff => {
            if(this.choosedStaffs.findIndex(item => {
              return item.id == staff.id
            }) > -1) {
              staff._checked = true;
            }
          })
          this.total = res.data.total;
          this.departmentList = this.flatenData(res.data.department_list)
        } else {
          this.$Message.error(res.msg);
        }
      })
      .catch(err => {
        this.$Message.error(err);
      });
    }
  }
};
</script>
<style lang="less" scoped>
.modal-list-select-modal {
  /deep/.ivu-modal-header {
    height: 44px;
  }
  /deep/.ivu-modal-body {
    padding: 0;
    overflow: visible;
    .mglr {
      padding: 20px 24px 16px;
      .line {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-bottom: 1px solid #999;
        border-left: 1px solid #999;
        margin-right: 10px;
      }
    }
    .ivu-page {
      height: 54px;
      line-height: 54px;
    }
    .modal-list-select-modal-fixed {
      position: absolute;
      bottom: 14px;
      left: 18px;
      width: calc(100% - 172px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ivu-select {
      .ivu-select-selection {
        box-shadow: none;
      }
      .ivu-select-dropdown {
        text-align: left;
        width: 180px;
      }
    }
  }
  /deep/.ivu-modal-footer {
    border-top: 1px solid #e8eaec;
    padding: 0 18px;
    height: 50px;
    line-height: 50px;
  }
  
  /deep/.ivu-input-group-prepend,
  /deep/.ivu-input-group-append,
  /deep/.ivu-table-header th {
    background: #dcdee2;
  }
  /deep/.ivu-input-group-append button {
    height: 32px;
    line-height: 1.5;
  }
  /deep/.ivu-table-overflowX {
    overflow: hidden;
  }
  /deep/.ivu-table-overflowY {
    overflow: auto;
  }
  /deep/table {
    font-size: 12px;
    .ivu-table-cell {
      padding-left: unset;
      padding-right: unset;
      // width: 220px;
    }
    thead tr{
      th:first-child{
        padding-left: 14px;
      }
      th:nth-child(2){
        text-align: unset;
        padding-left: 14px;
      }
    }
    th {
      font-size: 13px;
    }
    tbody tr {
      color: #657180;
      height: 70px;
      &:hover td:last-child button {
        display: inline-block;
      }
      td:first-child{
        padding-left: 14px;
      }
      td:nth-child(2){
        padding-left: 14px;
        text-align: unset;
      }
      td:last-child {
        padding: 0 10px;
        .ivu-table-cell {
          text-align: left;
          padding-left: 50px;
        }
        .ivu-btn-default{
          margin-left: 4px;
        }
        button {
          width: 50px;
          height: 24px;
          padding: 0;
          line-height: 0;
          display: none;
          span {
            display: block;
          }
        }
      }
    }
  }
}
</style>
