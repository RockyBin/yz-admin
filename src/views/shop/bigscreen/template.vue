<template>
  <div class="store-page-new">
    <!-- <Tabs value="name1">
    <TabPane :label="tabName" name="name1">-->
    <div class="store-page-new-content">
      <h3>选择模版</h3>
      <div class="store-page-new-list">
        <!-- <div class="store-page-new-list-title">请选择页面模板</div> -->
        <div class="store-page-new-list-content">
          <div class="store-page-new-list-flex" v-for="(item, index) in showListData" :key="index">
            <div
              class="store-page-new-list-item"
              v-for="(item1, index1) in item"
              :key="index1"
              :style="item1.hide ? 'opacity: 0;' : ''"
            >
              <div class="store-page-new-list-item-img">
                <img v-if="item1.image" :src="'/sysdata/template/' + item1.image" />
                <div class="store-page-new-list-item-position">
                  <Button @click="newPage(item1)" type="primary">使用</Button>
                  <Button v-if="item1.is_blank != 1" @click="preview(item1.demo_url)">预览</Button>
                </div>
              </div>
              <div class="store-page-new-list-item-name">{{item1.name}}</div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
      <Page
        :total="total"
        :page-size="pageSize"
        :current="currentPage"
        @on-change="onPageChange"
        show-elevator
      />
    </div>
    <!-- </TabPane>
    </Tabs>-->
  </div>
</template>
<script>
import { getStyle } from "iview/src/utils/assist";
import { on, off } from "iview/src/utils/dom";
const hideData = {
  hide: true
};
export default {
  data() {
    return {
      total: 0,
      pageSize: 20,
      currentPage: 1,
      widthNum: 4, // 默认每行显示四个
      tplList: [],
      tabName: "店铺模板"
    };
  },
  mounted() {
    if (this.$route.query.tabName) this.tabName = this.$route.query.tabName;
    this.loadData();
    on(window, "resize", this.handleResize);
    this.handleResize();
  },
  computed: {
    showListData() {
      let listData = [];
      let listItem = [];
      this.tplList.forEach(item => {
        if (listItem.length >= this.widthNum) {
          listData.push(listItem);
          listItem = [item];
        } else {
          listItem.push(item);
        }
      });
      while (listItem.length > 0 && listItem.length < this.widthNum) {
        listItem.push(hideData);
      }
      listData.push(listItem);
      return listData;
    }
  },
  methods: {
    handleResize() {
      let widthNum =
        Math.floor((parseInt(getStyle(this.$el, "width")) - 205) / 300) + 1;
      this.widthNum = widthNum > 4 ? widthNum : 4;
    },
    loadData() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/ui/template/list",
          method: "POST",
          data: {
            page: this.currentPage,
            page_size: this.pageSize,
            keyword: "",
	    device_type: 2
          }
        })
          .then(res => {
            if (res.code === 200) {
              this.total = res.data.total;
              this.pageSize = res.data.page_size;
              this.currrentPage = res.data.current;
              this.tplList = res.data.list || [];
            } else {
              this.$Message.error(res.msg);
            }
          })
          .catch(() => {
            this.$Message.error("获取数据失败");
          })
          .finally(() => {
            resolve();
          });
      });
    },
    onPageChange(index) {
      this.currentPage = index;
      this.loadData();
    },
    preview(url) {
      window.open(url);
    },
    showLoading() {
      this.$Spin.show({
        render: h => {
          return h("div", [
            h("Icon", {
              class: "demo-spin-icon-load",
              props: {
                type: "ios-loading",
                size: 40
              }
            }),
            h("div", "正在处理，请稍候...")
          ]);
        }
      });
    },
    hideLoading() {
      this.$Spin.hide();
    },
    newPage(tplInfo) {
      this.showLoading();
      var url =
        "/shop/admin/ui/design/mobile/page/add?template_id=" + tplInfo.id + "&device_type=2";
      this.$httpPost(url, {}, res => {
        this.hideLoading();
        if (res.code == 200) {
          //let name = res.data.type == 1 ? "storeDesignHomeMobile" : "storeDesignMobile";
	  let name = "bigscreenDesignHomeMobile";
          this.$router.push({ name: name, query: { id: res.data.id } });
        } else {
          this.$Message.error({
            content: "新建页面失败：" + res.msg,
            duration: 2
          });
        }
      });
    }
  },
  beforeDestroy() {
    off(window, "resize", this.handleResize);
  }
};
</script>
<style>
.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
</style>
<style lang="less" scoped>
.store-page-new {
  width: 100%;
  .ivu-tabs-bar {
    margin-bottom: 0;
    .ivu-tabs-nav {
      margin-left: 5px;
      .ivu-tabs-ink-bar {
        height: 3px;
      }
    }
  }
  .store-page-new-content {
    height: calc(100vh - 84px);
    padding: 0 30px;
    h3 {
      height: 68px;
      line-height: 68px;
      &:before {
        content: "";
        display: inline-block;
        width: 4px;
        height: 18px;
        border-radius: 20px;
        background: #4570ea;
        vertical-align: middle;
        margin-right: 12px;
      }
    }
    .store-page-new-list {
      height: calc(100% - 146px);
      background-color: #f8f9fb;
      overflow: auto;
      border-radius: 5px;
      .store-page-new-list-title {
        position: absolute;
        width: calc(100% - 20px);
        font-size: 15px;
        color: #081221;
        padding: 27px 24px;
        background-color: #f8f9fb;
      }
      .store-page-new-list-content {
        padding: 30px 46px;
        background: #f8f9fd;
        .store-page-new-list-flex {
          display: flex;
          // justify-content: space-between;
          & + div.store-page-new-list-flex {
            margin-top: 19px;
            min-width: 820px;
          }
          .store-page-new-list-item {
            width: 205px;
            margin-right: 65px;
            &:last-child {
              margin-right: 0;
            }
            .store-page-new-list-item-img {
              position: relative;
              background-color: #eee;
              height: 365px;
              box-shadow: 0px 5px 10px -5px rgba(0, 0, 0, 0.3);
              img {
                width: 100%;
                height: 100%;
              }
              .store-page-new-list-item-position {
                display: none;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-color: rgba(0, 0, 0, 0.6);
                button {
                  width: 95px;
                  height: 32px;
                  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
                  & + button {
                    margin-top: 10px;
                  }
                }
              }
              &:hover {
                .store-page-new-list-item-position {
                  display: flex;
                }
              }
            }
            .store-page-new-list-item-name {
              height: 44px;
              line-height: 44px;
              font-size: 13px;
              text-align: center;
            }
          }
        }
      }
    }
    .ivu-page {
      height: 78px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
}
</style>
