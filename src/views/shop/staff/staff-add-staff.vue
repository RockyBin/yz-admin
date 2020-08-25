<template>
  <div class="main-board">
    <div class="wrapper">
      <h3>账号信息</h3>
      <Form ref="form" :model="formField" :rules="rules" :label-width="90">
        <FormItem label="姓名：" prop="name">
          <i-input
            v-model="formField.name"
            placeholder="请输入姓名"
            :maxlength="20"
          >
            <div slot="suffix">
              {{ (formField.name && formField.name.length) || 0 }}/20
            </div>
          </i-input>
        </FormItem>
        <FormItem label="手机：" prop="mobile">
          <Input
            v-model="formField.mobile"
            @input="onPhoneChange"
            placeholder="请输入手机号"
          />
        </FormItem>
        <FormItem label="部门：" prop="department_id">
          <single-select
            style="width:200px"
            placeholder="请选择"
            v-model="formField.department_id"
            :levelList="departmentList"
          />
          <Button
            type="primary"
            style="margin-left:10px;"
            perm="department.operate"
            @click="$router.push({ name: 'departmentList' })"
            >新增</Button
          >
        </FormItem>
        <FormItem label="职位：" prop="position">
          <i-input
            v-model="formField.position"
            :maxlength="30"
            placeholder="请输入职位"
          >
            <div slot="suffix">
              {{ (formField.position && formField.position.length) || 0 }}/30
            </div>
          </i-input>
        </FormItem>
        <FormItem label="头像：" prop="headurl">
          <show-big-img-upload
            imgSize="80px"
            :class="{ 'has-error': imageIsError }"
            :InitImgURLs="logoURL"
            v-model="formField.headurl"
          ></show-big-img-upload>
        </FormItem>
        <FormItem label="登陆账号：" prop="username">
          <i-input
            v-model="formField.username"
            :disabled="roleType == 9"
            placeholder="请输入登录用户名"
            :maxlength="20"
          >
            <div slot="suffix">
              {{ (formField.username && formField.username.length) || 0 }}/20
            </div>
          </i-input>
        </FormItem>
        <FormItem label="角色权限：" prop="role_id">
          <Select
            v-model="formField.role_id"
            :disabled="roleType == 9"
            style="width:200px"
          >
            <Option v-if="roleType === 9" :value="0">系统管理员</Option>
            <Option v-for="role in roleList" :value="role.id" :key="role.id">
              {{ role.name }}
            </Option>
          </Select>
          <Button
            type="primary"
            style="margin-left:10px;"
            perm="role.operate"
            @click="$router.push('/staff/add-role')"
            >新增</Button
          >
        </FormItem>
        <FormItem label="登录密码：" prop="password">
          <Input
            v-model="formField.password"
            type="input"
            :placeholder="
              staffId ? '如不需要重置密码请忽略此项' : '请输入登录密码'
            "
          />
        </FormItem>
        <!-- <FormItem label="确认密码：" prop="password2">
          <Input
            v-model="formField.password2"
            type="password"
            :placeholder="
              staffId ? '如不需要重置密码请忽略此项' : '请再次输入密码'
            "
          />
        </FormItem> -->
        <FormItem label="是否开启" v-show="false">
          <mySwitch
            v-model="formField.status"
            :disabled="roleType == 9"
            :true-value="1"
            :false-value="0"
          >
            <span slot="open">开</span>
            <span slot="close">关</span>
          </mySwitch>
        </FormItem>
      </Form>
    </div>
    <foot-button @onSaveClick="saveStaff" :loading="saveLoading"></foot-button>
    <!--<div class="bottom">-->
    <!--<Button-->
    <!--class="btn-save"-->
    <!--type="primary"-->
    <!--shape="circle"-->
    <!--@click="saveStaff"-->
    <!--perm="staff.operate"-->
    <!--&gt;保存</Button>-->
    <!--</div>-->
  </div>
