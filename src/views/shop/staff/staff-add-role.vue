<template>
  <div class="container">
    <div class="wrapper">
      <h3>角色信息</h3>
      <Form
        ref="form"
        :model="formField"
        :rules="rules"
        :label-width="90"
        style="margin-bottom: 20px;"
      >
        <FormItem label="角色名称：" prop="name">
          <Input v-model="formField.name" placeholder="请输入角色名称" />
        </FormItem>
      </Form>
      <h3>权限设置</h3>
      <!-- header -->
      <div class="custom-header">
        <Checkbox
          :value="currentPermission.length==allPermission.length"
          :indeterminate="currentPermission.length>0&&currentPermission.length<allPermission.length"
          @on-change="toggleAll"
        >全选</Checkbox>
        <div class="column1">页面菜单</div>
        <div class="column2">权限明细</div>
      </div>
      <!-- table -->
      <Collapse v-model="currentPanel">
        <Panel v-for="(item,index) in permissions" :key="index" :name="'panel'+(index+1)">
          <Checkbox
            :value="categoryPermission[item.key].length==2*item.subCategory.length"
            :indeterminate="categoryPermission[item.key].length>0&&categoryPermission[item.key].length<2*item.subCategory.length"
            @click.native.stop="()=>{}"
            @on-change="toggleSubCategory($event,item.key)"
          >{{item.category}}</Checkbox>
          <table slot="content">
            <tr v-for="(item1,index1) in item.subCategory" :key="index1">
              <td style="position:relative">
                <span>{{item1.title}}</span>
                <more-message
                  style="position:absolute;top:-2px;"
                  v-if="item1.tip"
                  placement="top"
                  :text="item1.tip"
                ></more-message>
              </td>
              <td>
                <CheckboxGroup v-model="categoryPermission[item.key]">
                  <Checkbox :label="item1.view" :style="{visibility:item1.view?'show':'hidden'}">查看</Checkbox>
                  <Checkbox :label="item1.operate">操作</Checkbox>
                </CheckboxGroup>
              </td>
            </tr>
          </table>
        </Panel>
      </Collapse>
    </div>
    <foot-button @onSaveClick="saveRole"></foot-button>
    <!--<div class="bottom">-->
    <!--<Button-->
    <!--class="save-btn"-->
    <!--type="primary"-->
    <!--shape="circle"-->
    <!--@click="saveRole"-->
    <!--perm="role.operate"-->
    <!--&gt;保存</Button>-->
    <!--</div>-->
  </div>
</template>
<script>
import axios from "axios";
import footButton from "COMPONENTS/button/foot-button.vue";

let permissions = require("./permission.json");
const licensePerm = {
  agentPermission: "ENABLE_AGENT",
  areaagentPermission: "ENABLE_AREA_AGENT",
  distributePermission: "ENABLE_DISTRIBUTION",
  cloudStockPermission: "ENABLE_CLOUDSTOCK",
  dealerPermission: "ENABLE_CLOUDSTOCK",
  supplierPermission:"ENABLE_SUPPLIER",
  "financePermission.distribution": "ENABLE_DISTRIBUTION",
  "financePermission.agent": "ENABLE_AGENT",
  "financePermission.cloudstock": "ENABLE_CLOUDSTOCK",
  "financePermission.areaagent": "ENABLE_AREA_AGENT",
  "financePermission.supplier": "ENABLE_SUPPLIER",
  "dealerPermission.authCert": "ENABLE_AUTHCERT",
  "dealerPermission.dealerInvite": "ENABLE_DEALER_INVITE",
  "marketingPermission.rechargeBonus": "ENABLE_RECHARGE_BONUS",
  "marketingPermission.groupBuying": "ENABLE_GROUP_BUYING",
  securityPermission: "ENABLE_SECURITY_CODE",
  livePermission: "ENABLE_LIVE",
  bigscreenPermission: "ENABLE_ADSCREEN",
  "channelPermission.wxapp": "ENABLE_WXAPP",
  "channelPermission.wxwork": "ENABLE_WXWORK",
  "settingPermission.copyright": "!ENABLE_FORCE_HIDE_COPYRIGHT"
};
permissions = permissions.filter(item => {
  item.subCategory = item.subCategory.filter(subItem => {
    if (subItem.key && licensePerm[subItem.key] && licensePerm[subItem.key].substring(0, 1) == "!") {
      return !window.hasLicensePerm(licensePerm[subItem.key].substring(1));
    } else {
      return (
        !Object.keys(licensePerm).includes(subItem.key) ||
        window.hasLicensePerm(licensePerm[subItem.key])
      );
    }
  });
  if (item.key && licensePerm[item.key] && licensePerm[item.key].substring(0, 1) == "!") {
    return !window.hasLicensePerm(licensePerm[item.key].substring(1));
  } else {
    return (
      !Object.keys(licensePerm).includes(item.key) ||
      window.hasLicensePerm(licensePerm[item.key])
    );
  }
});

