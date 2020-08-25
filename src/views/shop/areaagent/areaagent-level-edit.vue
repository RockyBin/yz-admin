<template>
  <div class="area-agent-level-edit">
    <div class="content">
      <verticalLineTitlebar title="等级信息" style="margin-bottom:20px;"/>
      <Form ref="form" :model="formData" :rules="rules" :label-width="100">
        <FormItem label="等级名称：" prop="name">
          <Input v-model="formData.name" :maxlength="10" placeholder="请输入等级名称" style="width:260px;">
            <span slot="suffix">{{formData.name?formData.name.length:0}}/10</span>
          </Input>
        </FormItem>
        <FormItem class="special-align" label="返佣比例：" prop="commission.province">
          省代<InputNumber v-model="formData.commission.province" placeholder="请输入" style="width:160px;margin:0 5px 0 10px;" :min="0" :max="100" :step="1" :precision="3"></InputNumber>%
        </FormItem>
        <FormItem class="special-align" prop="commission.city">
          市代<InputNumber v-model="formData.commission.city" placeholder="请输入" style="width:160px;margin:0 5px 0 10px;" :min="0" :max="100" :step="1" :precision="3"></InputNumber>%
        </FormItem>
        <FormItem class="special-align" prop="commission.district">
          区代<InputNumber v-model="formData.commission.district" placeholder="请输入" style="width:160px;margin:0 5px 0 10px;" :min="0" :max="100" :step="1" :precision="3"></InputNumber>%
        </FormItem>
        <FormItem class="special-line-height">
          <span class="tips">*当前设置的区域返佣模式为【级差总拨比】模式</span>
          <more-message :maxWidth="350" style="margin-left: 10px;" text="级差总拨比：下级返佣比例不能超过上级的比例。如：设置省代为10%，市代7%，区代5%；当有市代时，市代拿7%，省代拿3%；当有区代时，区代拿5%，市代拿2%，省代拿3%"></more-message>
        </FormItem>
      </Form>
    </div>
    <div class="footer">
      <Button
        type="primary"
        shape="circle"
        @click="saveSetting"
        :loading="saveLoading"
        perm="area.agent.level.operate"
      >保存</Button>
    </div>
  </div>
</template>
<script>
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  components: {
    verticalLineTitlebar,
    moreMessage
  },
  data() {
    const validator = (rule, value, callback) => {
      var province = this.formData.commission.province;
      var city = this.formData.commission.city;
      var district = this.formData.commission.district;
      if(value == null) {
        callback("请输入返佣比例");
      } else if(province > city && city > district || province >= 0 && city == 0 && district == 0) {
        this.$refs.form.fields.forEach(item => {
          if(item.fieldValue != null && item.prop != "name") {
            item.validateState = "success"
          }
        })
        callback();
      } else if(rule.field == "commission.province") {
        if(city >= province) {
          callback("请输入正确的规则：省代 > 市代 > 区代");
        } else {
          callback();
        }
      } else if(rule.field == "commission.city") {
        if(city >= province || district >= city) {
          callback("请输入正确的规则：省代 > 市代 > 区代");
        } else {
          callback();
        }
      } else if(rule.field == "commission.district") {
        if(district >= city) {
          callback("请输入正确的规则：省代 > 市代 > 区代");
        } else {
          callback();
        }
      }
    }
    return {
      saveLoading: false,
      formData: {
        name: "",
        commission: {
          province: 0,
          city: 0,
          district: 0
        }
      },
      rules: {
        name: [{required: true, message: "请输入等级名称", trigger: "blur"}],
        "commission.province": [{required: true, validator: validator, trigger: "blur"}],
        "commission.city": [{required: true, validator: validator, trigger: "blur"}],
        "commission.district": [{required: true, validator: validator, trigger: "blur"}]
      }
    }
  },
  created() {
    if(this.$route.query.id) {
      this.getSetting();
    }
  },
  methods: {
    getSetting() {
      this.$httpGet("/shop/admin/area/agent/level/info", {
        id: this.$route.query.id
      }, res => {
        if(res.code == 200) {
          this.formData.name = res.data.name;
          this.formData.commission = res.data.commission;
        } else {
          this.$Message.error(res.msg);
        }
      })
    },
    saveSetting() {
      this.$refs.form.validate((valid) => {
        if(valid) {
          this.saveLoading = true;
          var data = {...this.formData, id: this.$route.query.id || undefined};
          this.$httpPost("/shop/admin/area/agent/level/edit", data, res => {
            this.saveLoading = false;
            if(res.code == 200) {
              this.$Message.success("保存成功");
              if(!this.$route.query.id) {
                this.$refs.form.resetFields();
              }
              this.$router.replace("/areaagent/level");
            } else {
              this.$Message.error(res.msg);
            }
          })
        } else {
          this.$Message.error("保存失败");
        }
      })
    }
  }
}
</script>
<style lang='less' scoped>
.area-agent-level-edit {
  .content {
    height: calc(100vh - 120px);
    padding: 24px 24px 0;
    /deep/.ivu-input-suffix {
      width: 38px;
      line-height: 32px;
      text-align: left;
    }
    .special-align {
      /deep/.ivu-form-item-error-tip {
        left: 32px;
      }
    }
    .special-line-height {
      /deep/.ivu-form-item-content {
        line-height: normal;
        .tips {
          color: #9EA7B4;
        }
      }
    }
  }
  .footer {
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-top: 1px solid #eee;
    button {
      width: 70px;
      height: 32px;
    }
  }
}
</style>