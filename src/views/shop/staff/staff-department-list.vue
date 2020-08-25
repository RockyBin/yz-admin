<template>
  <div class="department-list">
    <Button type="primary" shape="circle" perm="department.operate" @click="addDepartment()">新增一级部门</Button>
    <department-table
      :data="departmentList"
      @addDepartment="addDepartment"
      @editDepartment="editDepartment"
      @deleteDepartment="deleteDepartment"
      @sortDepartment="sortDepartment"
    ></department-table>
    <Modal class="deleting-modal" v-model="isShowDeleteModal" :width="412" :footer-hide="true">
      <div style="line-height:42px;">
        <Icon size="28" color="#ed4014" type="ios-help-circle"></Icon>
        <span style="font-size:16px;font-weight:bold;margin-left:5px;vertical-align:middle">提示</span>
      </div>
      <div v-if="deletingDepartment" style="font-size:13px;padding-left:34px;padding-right:11px;">

        <div v-if="deletingDepartment.level==1">
          当前一级部门【{{deletingDepartment.name}}】下有<span style="color:red;">{{deletingDepartment.sub_list.length}}</span>
          个二级部门，关联了<span style="color:red;">{{deletingDepartment.admin_count}}</span>
          名员工，删除后一级和二级将同时删除，{{deletingDepartment.admin_count?'同时执行以下操作：':'是否确定删除该部门'}}
        </div>
        <div v-else-if="deletingDepartment.admin_count">
          当前二级部门【{{deletingDepartment.name}}】关联了<span style="color:red">{{deletingDepartment.admin_count}}</span>名员工，删除后同时选择以下操作：
        </div>
        <div v-else>是否确定删除二级部门【{{deletingDepartment.name}}】</div>
        <RadioGroup v-if="deletingDepartment.admin_count" v-model="delete_type" style="margin:10px 0;line-height:32px;">
          <Radio :label="0">把与该部门绑定的员工全部解绑</Radio><br>
          <Radio :label="1">转移到其他部门</Radio>
        </RadioGroup>
        <div v-if="deletingDepartment.admin_count" :class="{'ivu-form-item-error':hasError}">
          <Select v-model="transferDepartmentId" transfer style="width:210px;" @input="hasError=false">
            <Option 
              :disabled="deletingDepartment.id == item.id || (deletingDepartment.sub_list && deletingDepartment.sub_list.includes(item))"
              v-for="item in flattenDepartment" 
              :value="item.id" 
              :key="item.id"
            >
              <span v-if="item.level>1" style="display: inline-block;width: 10px;height: 10px;border-left: 1px solid #ccc;border-bottom: 1px solid #ccc;margin-right: 5px;"></span>
              <span>{{item.name}}</span>
            </Option>
          </Select>
        </div>
      </div>
      <div v-if="deletingDepartment" style="overflow:hidden;margin-top:19px;text-align:right">
        <Button type="text" @click="resetModal">取消</Button>
        <Button type="primary" @click="onDeleteOk">{{deletingDepartment.admin_count?(delete_type?"转移并删除":"解绑并删除"):"确定"}}</Button>
      </div>
    </Modal>
    <Modal
      :width="400"
      :mask-closable="false"
      :class="{'department-modal':true,'level-two':currentMode >= 3}"
      v-model="isShowEditModal"
      :title="titleArray[currentMode]"
      @on-cancel="modelClose"
    >
      <Form ref="form" :model="formFields" :rules="formRules">
        <FormItem v-if="currentMode >= 3" label="一级部门:" :label-width="76">
          <span>{{firstLevelDepartment.name}}</span>
        </FormItem>
        <FormItem
          prop="departmentName"
          :label-width="76"
          :label="currentMode < 3 ? '一级部门:' : '二级部门:'"
        >
          <span v-if="currentMode >= 3" class="custom-icon"></span>
          <Input v-model="formFields.departmentName" :maxlength="10" placeholder="请输入部门名称">
            <span slot="suffix">{{formFields.departmentName.length}}/10</span>
          </Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modelClose">取消</Button>
        <Button
          type="primary"
          :loading="btnLoading"
          perm="department.operate"
          @click="saveDepartment"
        >确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import departmentTable from "./components/department-table.vue";
