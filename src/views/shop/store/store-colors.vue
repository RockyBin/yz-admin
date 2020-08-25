<template>
  <div class="store-colors" v-show="!$store.state.COMMON_loading">
    <Tabs value="name1">
      <TabPane label="店铺色系" name="name1">
        <div class="store-colors-content">
          <div class="store-colors-list">
            <div class="store-colors-list-left">
              <div class="store-colors-list-left-title">选择配色方案</div>
              <div class="store-colors-list-left-colors">
                <div
                  class="store-colors-list-left-item"
                  v-for="(item, index) in colorList"
                  :key="index"
                >
                  <div
                    class="store-colors-list-left-content"
                    :class="{'active': item.id === styleColorId,'in-use':item.id===inUseColorId}"
                    @click="onSelectStyleColorClick(item.id)"
                  >
                    <div
                      class="store-colors-list-left-text"
                    >{{item.title + (item.id === inUseColorId ? '（使用中）':'')}}</div>
                    <div class="store-colors-list-left-default" :style="{'background': item.color}"></div>
                    <div
                      class="store-colors-list-left-hover"
                      :style="'background:' + item.mainColor"
                    ></div>
                    <div
                      class="store-colors-list-left-active"
                      :style="'background:' + item.secondaryColor"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="store-colors-list-right">
              <div class="store-colors-list-right-title">风格示例效果：</div>
              <div class="store-colors-list-right-content">
                <div
                  class="store-colors-list-flex"
                  v-for="(item, index) in showListData"
                  :key="index"
                >
                  <div
                    class="store-colors-list-item"
                    v-for="(item1, index1) in item"
                    :key="index1"
                    :style="item1.hide ? 'opacity: 0;' : ''"
                  >
                    <div class="store-colors-list-item-img">
                      <img :src="item1.hide ? '': (http.defaults.baseURL + item1.image_url)">
                    </div>
                    <div class="store-colors-list-item-name">{{item1.page_name}}</div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="store-colors-button">
            <Button
              type="primary"
              shape="circle"
              @click="onSaveStyleColorClick"
              :loading="saveLoading"
              perm="color.operate"
            >{{saveLoading ? '保存中' : '保存并发布'}}</Button>
          </div>
        </div>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import { getStyle } from "iview/src/utils/assist";