import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  components: {
    moreMessage,
    footButton
  },
  data() {
    const validateRoleName = (rule, value, callback) => {
      if (!value) {
        callback("请输入角色名");
      } else {
        this.http
          .post("/shop/admin/role/check/name", {
            name: value,
            id: this.$route.query.roleId
          })
          .then(res => {
            if (res.code == 401) {
              callback("名称已存在，请重新输入");
            } else if (res.code == 400) {
              callback("请输入角色名");
            } else {
              callback();
            }
          });
      }
    };
    let allPermission = [];
    permissions.forEach(item => {
      item.subCategory.forEach(subItem => {
        allPermission.push(subItem.view);
        allPermission.push(subItem.operate);
      });
    });
    return {
      formField: {
        name: ""
      },
      rules: {
        name: [{ required: true, validator: validateRoleName, trigger: "blur" }]
      },
      currentPanel: [],
      currentPermission: [],
      categoryPermission: {
        // summaryPermission:[],
        storePermission: [],
        bigscreenPermission: [],
        productPermission: [],
        orderPermission: [],
        memberPermission: [],
        distributePermission: [],
        financePermission: [],
        marketingPermission: [],
        channelPermission: [],
        settingPermission: [],
        agentPermission: [],
        areaagentPermission:[],
        dealerPermission: [],
        cloudStockPermission: [],
        securityPermission: [],
        staffPermission: [],
        livePermission: [],
        supplierPermission:[]
      },
      allPermission: allPermission,
      permissions: permissions
    };
  },
  created() {
    this.currentPanel = this.permissions.map((item, index) => {
      return "panel" + (index + 1);
    });
    if (this.$route.query.roleId) {
      axios
        .get("/shop/admin/role/info", {
          params: {
            id: this.$route.query.roleId
          }
        })
        .then(res => {
          if (res.code == 200) {
            this.formField.name = res.data.role.name;
            this.normalizeData(res.data.perm);
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    }
  },
  watch: {
    categoryPermission: {
      handler(value) {
        if (this.prevPermission) {
          Object.keys(this.categoryPermission).forEach(key => {
            this.interLock(
              this.categoryPermission[key],
              this.prevPermission[key]
            );
          });
        }
        this.prevPermission = Object.assign({}, this.categoryPermission);

        let result = [];
        Object.keys(this.categoryPermission).forEach(key => {
          result = result.concat(this.categoryPermission[key]);
        });
        this.currentPermission = result;
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // change(permission){
    //   var added=[];
    //   var removed=[];
    //   var filtered=[];
    //   permission.forEach(item=>{
    //     var parent=item.split('.')[0];
    //     var child=item.split('.')[1];
    //     if(child=='operate'&&permission.indexOf(parent+".view")==-1){
    //       added.push(parent+".view");
    //     }
    //     if(child=='view'&&permission.indexOf(parent+".operate")==-1){

    //     }
    //   })
    //   permission.filter(item=>{
    //     var parent=item.split('.')[0];
    //     var child=item.split('.')[1];
    //     if(child=='view'){
    //       return true;
    //     }else if(permission.indexOf(parent+".view")==-1)
    //   })
    //   this.currentPermission=permission.concat(added);
    //   console.log(this.currentPermission)
    // },
    toggleSubCategory(value, key) {
      this.categoryPermission[key] = [];
      if (value) {
        this.permissions
          .find(item => {
            return item.key == key;
          })
          .subCategory.forEach(subItem => {
            this.categoryPermission[key].push(subItem.view);
            this.categoryPermission[key].push(subItem.operate);
          });
      }
    },
    toggleAll(value) {
      this.permissions.forEach(item => {
        this.toggleSubCategory(value, item.key);
      });
    },
    //将权限分组展示
    normalizeData(arr) {
      this.permissions.forEach(item => {
        item.subCategory.forEach(subItem => {
          if (arr.indexOf(subItem.view) != -1) {
            this.categoryPermission[item.key].push(subItem.view);
          }
          if (arr.indexOf(subItem.operate) != -1) {
            this.categoryPermission[item.key].push(subItem.operate);
          }
        });
      });
    },
    //实现了查看权限和操作权限的联动
    interLock(newValue, oldValue) {
      // console.log(newValue,oldValue)
      var diff = {
        name: ".",
        added: true
      };
      if (newValue.length > oldValue.length) {
        diff.name = newValue[newValue.length - 1];
      }
      if (newValue.length < oldValue.length) {
        diff.name = oldValue.find(item => {
          return newValue.indexOf(item) == -1;
        });
        diff.added = false;
      }
      var index = diff.name.lastIndexOf(".");
      var parent = diff.name.substring(0, index);
      var child = diff.name.substring(index + 1);
      if (child == "operate" && diff.added) {
        var index = newValue.indexOf(parent + ".view");
        if (index == -1) {
          newValue.push(parent + ".view");
        }
      }
      if (child == "view" && !diff.added) {
        var index = newValue.indexOf(parent + ".operate");
        if (index != -1) {
          newValue.splice(index, 1);
        }
      }
    },
    saveRole() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.currentPermission.length) {
            return this.$Message.error("请至少选择一项角色权限");
          }
          axios
            .post("/shop/admin/role/save", {
              id: this.$route.query.roleId,
              name: this.formField.name,
              perm: this.currentPermission
            })
            .then(res => {
              if (res.code == 200) {
                this.$Message.success("保存成功");
                this.$router.replace("/staff/role-list");
                if (!this.$route.query.roleId) {
                  this.formField.name = "";
                  Object.keys(this.categoryPermission).forEach(key => {
                    this.categoryPermission[key] = [];
                  });
                }
              } else {
                this.$Message.error(res.msg);
              }
            })
            .catch(err => {
              this.$Message.error(err);
            });
        } else {
          this.$Message.error("保存失败");
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.wrapper {
  padding: 40px;
  height: calc(100vh - 120px);
  overflow: auto;
  .custom-header {
    width: 618px;
    position: relative;
    display: flex;
    height: 41px;
    line-height: 41px;
    text-align: center;
    font-weight: bold;
    background: #f8f8f9;
    margin-bottom: 10px;
    /deep/.ivu-checkbox-wrapper {
      position: absolute;
      left: 16px;
    }
    .column1 {
      flex: 1;
    }
    .column2 {
      width: 35%;
    }
  }
  h3 {
    position: relative;
    font-size: 14px;
    line-height: 1;
    color: #464c5b;
    margin-bottom: 20px;
    &:before {
      position: absolute;
      content: "";
      width: 4px;
      height: 18px;
      top: -3px;
      left: -16px;
      border-radius: 20px;
      background: #4570ea;
    }
  }
  /deep/.ivu-form-item {
    margin-bottom: 40px;
  }
  table {
    width: 100%;
    line-height: 48px;
    border-collapse: collapse;
    text-align: center;
    tr:not(:last-child) td {
      border-bottom: 1px solid #e8eaec;
    }
    td:first-child {
      border-right: 1px solid #e8eaec;
    }
    tr:hover {
      background: #f8f9fd;
    }
    td:last-child {
      width: 35%;
    }
  }
  /deep/.more-message {
    margin-left: 5px;
    vertical-align: text-bottom;
  }
  /deep/.ivu-input-wrapper {
    width: 260px;
    height: 32px;
  }
  /deep/.ivu-collapse {
    width: 618px;
  }
  /deep/.ivu-collapse-header {
    height: 41px;
    line-height: 41px;
    background: #f5f6f7;
    font-weight: bold;
    .ivu-icon {
      float: right;
      line-height: 41px;
    }
  }

  /deep/.ivu-collapse-content,
  /deep/.ivu-collapse-content-box {
    padding: 0;
  }
  /deep/.ivu-checkbox {
    margin-right: 5px;
  }
  /deep/.ivu-checkbox-group-item:first-child {
    margin-right: 20px;
  }
  /deep/.ivu-form-item-error-tip {
    font-size: 12px;
    color: #f73610;
  }
}
.bottom {
  position: absolute;
  width: 100%;
  bottom: 0;
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-top: 1px solid #ececec;
  .save-btn {
    width: 110px;
    height: 34px;
  }
}
</style>