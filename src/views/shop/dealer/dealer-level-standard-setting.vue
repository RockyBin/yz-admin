<template>
  <div>
    <div class="dealer-level-standard-setting">
      <verticalLineTitlebar title="经销商等级设置"></verticalLineTitlebar>
      <Tabs v-model="settingType" :animated="false" type="card">
        <TabPane label="基础设置" name="base">
          <baseLevelSetting ref="base" :settingData="settingData"></baseLevelSetting>
        </TabPane>
        <TabPane label="升级设置" name="upgrade">
          <upgradeLevelSetting
            ref="upgrade"
            :settingData="settingData.upgrade_condition"
            :initialProductList="settingData.product_list"
            :info="settingData"
          ></upgradeLevelSetting>
        </TabPane>
      </Tabs>
    </div>
    <div class="footer">
      <Button shape="circle" type="primary" @click="saveSetting" perm="dealer.level.operate">保存</Button>
    </div>
  </div>
</template>
<script>
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import baseLevelSetting from "./components/dealer-level-standard-setting-base.vue";
import upgradeLevelSetting from "./components/dealer-level-standard-setting-upgrade.vue";
const deepCopy = obj => {
  return JSON.parse(JSON.stringify(obj));
};
export default {
  components: {
    verticalLineTitlebar,
    baseLevelSetting,
    upgradeLevelSetting
  },
  data() {
    return {
      settingType: "base",
      settingData: {
        weight: null,
        name: "",
        discount: null,
        initial_fee: null,
        min_purchase_money_first: null,
        min_purchase_money: null,
        min_purchase_num_first: null,
        min_purchase_num: null,
        min_take_delivery_num: null,
        auto_upgrade:0,
        status: 1,
        has_hide: 0,
        hide_count: 0, // 隐藏等级个数
        dealer_count: 0, // 使用中经销商人数
        upgrade_condition: {
          product_id: [],
          upgrade: []
        },
        product_list: []
      }
    };
  },
  created() {
    if (this.$route.query.id) {
      this.getSetting(this.$route.query.id);
    } else {
      // product_list的内容不需要上传数据库
      Object.defineProperty(this.settingData, "product_list", {
        enumerable: false
      });
    }
  },
  methods: {
    saveSetting() {
      var promise = Promise.all([
        this.$refs.base.validate(),
        this.$refs.upgrade.validate()
      ]);
      promise
        .then(res => {
          var url = this.$route.query.id
            ? "/shop/admin/dealer/level/edit"
            : "/shop/admin/dealer/level/add";
          var data = Object.assign(
            this.$route.query.id ? { id: this.$route.query.id } : {},
            this.settingData
          );
          this.http
            .post(url, data)
            .then(res => {
              if (res.code == 200) {
                this.$Message.success("保存成功");
                this.$router.replace("/dealer/level/standard");
              } else {
                this.$Message.error(res.msg);
                if(res.code == 405) {
                  this.$refs.base.validate("weight")
                }
                if(res.code == 406) {
                  this.$refs.base.validate("name")
                }
              }
            })
            .catch(err => {
              this.$Message.error(err);
            });
        })
        .catch(rej => {
          this.settingType = rej;
          this.$Message.error("保存失败");
        });
    },
    getSetting(id) {
      this.$store.state.COMMON_loading = true;
      this.http
        .post("/shop/admin/dealer/level/info", { id })
        .then(res => {
          this.$store.state.COMMON_loading = false;
          if (res.code == 200) {
            //this.settingData = res.data.info;
            for(var key in res.data.info){
              if(res.data.info[key] !== null) {
                this.$set(this.settingData,key,res.data.info[key]);
              }
            }
            this.settingData.product_list = res.data.info.product_list;
            this.settingData.discount = Number(this.settingData.discount);
            this.settingData.initial_fee = Number(this.settingData.initial_fee);
            // product_list的内容不需要上传数据库
            Object.defineProperty(this.settingData, "product_list", {
              enumerable: false
            });
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
.dealer-level-standard-setting {
  padding: 24px;
  height: calc(100vh - 122px);
  overflow: auto;
  .vertical-line-titlebar-wrapper {
    margin-bottom: 20px;
  }
  /deep/.ivu-tabs-bar {
    margin-bottom: 20px !important;
  }
}
.footer {
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-top: 1px solid #eee;
  background: white;
  button {
    width: 70px;
  }
}
</style>