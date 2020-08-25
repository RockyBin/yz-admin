<template>
  <div class="flow-distribution">
    <Form ref="form" :model="formFields" :rules="rules" :label-width="93">
      <switch-titlebar
        style="margin-bottom: 0px;"
        v-model="formFields.status"
        :true-value="1" 
        :false-value="0"
        hasBorder
        title="是否开启员工流量分配功能"
        moreMessage="当没有绑定员工的粉丝/会员进入平台后时，系统根据规则自动随机分配到员工名下"
      >
      <FormItem label="分配对象：">
        <RadioGroup v-model="formFields.people_type">
          <Radio style="margin-right:20px;" :label="1">全部员工（启用状态）</Radio>
          <Radio :label="2">指定员工（启用状态）</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem class="choose-staff" v-show="formFields.people_type==2" label="选择员工：" prop="choosedStaffs">
        <Button type="primary" @click="isShowModal=true">选择</Button>
        <span v-if="formFields.choosedStaffs.length" class="table-operation" style="margin-left:12px;" @click="clearAll">一键清空</span>
        <div v-if="formFields.choosedStaffs.length" class="staff-list">
          <div v-for="(staff,index) in formFields.choosedStaffs" :key="index" class="staff">
            <Icon @click.stop="deleteStaff(index)" type="md-close-circle" size="18" />
            <img :src="staff.headurl?padImgUrl(staff.headurl):'images/head-portrait.png'"/>
            <div class="text">
              <div class="name">{{staff.name}}</div>
              <div v-if="staff.position" class="position">职位：{{staff.position}}</div>
              <div v-if="staff.mobile">手机：{{staff.mobile}}</div>
            </div>
          </div>
        </div>
      </FormItem>
      </switch-titlebar>
    </Form>
    <foot-button  @onSaveClick="saveSetting" perm="staff.allocate.operate"></foot-button>
    <staff-select-modal 
      v-model="isShowModal" 
      :choosedStaffs="formFields.choosedStaffs" 
      @selectChange="formFields.choosedStaffs=$event"
    ></staff-select-modal>
  </div>
</template>
<script>
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import footButton from "COMPONENTS/button/foot-button.vue";
import staffSelectModal from "./components/staff-select-modal.vue"
export default {
  components: {
    switchTitlebar,
    footButton,
    staffSelectModal
  },
  data() {
    const validator = (rule, value, callback) => {
      var isOpen = this.formFields.status;
      var target = this.formFields.people_type
      if(!isOpen || target == 1 || value.length) {
        callback()
      } else {
        callback("请选择至少一名员工")
      }
    }
    return {
      isShowModal: false,
      formFields: {
        status: 0,
        people_type: 1,
        choosedStaffs: []
      },
      rules: {
        choosedStaffs: [{required: true, validator: validator}]
      }
    }
  },
  watch: {
    "formFields.choosedStaffs": function(newVal, oldVal) {
      this.$refs.form.validateField("choosedStaffs")
    }
  },
  created() {
    this.getSetting()
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
    deleteStaff(index) {
      this.formFields.choosedStaffs.splice(index,1);
    },
    clearAll() {
      this.$Modal.confirm({
        title: "提示",
        content: "是否确定清空所有员工？",
        onOk: () => {
          this.formFields.choosedStaffs=[];
          this.$Message.success("删除成功");
        }
      })
    },
    getSetting() {
      this.http.get("/shop/admin/staff/allocation/info").then(res => {
        if(res.code == 200) {
          this.formFields.status = res.data.status;
          this.formFields.people_type = res.data.people_type;
          this.formFields.choosedStaffs = res.data.admins;
        } else {
          this.$Message.error(res.msg)
        }
      }).catch(err => {
        this.$Message.error(err)
      })
    },
    saveSetting() {
      this.$refs.form.validate(valid => {
        if(valid) {
          this.http.post("/shop/admin/staff/allocation/save", {
            status: this.formFields.status,
            type: 1, //分配类型（预留），1=随机，目前只有1
            people_type: this.formFields.people_type,
            admins: this.formFields.choosedStaffs.map(item => {
              return {
                id: item.id,
                name: item.name
              }
            })
          }).then(res => {
            if(res.code == 200) {
              this.$Message.success("保存成功")
            } else {
              this.$Message.error(res.msg)
            }
          }).catch(err => {
            this.$Message.error(err)
          })
        } else {
          this.$Message.error("保存失败")
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.flow-distribution {
  padding: 24px;
  .choose-staff {
    /deep/.ivu-form-item-error-tip {
      position: static;
      display: inline-block;
      margin-left: 12px;
    }
  }
  .staff-list {
    display: flex;
    flex-wrap: wrap;
    background: #f5f6f7;
    padding: 16px 0 0 16px;
    margin-top: 16px;
    .staff {
      position: relative;
      display: flex;
      align-items: center;
      width: 248px;
      height: 80px;
      background: white;
      margin-right: 16px;
      margin-bottom: 16px;
      padding: 14px;
      border-radius: 3px;
      box-sizing: border-box;
      &:hover {
        box-shadow: 0 3px 6px 0 rgba(76,106,245,0.18);
        /deep/.ivu-icon {
          display: block;
        }
      }
      /deep/.ivu-icon {
        display: none;
        position: absolute;
        top: 8px;
        right: 8px;
        cursor: pointer;
      }
      img {
        width: 40px;
        height: 40px;
        object-fit: cover;
        flex-shrink: 0;
        border-radius: 4px;
      }
      .text {
        color: #9EA7B4;
        font-size: 12px;
        line-height: 1.5;
        margin-left: 14px;
        .name {
          width: 140px;
          color:#657180;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .position {
          width: 140px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }
}
</style>