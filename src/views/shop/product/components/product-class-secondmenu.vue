<template>
  <vuedraggable :list="second_data" filter=".disable-drag" :preventOnFilter="false">
    <div v-for="(item,index) in second_data" :key="index">
      <ul class="second-menu">
        <li class="class-name">
          <div class="left"></div>
          <div class="container">
            <img class="left-img" :src="imgSelect(item,index)" alt />
            <div class="hover-show">
              <div
                :style="{backgroundImage:'url('+hoverShow(item,index)+')'}"
                class="in"
                @click="$refs.upload[index].click()"
              >{{item.addText?item.addText:""}}</div>
            </div>
            <input ref="upload" type="file" hidden @change="fileSelected(index)" />
            <Icon
              class="delete-img"
              type="md-close-circle"
              size="16"
              v-if="item.notNull==false?item.notNull:true"
              @click="deleteImage(index)"
            />
          </div>
          <div class="words">
            <span class="left-word">{{item.class_name.length>8?8:item.class_name.length}}</span>
            <span class="right-word">/8</span>
          </div>
          <input
            type="text"
            v-model="item.class_name"
            maxlength="8"
            class="disable-drag"
            style="font-size: 12px;"
            :class="{showRed:isEmpty(item.class_name)}"
            placeholder="请输入二级分类名称"
          />
        </li>
        <!-- <li class="food-count">{{item.product_count}}</li> -->
        <li class="show">
          <button class="table-success" v-if="item.status">显示</button>
          <button class="table-error" v-else>隐藏</button>
        </li>
        <li class="hide-or-delete">
          <div class="box">
            <button
              @click="onHide(item)"
              v-if="!item.status"
              :disabled="isDisable"
              :class="{isShow:item.isDisable}"
              perm="product.class.operate"
            >显示</button>
            <button
              @click="onHide(item)"
              v-else
              :disabled="isDisable"
              :class="{isShow:item.isDisable}"
              perm="product.class.operate"
            >隐藏</button>
            <span></span>
            <button @click="onDelete(item,index)" class="right" perm="product.class.operate">删除</button>
          </div>
        </li>
      </ul>
    </div>
  </vuedraggable>
</template>

<script>
import vuedraggable from "vuedraggable";