</template>
<script>
import { Switch } from "iview";
import footButton from "COMPONENTS/button/foot-button.vue";
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue";
import singleSelect from "@/views/shop/components/selector/single-tree-select.vue";
import axios from "axios";
export default {
  components: {
    mySwitch: Switch,
    footButton,
    showBigImgUpload,
    singleSelect
  },
  data() {
    const transform = value => {
      return String(value).trim();
    };
    const staffId = this.$route.query.staffId;
    const editMode = staffId !== undefined;
    const validatePass = (rule, value, callback) => {
      if (!value) {
        if (!editMode) {
          callback(new Error("请输入登录密码"));
        } else {
          callback();
        }
      } else if (!value.match(/^\w+$/)) {
        callback(new Error("密码不支持标点符号或非法字段"));
      } else if (!value.match(/^(?=\w*[0-9])(?=\w*[a-zA-Z])(\w{8,})$/)) {
        callback(new Error("密码不能少于8位数,且必须包含字母和数字"));
      } else {
        // if (this.formField.password2) {
        //   this.$refs.form.validateField("password2");
        // }
        callback();
      }
    };
    // const validatePass2 = (rule, value, callback) => {
    //   if (!value) {
    //     if (!editMode || this.formField.password) {
    //       callback(new Error("请再次输入登陆密码"));
    //     } else {
    //       callback();
    //     }
    //   } else if (value !== this.formField.password) {
    //     callback(new Error("两次输入的密码不一致！"));
    //   } else {
    //     callback();
    //   }
    // };
    return {
      formField: {
        username: "",
        role_id: "",
        name: "",
        position: "",
        department_id: 0,
        mobile: "",
        headurl: "",
        password: "",
        // password2: "",
        status: 1
      },
      saveLoading: false,
      staffId,
      rules: {
        username: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value || !value.trim()) {
                callback(new Error("请输入登录用户名"));
              } else {
                this.$httpPost(
                  "/shop/admin/staff/check/username",
                  {
                    id: this.$route.query.staffId || "",
                    username: value && value.trim()
                  },
                  res => {
                    if (res.code == 200) {
                      callback();
                    } else if (res.code === 401) {
                      callback(new Error("登录账号已存在，请重新输入"));
                    } else {
                      this.$Message.error(res.msg);
                    }
                  }
                );
              }
            },
            trigger: "blur",
            transform
          }
        ],
        role_id: [
          {
            required: true,
            message: "请选择角色权限",
            trigger: "change",
            type: "number"
          }
        ],
        name: [
          {
            required: true,
            message: "请输入姓名",
            trigger: "blur",
            transform
          }
        ],
        password: [
          { required: true, validator: validatePass, trigger: "blur" }
        ],
        // password2: [
        //   { required: true, validator: validatePass2, trigger: "change" }
        // ],
        department_id: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error("请选择部门"));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ],
        mobile: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("请输入手机号"));
              } else if (!/^1[0-9]\d{9}$/.test(value)) {
                callback(new Error("手机号格式不正确"));
              } else {
                this.$httpPost(
                  "/shop/admin/staff/check/mobile",
                  { id: this.$route.query.staffId || "", mobile: value.trim() },
                  res => {
                    if (res.code == 200) {
                      callback();
                    } else if (res.code === 401) {
                      callback(new Error("手机号已存在，请重新输入"));
                    } else {
                      this.$Message.error(res.msg);
                    }
                  }
                );
              }
            },
            trigger: "blur"
          }
        ]
      },
      roleList: [],
      departmentList: [],
      roleType: 0,
      imageIsError: false,
      logoURL: ""
    };
  },
  created() {
    axios
      .get("/shop/admin/staff/info", {
        params: {
          id: this.$route.query.staffId
        }
      })
      .then(res => {
        if (res.code == 200) {
          this.roleList = res.data.role_list;
          let departmentList = [];
          res.data.department_list.forEach(m => {
            departmentList.push(m);
            m.sub_list.forEach(n => {
              departmentList.push(n);
            });
          });
          this.departmentList = departmentList;

          if (this.$route.query.staffId) {
            this.formField = {
              username: res.data.admin.username,
              role_id: res.data.admin.role_id,
              name: res.data.admin.name,
              status: res.data.admin.status,
              position: res.data.admin.position,
              department_id: res.data.admin.department_id,
              mobile: res.data.admin.mobile,
              headurl: res.data.admin.headurl
            };
            this.logoURL = res.data.admin.headurl;
            this.roleType = res.data.admin.role_type;
          }
        } else {
          this.$Message.error(res.msg);
        }
      })
      .catch(err => {
        console.log(err);
        this.$Message.error(err);
      });
  },
  methods: {
    onPhoneChange(value) {
      value = value || "";
      this.$nextTick(() => {
        this.$set(this.formField, "mobile", value.replace(/\D/g, ""));
      });
    },
    saveStaff() {
      this.saveLoading = true;
      this.$refs.form.validate(async valid => {
        if (valid) {
          let headurl =
            (this.formField.headurl.length && this.formField.headurl[0]) || "";
          if (typeof headurl === "object") {
            let formData = new FormData();
            formData.append("head_image", this.formField.headurl[0]);
            await new Promise(resolve => {
              this.$httpPost(
                "/shop/admin/staff/upload/headimg",
                formData,
                res => {
                  if (res.code === 200) {
                    headurl = res.data.headurl;
                    resolve();
                  } else {
                    this.$Message.error(res.msg);
                    this.saveLoading = false;
                  }
                }
              );
            });
          }
          let data = {
            id: this.$route.query.staffId,
            username: this.formField.username && this.formField.username.trim(),
            password: this.formField.password,
            role_id: this.formField.role_id,
            name: this.formField.name && this.formField.name.trim(),
            position: this.formField.position,
            department_id: this.formField.department_id,
            mobile: this.formField.mobile,
            status: this.formField.status
          };
          if (headurl) {
            data.headurl = headurl;
          }
          axios
            .post("/shop/admin/staff/save", data)
            .then(res => {
              if (res.code == 200) {
                this.$Message.success("保存成功");
                this.$router.replace("/staff/staff-list");
                if (!this.$route.query.staffId) {
                  this.$refs.form.resetFields();
                }
              } else {
                this.$Message.error(res.msg);
              }
            })
            .catch(err => {
              this.$Message.error(err);
            })
            .finally(() => {
              this.saveLoading = false;
            });
        } else {
          this.saveLoading = false;
          this.$Message.error("保存失败");
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.main-board {
  height: 100%;
  .wrapper {
    padding: 40px;
    height: calc(100vh - 120px);
    overflow: auto;
    h3 {
      position: relative;
      font-size: 14px;
      margin-bottom: 30px;
      &:before {
        position: absolute;
        content: "";
        width: 4px;
        height: 18px;
        left: -16px;
        top: 0px;
        border-radius: 20px;
        background: #4570ea;
      }
    }
    /deep/.ivu-select,
    /deep/.ivu-input-wrapper {
      width: 260px !important;
      height: 32px !important;
      .ivu-input-suffix {
        line-height: 32px;
        left: auto;
        width: 42px;
        padding-right: 10px;
        text-align: right;
      }
      .ivu-input-with-suffix {
        padding-right: 45px;
      }
    }
    /deep/.ivu-form-item {
      margin-bottom: 30px;
    }
  }
  .bottom {
    position: absolute;
    width: 100%;
    bottom: 0;
    line-height: 50px;
    text-align: center;
    border-top: 1px solid #e8e8e8;
    .btn-save {
      width: 110px;
      height: 34px;
    }
  }
}
</style>
