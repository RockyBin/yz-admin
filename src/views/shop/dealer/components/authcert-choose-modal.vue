<template>
  <div>
    <Modal
      class="main-modal"
      title="选择授权证书"
      v-model="showModal"
      :loading="modalLoading"
      :width="759"
      @on-ok="onComfirmClick"
    >
      <!-- 模板展示 -->
      <Tabs value="name1" :animated="false">
        <TabPane label="授权证书" name="name1"></TabPane>
      </Tabs>
      <div class="poster-choose-modal-content">
        <div class="poster-choose-modal-list">
          <div class="poster-choose-modal-list-content">
            <div
              class="poster-choose-modal-list-flex"
              v-for="(item, index) in listData"
              :key="index"
            >
              <!-- 其余使用循环显示的海报 -->
              <div class="poster-choose-modal-list-item">
                <div class="poster-choose-modal-list-item-img">
                  <img
                    :src="item.preview_image ? http.defaults.baseURL + '/' + item.preview_image : defaultImage"
                  />
                  <div
                    class="poster-choose-modal-list-item-position"
                    :class="{'show-mask': selectItem && selectItem.id === item.id}"
                  >
                    <Button
                      type="primary"
                      @click="selectTemplate(index)"
                      :class="{'hide-button': selectItem && selectItem.id === item.id}"
                      v-if="!selectItem || selectItem.id !== item.id"
                    >使用</Button>
                    <Button
                      v-else
                      :style="{'background':'rgb(252,138,40)','outline': 'none','border': 'none','color': '#fff','width': '84px','height': '32px'}"
                    >
                      <Icon type="md-checkmark" color="#fff" :size="22" />已选择
                    </Button>
                  </div>
                </div>
                <div class="poster-choose-modal-list-item-name">{{item.name}}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="poster-choose-modal-loading" v-if="loading">
          <Spin size="large"></Spin>
        </div>
      </div>
      <Page
        :total="total"
        size="small"
        :page-size="posterPageSize"
        :current="currentPage"
        show-elevator
        @on-change="onPageChange"
      />
      <div class="poster-choose-modal-select" v-if="selectItem && selectItem.name">已选：{{selectItem.name}}</div>
    </Modal>
  </div>
</template>
<script>
export default {
  props: ["value", "currentItem"],
  data() {
    return {
      showModal: false,
      currentPage: 1,
      posterPageSize: 8,
      total: 0,
      modalLoading: true,
      loading: false,
      listData: [],
      defaultImage: require("./../images/poster_default.png"),
      selectItem: null // 选中的模板
    };
  },
  watch: {
    value(val) {
      this.showModal = val;
    },
    currentItem: {
      handler(val) {
        this.selectItem = val;
      },
      immediate: true
    },
    showModal(val) {
      this.$emit("input", val);
      if (!val) {
        this.selectItem = this.currentItem;
      } else {
        if(this.listData.length == 0) {
          this.getList();
        }
      }
    }
  },
  methods: {
    onComfirmClick() {
      if (!this.selectItem) {
        this.modalLoading = false;
        this.$Message.error("请选择授权证书");
        this.$nextTick(() => {
          this.modalLoading = true;
        });
        return;
      }
      this.$emit("onOk", this.selectItem);
      this.showModal = false;
    },
    /**
     * 获取列表数据
     */
    getList() {
      this.loading = true;
      this.$httpGet(
        "/shop/admin/dealer/authcert/list",
        {
          page: this.currentPage,
          page_size: this.posterPageSize
        },
        res => {
          this.loading = false;
          if (res.code === 200) {
            this.listData = res.data.list;
            this.total = res.data.total;
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    onPageChange(val) {
      this.currentPage = val;
      this.getList();
    },
    // 选择模板
    selectTemplate(index) {
      this.selectItem = this.listData[index];
    }
  }
};
</script>
<style lang="less" scoped>
.main-modal {
  /deep/.ivu-modal {
    .ivu-modal-body {
      padding: 0 24px;
      .ivu-tabs {
        display: none;
        .ivu-tabs-bar {
          border-bottom: none;
          margin-bottom: 10px;
          .ivu-tabs-ink-bar {
            width: 40px !important;
            height: 4px;
            right: 16px;
            margin: auto;
          }
          .ivu-tabs-tab {
            padding: 16px 1px 10px;
            font-size: 13px;
            &.ivu-tabs-tab-active {
              color: #4570ea;
            }
          }
        }
      }
    }
  }
  .poster-choose-modal-content {
    position: relative;
    height: 371px;
    background-color: #f5f6f7;
    border-radius: 4px;
    margin-top: 24px;
    .poster-choose-modal-list {
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 0 25px 16px;
      .poster-choose-modal-list-content {
        overflow: hidden;
        margin-right: -18px;
      }
    }
    .poster-choose-modal-loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 1px solid #f5f6f7;
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.9);
      /deep/.ivu-spin {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        width: 32px;
        height: 32px;
        margin: auto;
      }
    }
  }
  .poster-choose-modal-select {
    position: absolute;
    left: 16px;
    bottom: 0;
    line-height: 60px;
  }
  /deep/.ivu-page {
    text-align: right;
    padding: 12px 6px 22px;
  }
  // 循环显示模板
  .poster-choose-modal-list-flex {
    float: left;
    margin-left: 60px;
    font-size: 0;
    &:nth-child(4n + 1) {
      margin-left: 0;
    }
    .poster-choose-modal-list-item {
      display: inline-block;
      margin-top: 16px;
      width: 120px;
      .poster-choose-modal-list-item-img {
        position: relative;
        height: 210px;
        width: 100%;
        box-shadow: 0px 3px 10px -5px rgba(0, 0, 0, 0.5);
        img {
          height: 210px;
          width: 100%;
          border-radius: 4px;
        }
        .poster-choose-modal-list-item-position {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 210px;
          background: rgba(0, 0, 0, 0.5);
          cursor: pointer;
          opacity: 0;
          border-radius: 4px;
          &:hover {
            opacity: 1;
          }

          /deep/.ivu-btn-default,
          /deep/.ivu-btn-primary {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          /deep/.ivu-btn-default {
            span {
              height: 32px;
              line-height: 22px;
              vertical-align: baseline;
            }
            .ivu-icon {
              font-size: 20px !important;
              position: relative;
              top: -2px;
              left: -4px;
            }
          }

          /deep/.ivu-btn-primary {
            z-index: 2;
          }
          .hide-button {
            display: none;
          }
        }

        .show-mask {
          opacity: 1;
        }
      }

      .poster-choose-modal-list-item-name {
        height: 28px;
        text-align: center;
        margin-top: 18px;
        color: #464c5b;
        font-size: 14px;
        font-weight: bold;
        line-height: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
}
</style>