export default {
  components: {
    departmentTable
  },
  data() {
    return {
      isShowDeleteModal: false,
      isShowEditModal: false,
      currentMode: 0, //1新增一级部门，2编辑一级部门，3新增二级部门，4编辑二级部门
      titleArray: [
        "",
        "新增一级部门",
        "编辑一级部门",
        "新增二级部门",
        "编辑二级部门"
      ],
      firstLevelDepartment: null,
      secondLevelDepartment: null,
      deletingDepartment: null,
      departmentList: [],
      flattenDepartment: [],
      sortIndex: 999,
      formFields: {
        departmentName: ""
      },
      formRules: {
        departmentName: [
          { required: true, message: "请输入部门名称", trigger: "blur" }
        ]
      },
      btnLoading: false,
      delete_type: 0, //0把与该部门绑定的员工全部解绑, 1转移到其他部门
      transferDepartmentId: 0, //转移到其他部门的ID
      hasError: false //转移到其他部门的ID为0是出错误提示
    };
  },
  created() {
    this.getDepartmentList();
  },
  methods: {
    getDepartmentList() {
      this.$store.state.COMMON_loading = true;
      this.http
        .get("/shop/admin/department/list")
        .then(res => {
          this.$store.state.COMMON_loading = false;
          if (res.code == 200) {
            this.flattenDepartment = this.flatten(res.data.list, 1);
            res.data.list.forEach(item => {
              var oldItem = this.departmentList.find(i => i.id == item.id)
              if(item.sub_list && item.sub_list.length) {
                this.$set(item, "isOpen", oldItem ? oldItem.isOpen : false);
                this.$set(item, "admin_count", item.sub_list.reduce((sum, i) => {return sum + i.admin_count},item.admin_count))
              }
            })
            this.departmentList = res.data.list;
            this.sortIndex = this.findMaxSortIndex(this.departmentList);
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    },
    flatten(arr, level) {
      let result = [];
      arr.forEach(item => {
        item.level = level;
        result.push(item);
        if (item.sub_list && item.sub_list.length) {
          result = result.concat(this.flatten(item.sub_list, level + 1));
        }
      });
      return result;
    },
    findMaxSortIndex(list) {
      var maxSortIndex = 0;
      list.forEach(item => {
        if (item.sort > maxSortIndex) {
          maxSortIndex = item.sort;
        }
        if (item.sub_list && item.sub_list.length) {
          let result = this.findMaxSortIndex(item.sub_list);
          if (result > maxSortIndex) {
            maxSortIndex = result;
          }
        }
      });
      return maxSortIndex;
    },
    getSortData(list) {
      var sortData = [];
      list.forEach((item, index) => {
        sortData.push({
          id: item.id,
          sort: list.length - index
        });
        if (item.sub_list && item.sub_list.length) {
          var result = this.getSortData(item.sub_list);
          sortData.push(...result);
        }
      });
      return sortData;
    },
    addDepartment(item) {
      if (item) {
        this.currentMode = 3;
      } else {
        this.currentMode = 1;
      }
      this.firstLevelDepartment = item;
      this.isShowEditModal = true;
    },
    editDepartment(item, parent) {
      if (parent) {
        this.currentMode = 4;
      } else {
        this.currentMode = 2;
      }
      this.firstLevelDepartment = parent || item;
      this.secondLevelDepartment = parent ? item : null;
      this.formFields.departmentName = item.name;
      this.isShowEditModal = true;
    },
    deleteDepartment(item, parent) {
      this.deletingDepartment = item;
      this.isShowDeleteModal = true
    },
    modelClose() {
      this.isShowEditModal = false;
      this.currentMode = 0;
      this.firstLevelDepartment = null;
      this.secondLevelDepartment = null;
      this.$refs.form.resetFields();
    },
    resetModal() {
      this.delete_type = 0;
      this.transferDepartmentId = 0;
      this.deletingDepartment = null;
      this.isShowDeleteModal = false
    },
    onDeleteOk() {
      if(this.delete_type && !this.transferDepartmentId) {
        this.hasError = true;
        return this.$Message.error("请选择转移部门");
      } else {
        this.hasError = false;
      }
      this.$store.state.COMMON_loading = true;
      this.http
        .post("/shop/admin/department/delete", {
          id: this.deletingDepartment.id,
          delete_type: this.deletingDepartment.admin_count ? this.delete_type : undefined,
          department_id: this.delete_type
            ? this.transferDepartmentId
            : undefined
        })
        .then(res => {
          this.$store.state.COMMON_loading = false;
          if (res.code == 200) {
            this.getDepartmentList();
            if (this.deletingDepartment.admin_count) {
              if (this.delete_type == 0) {
                this.$Message.success("解绑并删除成功");
              } else {
                this.$Message.success("转移并删除成功");
              }
            } else {
              this.$Message.success("删除成功");
            }
          } else {
            this.$Message.error("删除失败");
          }
          this.resetModal();
        })
        .catch(err => {
          this.$Message.error("删除失败");
        });
      
    },
    saveDepartment() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.btnLoading = true;
          this.http
            .post("/shop/admin/department/save", {
              id: [2, 4].includes(this.currentMode)
                ? this.currentMode == 2
                  ? this.firstLevelDepartment.id
                  : this.secondLevelDepartment.id
                : undefined,
              name: this.formFields.departmentName,
              sort: [1, 3].includes(this.currentMode)
                ? ++this.sortIndex
                : this.currentMode == 2
                  ? this.firstLevelDepartment.sort
                  : this.secondLevelDepartment.sort,
              parent_id: [3, 4].includes(this.currentMode)
                ? this.firstLevelDepartment.id
                : undefined
            })
            .then(res => {
              this.btnLoading = false;
              if (res.code == 200) {
                this.$Message.success(
                  [1, 3].includes(this.currentMode) ? "新增成功" : "保存成功"
                );
                this.getDepartmentList();
                this.modelClose();
              } else {
                this.$Message.error(
                  [1, 3].includes(this.currentMode) ? "新增失败" : "编辑失败"
                );
              }
            })
            .catch(err => {
              this.$Message.error(
                [1, 3].includes(this.currentMode) ? "新增失败" : "编辑失败"
              );
            });
        } else {
          this.$Message.error(
            [1, 3].includes(this.currentMode) ? "新增失败" : "编辑失败"
          );
        }
      });
    },
    sortDepartment() {
      console.log(this.departmentList);
      var sortData = this.getSortData(this.departmentList);
      console.log(sortData);
      this.http
        .post("/shop/admin/department/sort/save", {
          sort_data: sortData
        })
        .then(res => {
          if (res.code == 200) {
            this.getDepartmentList();
            this.$Message.success("保存成功");
          } else {
            this.$Message.error("保存失败");
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
.department-list {
  padding: 24px 24px 60px !important;
  /deep/.ivu-btn-circle {
    margin-bottom: 24px;
  }
}
.department-modal {
  .custom-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-left: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    margin-right: 8px;
  }
  /deep/.ivu-input-wrapper {
    width: 260px;
    .ivu-input-suffix {
      right: 10px;
      line-height: 32px;
    }
  }
  &.level-two {
    /deep/.ivu-input-wrapper {
      width: 250px;
    }
    /deep/.ivu-form-item-error-tip {
      left: 24px;
    }
  }
}
.deleting-modal {
  /deep/.ivu-modal-body {
    padding: 16px;
    .tree-line {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-left: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
      margin-right: 5px;
    }
  }
}
</style>