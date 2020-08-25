<template>
  <div class="store-poster-entry">
    <div class="store-poster-entry-nav">
      <template v-for="item in levels">
        <div
          :key="item.id"
          :class="{'active': tabSelectId === item.id}"
          @click="onChangeNavClick(item.id)"
        >
          {{item.name}}
          <i class="iconfont icon-md-checkmark-circle"></i>
        </div>
      </template>
    </div>
    <div class="store-poster-entry-content">
      <div class="store-poster-entry-content-title">证书样式：</div>
      <Button
        type="primary"
        @click="posterModalShow = true"
        v-if="!posterSelectInfo[tabSelectId]"
      >选择证书</Button>
      <div v-else class="store-poster-entry-content-select">
        <img
          :src="posterSelectInfo[tabSelectId].preview_image ? http.defaults.baseURL + '/' + posterSelectInfo[tabSelectId].preview_image : defaultImage"
          alt
        />
        <Button type="primary" perm="dealer.authcert.operate" @click="posterModalShow = true">重新选择</Button>
      </div>
    </div>
    <poster-modal v-model="posterModalShow" :currentItem="selectItem" @onOk="onModalSelectChange"></poster-modal>
    <foot-button>
      <Button
        type="primary"
        perm="dealer.authcert.operate"
        style="width: 70px;padding-left: 0;padding-right: 0;"
        :loading="saveLoading"
        @click="onSaveClick"
      >保存</Button>
    </foot-button>
  </div>
</template>
<script>
import posterModal from "./components/authcert-choose-modal";
import footButton from "@/views/shop/components/button/foot-button.vue";
export default {
  components: {
    posterModal,
    footButton
  },
  data() {
    return {
	  levels: [],
      tabSelectId: 0,
      defaultImage: require("./images/poster_default.png"),
      posterModalShow: false,
      saveLoading: false,
      posterSelectInfo: {}
    };
  },
  created() {
    this.getSettingData();
  },
  computed: {
    selectItem() {
      return this.posterSelectInfo[this.tabSelectId];
    }
  },
  methods: {
    onChangeNavClick(id) {
      this.tabSelectId = id;
    },
    /**
     * 选择海报
     */
    onModalSelectChange(val) {
      this.$set(this.posterSelectInfo, this.tabSelectId, val);
    },
    getSettingData() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet(
        "/shop/admin/dealer/authcert/applysetting/info",
        null,
        res => {
          this.$store.state.COMMON_loading = false;
          if (res.code === 200) {
            this.posterSelectInfo = res.data;
			this.levels = res.data.levels;
			if(this.levels.length > 0) this.onChangeNavClick(this.levels[0].id);
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 保存设置
     */
    onSaveClick() {
      this.saveLoading = true;
      var data = Object.assign({}, this.posterSelectInfo);
      for (var key in data) data[key] = data[key].id;
      this.$httpPost(
        "shop/admin/dealer/authcert/applysetting/save",
        data,
        res => {
          if (res.code === 200) {
            this.saveLoading = false;
            this.$Message.success("保存成功");
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
.store-poster-entry {
  padding: 20px 24px;
  .store-poster-entry-nav {
    display: flex;
    flex-wrap: wrap;
    & > div {
      position: relative;
      width: 172px;
      height: 56px;
      line-height: 56px;
      margin-right: 12px;
      margin-bottom: 12px;
      text-align: center;
      border: 1px solid #dcdee2;
      border-radius: 3px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      &.active {
        border-color: #4a6af5;
        color: #4a6af5;
        i {
          display: initial;
        }
      }
      i {
        display: none;
        position: absolute;
        bottom: -7px;
        right: -7px;
        background: #fff;
        line-height: 14px;
        width: 16px;
        font-size: 18px;
        font-weight: initial;
        color: #4a6af5;
        &::before {
          margin-left: -2px;
        }
      }
    }
  }
  .store-poster-entry-location {
    height: 32px;
    line-height: 32px;
    margin-top: 20px;
    span {
      &:last-child {
        margin-left: 14px;
        cursor: pointer;
      }
    }
    /deep/.more-message {
      line-height: 28px;
      margin-left: 6px;
    }
  }
  .store-poster-entry-content {
    margin-top: 20px;
    justify-content: space-between;
    .store-poster-entry-content-title {
      display: inline-block;
      height: 34px;
      line-height: 34px;
      vertical-align: top;
      margin-right: 14px;
    }
    .store-poster-entry-content-select {
      display: inline-block;
      position: relative;
      width: 160px;
      height: 285px;
      box-shadow: 0px 3px 6px 0px rgba(74, 106, 245, 0.2);
      img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      button {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: none;
        height: 34px;
        color: #fff;
        background-color: rgba(112, 112, 112, 0.8);
        &:focus {
          box-shadow: 0 0 0 2px rgba(112, 112, 112, 0.2);
        }
      }
      &:hover {
        button {
          display: block;
        }
      }
    }
  }
}
</style>