import { on, off } from "iview/src/utils/dom";
let hideData = {
  hide: true
};
export default {
  data() {
    return {
      styleColorId: 0,
      inUseColorId:0,
      saveLoading: false,
      widthNum: 3, // 默认每行显示三个
      colorList: []
    };
  },
  computed: {
    // 计算要显示的数据项
    showListData() {
      let listData = [];
      let listItem = [];
      this.listData.forEach(item => {
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
    },
    listData() {
      let selectItem = this.colorList.filter(
        item => item.id === this.styleColorId
      );
      return selectItem.length ? selectItem[0].images : [];
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getStoreColorInfo();
  },
  mounted() {
    on(window, "resize", this.handleResize);
    this.handleResize();
  },
  methods: {
    /**
     * 获取配色数据
     */
    getStoreColorInfo() {
      this.http({
        url: "/shop/admin/ui/style/color"
      })
        .then(res => {
          if (res.code === 200) {
            let colorList = res.data.list || [];
            this.styleColorId = res.data.style_color_id;
            this.inUseColorId = res.data.style_color_id
            this.colorList = colorList.map(item => {
              return {
                id: item.id,
                title: item.color_info.name,
                images: item.color_info.images,
                color: this.colorDulpFun(
                  [
                    item.color_info.gradient_color1,
                    item.color_info.gradient_color2
                  ].join(",")
                ),
                mainColor: item.color_info.main_color,
                secondaryColor: /#f*$/.test(item.color_info.secondary_color)
                  ? item.color_info.secondary_color +
                    ";box-shadow: inset 0 0 0 1px #e5e5e5;"
                  : item.color_info.secondary_color
              };
            });
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(() => {
          this.$Message.error("获取数据失败");
        })
        .finally(() => {
          this.$store.state.COMMON_loading = false;
        });
    },
    /**
     * 改变选择色系
     */
    onSelectStyleColorClick(id) {
      this.styleColorId = id;
    },
    /**
     * 保存色系
     */
    onSaveStyleColorClick() {
      this.saveLoading = true;
      this.http({
        url: "/shop/admin/ui/style/color/edit",
        method: "POST",
        data: {
          color_id: this.styleColorId
        }
      })
        .then(res => {
          if (res.code === 200) {
            this.$Message.success("保存成功");
            this.inUseColorId = this.styleColorId;
          } else {
            this.$Message.error(res.msg);
          }
        })
        .finally(() => {
          this.saveLoading = false;
        });
    },
    /**
     * 页面视图修改
     */
    handleResize() {
      let widthNum =
        Math.floor(
          (parseInt(
            getStyle(this.$el.querySelector(".store-colors-list-flex"), "width")
          ) -
            250) /
            310
        ) + 1;
      this.widthNum = widthNum > 3 ? widthNum : 3;
    },
    /**
     * 兼容渐变
     */
    colorDulpFun(item) {
      return [
        `-webkit-linear-gradient(left,${item})`,
        `-o-linear-gradient(right,${item})`,
        `-moz-linear-gradient(right,${item})`,
        `linear-gradient(to right,${item})`
      ];
    }
  },
  beforeDestroy() {
    off(window, "resize", this.handleResize);
  }
};
</script>
<style lang="less" scoped>
@import "../css/_color-val.less";
.store-colors {
  /deep/.ivu-tabs {
    .ivu-tabs-bar {
      margin-bottom: 0;
      .ivu-tabs-nav {
        margin-left: 5px;
      }
    }
    .store-colors-content {
      height: calc(100vh - 118px);
      .store-colors-list {
        position: relative;
        height: calc(100% - 50px);
        background-color: #f8f9fb;
        overflow-y: auto;
        // 左边色板
        .store-colors-list-left {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 246px;
          background-color: #fff;
          .store-colors-list-left-title {
            font-size: 14px;
            font-weight: bold;
            padding-left: 26px;
            height: 72px;
            line-height: 76px;
          }
          .store-colors-list-left-colors {
            border: 1px solid #dcdee2;
            width: 234px;
            display: inline-block;
            margin-left: 6px;
            .store-colors-list-left-item {
              padding: 6px 2px;
              .store-colors-list-left-content {
                display: flex;
                align-items: center;
                height: 44px;
                cursor:pointer;
                &:hover{
                  background-color: #f8f9fb;
                }
                &.in-use{
                  cursor:default;
                }
                &.active {
                  background-color: #f8f9fb;
                  .store-colors-list-left-text {
                    color: @error-color;
                  }
                }
                .store-colors-list-left-text {
                  font-size: 13px;
                  width: 140px;
                  padding-left: 17px;
                }
                .store-colors-list-left-hover,
                .store-colors-list-left-active,
                .store-colors-list-left-default {
                  width: 24px;
                  height: 24px;
                }
                .store-colors-list-left-active,
                .store-colors-list-left-hover {
                  margin-left: 1px;
                }
              }
            }
          }
        }
        .store-colors-list-right {
          height: 100%;
          position: relative;
          width: calc(100% - 246px);
          margin-left: 246px;
          .store-colors-list-right-title {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            padding-left: 50px;
            height: 72px;
            line-height: 76px;
            font-size: 12px;
          }
          .store-colors-list-right-content {
            height: 100%;
            padding-top: 72px;
            padding-left: 50px;
            padding-right: 50px;
            .store-colors-list-flex {
              display: flex;
              // justify-content: space-between;
              & + div.store-colors-list-flex {
                margin-top: 19px;
              }
              .store-colors-list-item {
                width: 250px;
                margin-right: 38px;
                &:last-child {
                  margin-right: 0;
                }
                .store-colors-list-item-img {
                  position: relative;
                  background-color: #eee;
                  img {
                    width: 100%;
                    display: block;
                  }
                }
                .store-colors-list-item-name {
                  height: 44px;
                  line-height: 44px;
                  font-size: 13px;
                  text-align: center;
                }
              }
            }
          }
        }
      }
      .store-colors-button {
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-top: 1px solid #e2e2e2;
        button {
          width: 100px;
        }
      }
    }
  }
}
</style>
