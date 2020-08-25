<template>
<div class="marketing-recharge-discount">
  <div class="main-content">
    <switch-titlebar 
      v-model="status" 
      title="是否开启充值优惠功能" 
      :tipShow="status" 
      tipText="开启后，根据设定的规则充值赠送用户金额；系统不对赠金做任何处理。若开启此功能，建议关闭【余额提现】功能 , <a href='#/setting/mall/getCash' class='table-operation' perm='withdraw.config.view'>前往设置</a>"
    />
    <Form v-if="status" ref="form" :model="model" :labelWidth="100">
      <FormItem class="ivu-form-item-required" label="充值优惠规则：">
        <div v-for="(item,index) in model.bonus" :key="index" class="row">
          <span class="text">每充值</span>
          <formItem 
            :prop="'bonus.'+index+'.recharge'" 
            :rules="{trigger:'blur', validator:createValidator(index,'recharge')}"
          >
            <InputNumber v-model="item.recharge" :min="1" :max="9999999.99" :precision="2" placeholder="请输入"></InputNumber>
          </formItem>
          <span class="text">元， 送</span>
          <formItem 
            :prop="'bonus.'+index+'.bonus'"
            :rules="{trigger:'blur', validator:createValidator(index,'bonus')}"
          >
            <InputNumber v-model="item.bonus" :min="1" :max="9999999.99" :precision="2" placeholder="请输入"></InputNumber>
          </formItem>
          <span class="text">元</span>
          <span class="table-operation" @click="deleteRule(index)">删除</span>
        </div>
        <Button
          class="btn-add"
          type="primary"
          shape="circle"
          icon="md-add"
          @click="addRules"
        >添加规则</Button><span v-show="showErrorTip" class="error-tip">至少添加一条规则</span>
      </FormItem>
    </Form>
  </div>
  <div class="footer">
    <Button type="primary" shape="circle" @click="validate" perm="rechargebonus.operate">保存</Button>
  </div>
</div>
</template>
<script>
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
export default {
  components: {
    switchTitlebar
  },
  data() {
    return {
      status: 0,
      model:{
        bonus: [],
      }
    }
  },
  computed: {
    showErrorTip() {
      return this.status && !this.model.bonus.length
    }
  },
  created() {
    this.getSetting();
  },
  methods: {
    addRules() {
      this.model.bonus.push({
        recharge: null,
        bonus: null
      })
    },
    deleteRule(index) {
      this.model.bonus.splice(index,1);
      for(var i = 0; i < this.model.bonus.length; i++) {
        if(this.model.bonus[i].recharge) {
          this.$refs.form.validateField('bonus.'+i+'.recharge');
        }
      }
    },
    createValidator(index,field) {
      var oldValue = null;
      return (rule, value, callback) => {
        
        if(field == "bonus") {
          if(!value) {
            return callback("请输入优惠规则");
          } else {
            return callback();
          }
        } else {
          if(value) {
            if(this.model.bonus.filter(item => item.recharge == value).length > 1) {
              callback("已存在相同规则，重新输入");
            } else {
              callback()
              if(value != oldValue) {
                oldValue = value;
                for(var i = 0; i < this.model.bonus.length; i++) {
                  if(this.model.bonus[i].recharge) {
                    this.$refs.form.validateField('bonus.'+i+'.recharge');
                  }
                }
              }
            }
          } else {
            return callback("请输入优惠规则");
          }
        }
      }
    },
    getSetting() {
      this.$store.state.COMMON_loading = true;
      this.http.get("/shop/admin/promotions/rechargebonus/info").then(res => {
        if(res.code == 200) {
          this.model.bonus = res.data.bonus;
          this.status = res.data.status;
          this.model.bonus.forEach(item => {
            item.recharge = Number(item.recharge)
            item.bonus = Number(item.bonus)
          })
        } else {
          this.$Message.error(res.msg);
        }
      }).catch(err => {
        this.$Message.error(err);
      }).finally(() => {
        this.$store.state.COMMON_loading = false;
      })
    },
    validate() {
      if(this.status && !this.model.bonus.length) {
        return this.$Message.error("保存失败")
      } else if (!this.status) {
        return this.saveSetting()
      } else {
        return this.$refs.form.validate((valid) => {
          if(valid) {
            this.saveSetting()
          } else {
            this.$Message.error("保存失败");
          }
        })
      }
    },
    saveSetting() {
      this.$store.state.COMMON_loading = true;
      this.http.post("/shop/admin/promotions/rechargebonus/save",{
        status: this.status,
        bonus: this.model.bonus
      }).then(res => {
        if(res.code == 200) {
          this.$Message.success("保存成功");
        } else {
          this.$Message.error(res.msg);
        }
      }).catch(err => {
        this.$Message.error(err);
      }).finally(() => {
        this.$store.state.COMMON_loading = false;
      })
    }
  }
}
</script>
<style lang="less" scoped>
  .marketing-recharge-discount {
    .main-content {
      padding: 24px;
      height: calc(100vh - 120px);
      overflow: auto;
      /deep/.ivu-form {
        .ivu-btn-primary {
          width: 90px;
          height: 32px;
          padding: 5px 10px;
          vertical-align: baseline;
          margin-right: 20px;
        }
        .error-tip {
          color: #ed4014;
          font-size: 12px;
          white-space: nowrap;
        }
        .row {
          .text {
            margin-right: 5px;
          }
          .table-operation {
            margin-left: 20px;
          }
          .ivu-form-item {
            display: inline-block;
            margin-right: 5px;
            .ivu-input-number {
              width: 120px;
            }
          }
        }
      }
    }
    .footer{
      height:50px;
      line-height:50px;
      text-align:center;
      border-top:1px solid #eee;
      .ivu-btn{
        width: 70px;
      }
    }
  }
</style>