export default {
  components: {
    vuedraggable
  },
  data() {
    return {
      status: 0,
      second_data: [],
      isDisable: false,
      itemClassName: "",
      imgSrc: "images/sample/placeholder.png",
      addText: "+"
    };
  },
  props: {
    secondData: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  watch: {
    secondData: {
      handler(val) {
        this.second_data = val;
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    isEmpty(class_name) {
      if (class_name == "") {
        return true;
      }
    },
    onHide(item) {
      if (this.isDisable) return;
      this.isDisable = true;
      item.status = !item.status;
      item.isDisable = true;

      this.http
        .post("/shop/admin/product/class/status/" + item.id, {
          status: item.status
        })
        .then(res => {
          item.isDisable = this.isDisable = false;
          !item.status
            ? this.$Message.success("隐藏操作成功")
            : this.$Message.success("显示操作成功");
        })
        .catch(err => {
          item.isDisable = this.isDisable = false;
        });
    },
    onDelete(item, index) {
      if (item.class_name != "" && item.id != 0) {
        this.$httpGet("/shop/admin/product/class/count/" + item.id, {}, res => {
          if (res.code == 200) {
            this.$Modal.confirm({
              title: "提示",
              content:
                "<p>当前二级分类关联了<span style='color:red'>" +
                res.data.count +
                "</span>个商品，删除后将对所有的分类数据全部清空，是否确定继续删除？</p>",
              onOk: () => {
                this.$httpPost(
                  "/shop/admin/product/class/delete/" + item.id,
                  {},
                  res => {
                    if (res.code == 200) {
                      this.commonDelete(index);
                    }
                  }
                );
              }
            });
          }
        });
      } else {
        this.$Modal.confirm({
          title: "提示",
          content: "<p>是否确定删除？</p>",
          onOk: () => {
            this.commonDelete(index);
          }
        });
      }
    },
    fileSelected(index) {
      this.deleteImage(index);

      if (this.$refs.upload[index].files[0]) {
        this.second_data[index]["file"] = this.$refs.upload[index].files[0];
        //图片类型判断
        const fileTypes = [".jpg", ".jpeg", ".png"];
        const pathFile = this.second_data[index]["file"].name;

        if (pathFile) {
          let isNext = false;
          const fileEnd = pathFile.substring(pathFile.lastIndexOf("."));
          for (var i = 0; i < fileTypes.length; i++) {
            if (fileTypes[i] == fileEnd) {
              isNext = true;
              break;
            }
          }

          if (!isNext) {
            this.deleteImage(index);
          } else {
            this.$set(
              this.second_data[index],
              "preview",
              URL.createObjectURL(this.second_data[index]["file"])
            );
            this.second_data[index]["addText"] = "";
            this.second_data[index]["notNull"] = true;
          }
        } else {
          return;
        }
      }
    },
    deleteImage(index) {
      this.second_data[index]["file"] = null;
      this.$set(this.second_data[index], "preview", "");
      this.second_data[index]["image"] = null;
      this.second_data[index]["notNull"] = false;
      this.second_data[index]["addText"] = "+";
    },
    imgSelect(item) {
      if (item.image) {
        return this.$store.state.siteComdataPath + item.image;
      } else if (item.preview) {
        return item.preview;
      } else {
        item.addText = "+";
        item.notNull = false;
        return this.imgSrc;
      }
    },
    hoverShow(item, index) {
      if (item.image && item.image != this.imgSrc) {
        return this.$store.state.siteComdataPath + item.image;
      } else if (item.preview) {
        return item.preview;
      } else {
        item.addText = "+";
        item.notNull = false;
      }
    },
    commonDelete(index) {
      this.second_data.splice(index, 1);
      this.$Message.success("删除操作成功");
    }
  }
};
</script>


<style lang="less" scoped>
.second-menu {
  height: 49px;
  line-height: 49px;
  list-style: none;
  display: flex;
  border: 1px solid rgba(200, 200, 200, 0.6);
  border-top: none;
  cursor: default;

  &:hover {
    background-color: #f8f9fd;
  }

  .food-count {
  }

  // .show {
  //   button {
  //     width: 30px;
  //     height: 16px;
  //     line-height: 16px;
  //     font-size: 12px;
  //     outline: none;
  //   }

  //   button.show-one {
  //     background: #8bcd3c;
  //     color: #fff;
  //     border: 1px solid #5daa01;
  //   }

  //   button.hide-one {
  //     background: #cccccc;
  //     color: #657180;
  //     border: none;
  //   }
  // }

  .hide-or-delete {
    text-align: center;
    .box {
      width: 72px;
      height: 11px;
      line-height: 15px;
      display: inline-block;

      button {
        float: left;
        font-size: 12px;
        height: 100%;
        color: #3f66d3;
        border: none;
        background: #fff;
        cursor: pointer;
        outline: none;
      }
      span {
        display: inline-block;
        height: 100%;
        width: 1px;
        background-color: #3f66d3;
      }
      .right {
        float: right;
      }

      .isShow {
        background: #cccccc;
        color: #657180;
        border: none;
        height: 14px;
      }
    }
  }

  .class-name {
    flex: 5;
    text-align: left;
    position: relative;

    .left {
      width: 16px;
      height: 16px;
      margin-left: 58px;
      display: inline-block;
      border-left: 1px solid #000;
      border-bottom: 1px solid #000;
    }

    .container {
      width: 24px;
      height: 24px;
      line-height: 24px;
      position: absolute;
      top: 13px;
      left: 95px;

      &:hover .hover-show {
        display: inline-block;
      }

      &:hover .delete-img {
        display: inline-block;
      }

      .left-img {
        width: 100%;
        height: 100%;
        cursor: pointer;
        object-fit: contain;
      }

      .hover-show {
        position: absolute;
        width: 90px;
        height: 90px;
        border: 1px solid #dcdcdc;
        border-radius: 5px;
        background: #fff;
        top: 30px;
        left: -5px;
        z-index: 2;
        cursor: pointer;
        display: none;

        &::before,
        &::after {
          position: absolute;
          left: 10px;
          content: "";
          border-left: 6px solid transparent;
          border-right: 8px solid transparent;
        }

        &::before {
          top: -5px;
          border-bottom: 6px solid #fff;
          z-index: 2;
        }

        &::after {
          top: -6px;
          border-bottom: 6px solid #dcdcdc;
        }

        .in {
          width: 80px;
          height: 80px;
          line-height: 80px;
          background: #eeeeee;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          position: absolute;
          top: 4px;
          left: 4px;
          right: 4px;
          bottom: 4px;
          color: #c0c2c9;
          font-size: 40px;
          text-align: center;
        }
      }

      .delete-img {
        position: absolute;
        top: -8px;
        left: 15px;
        display: none;
        border-radius: 50%;
        background: #fff;
        cursor: pointer;
      }
    }

    input {
      width: 300px;
      height: 32px;
      margin: 9px 15px 8px 16px;
      border: 1px solid #dcdee2;
      border-radius: 5px;
      padding: 11px 0 9px 42px;
      outline: none;
    }

    .words {
      width: 20px;
      height: 11px;
      line-height: 11px;
      left: 361px;
      top: 21px;
      position: absolute;

      .left-word,
      .right-word {
        color: #999999;
      }
    }

    .showRed {
      border: 1px solid #f73610;
    }
  }

  li {
    flex: 2;
    text-align: center;
  }
}
</style>

