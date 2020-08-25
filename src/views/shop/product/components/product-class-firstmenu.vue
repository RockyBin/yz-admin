<template>
  <div>
    <vuedraggable :list="list" filter=".disable-drag" :preventOnFilter="false">
      <div v-for="(item,index) in list" :key="index">
        <ul class="first-menu">
          <li class="class-name">
            <Icon
              class="dropdown"
              type="md-arrow-dropright"
              :style="{opacity:isHaveIcon(item)}"
              size="20"
              v-if="!currentClassStatus['coll-'+item.id]"
              @click="clickToDropdown(item.id)"
            />
            <Icon
              v-else
              class="dropdown"
              type="md-arrow-dropdown"
              :style="{opacity:isHaveIcon(item)}"
              size="20"
              @click="clickToDropdown(item.id)"
            />
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
              placeholder="请输入一级分类名称"
            />
            <Icon class="md-add" type="md-add" size="18" />
            <span style="font-size: 12px;" @click="addSecondClass(item.childClass,item.id)">添加二级分类</span>
          </li>
          <!-- <li class="foods-count"></li> -->
          <li class="show">
            <button class="table-success" v-if="item.status">显示</button>
            <button class="table-error" v-else>隐藏</button>
          </li>
          <li class="hide-or-delete">
            <div class="box">
              <button
                @click="onHide(item,index)"
                v-if="!item.status"
                :disabled="isDisable"
                :class="{isShow:item.isDisable}"
                perm="product.class.operate"
              >显示</button>
              <button
                @click="onHide(item,index)"
                v-else
                :disabled="isDisable"
                :class="{isShow:item.isDisable}"
                perm="product.class.operate"
              >隐藏</button>
              <span></span>
              <button class="right" @click="onDelete(item,index)" perm="product.class.operate">删除</button>
            </div>
          </li>
        </ul>
        <secondmenu
          ref="second"
          class="secondemu"
          v-model="item.childClass"
          :secondData="item.childClass"
          v-show="currentClassStatus['coll-'+item.id]"
        ></secondmenu>
      </div>
    </vuedraggable>
  </div>
</template>
<script>
import vuedraggable from "vuedraggable";
import secondmenu from "./product-class-secondmenu.vue";
import { truncate } from "fs";

export default {
  components: {
    vuedraggable,
    secondmenu
  },
  data() {
    return {
      list: [],
      currentClassStatus: {},
      isDisable: false, //按钮重复点击
      imgSrc: "images/sample/placeholder.png"
    };
  },
  props: {
    firstClass: {
      type: Array,
      default() {
        return [];
      }
    },
    firstClassStatus: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  watch: {
    firstClass: {
      handler(val) {
        this.list = val;
      },
      deep: true,
      immediate: true
    },
    firstClassStatus: {
      handler(val) {
        this.currentClassStatus = val;
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
    clickToDropdown(index) {
      this.$set(
        this.currentClassStatus,
        "coll-" + index,
        !this.currentClassStatus["coll-" + index]
      );
    },
    onHide(item, index) {
      if (this.isDisable) return;
      this.isDisable = true;
      item.status = !item.status;
      item.childClass.forEach(el => {
        el.status = item.status;
      });
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
      let flag = false;
      item.childClass.forEach(sub => {
        if (sub.id == 0) {
          flag = true;
        }
      });

      if (item.childClass.length > 0 && item.id != 0) {
        if (!flag) {
          this.$httpGet(
            "/shop/admin/product/class/count/" + item.id,
            {},
            res => {
              if (res.code == 200) {
                this.$Modal.confirm({
                  title: "提示",
                  content:
                    "<p>当前一级分类【" +
                    item.class_name +
                    "】下有<span style='color:red'>" +
                    item.childClass.length +
                    "</span>个二级分类，关联<span style='color:red'>" +
                    res.data.count +
                    "</span>个商品，删除后将对一级和二级的分类数据全部清空，是否确定继续删除？</p>",
                  onOk: () => {
                    this.commonDeleteRequest(item, index);
                  }
                });
              }
            }
          );
        } else if (flag) {
          this.commonModal(item, index);
        } else {
          this.commonModalTwo(index);
        }
      } else if (item.childClass.length <= 0 && item.class_name != "") {
        this.commonModal(item, index);
      } else {
        this.commonModalTwo(index);
      }
    },
    addSecondClass(childClass, id) {
      let tempObj = {};

      for (var key in childClass[0]) {
        tempObj[key + ""] = childClass[0][key];
      }

      tempObj["class_name"] = "";
      tempObj["image"] = null;
      tempObj["file"] = null;
      tempObj["preview"] = "";
      tempObj["parent_id"] += 1;
      tempObj["id"] = 0;
      tempObj["product_count"] = 0;
      tempObj["status"] = 1;
      tempObj["notNull"] = false;
      childClass.unshift(tempObj);
      this.currentClassStatus["coll-" + id] = true;
    },
    fileSelected(index) {
      this.deleteImage(index);
      if (this.$refs.upload[index].files[0]) {
        this.list[index]["file"] = this.$refs.upload[index].files[0];
        //图片类型判断
        const fileTypes = [".jpg", ".jpeg", ".png"];
        const pathFile = this.list[index]["file"].name;

        if (pathFile) {
          let isNext = false;
          const fileEnd = pathFile.substring(pathFile.lastIndexOf("."));
          for (var i = 0; i < fileTypes.length; i++) {
            if (fileTypes[i] == fileEnd) {
              isNext = true;
              break;
            }
          }

          if (isNext != true) {
            this.deleteImage(index);
            this.$Message.error("图片格式不正确，请重新选择！");
          } else {
            this.$set(
              this.list[index],
              "preview",
              URL.createObjectURL(this.list[index]["file"])
            );
            this.list[index]["addText"] = "";
            this.list[index]["notNull"] = true;
          }
        }
      }
    },
    deleteImage(index) {
      this.list[index]["file"] = null;
      this.$set(this.list[index], "preview", "");
      this.list[index]["image"] = null;
      this.list[index]["notNull"] = false;
      this.list[index]["addText"] = "+";
    },
    imgSelect(item, index) {
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
    isHaveIcon(item) {
      if (item.childClass.length > 0) {
        return 1;
      } else {
        return 0;
      }
    },
    immediatelyDelete(index) {
      this.list.splice(index, 1);
      this.$Message.success("删除操作成功");
    },
    commonDeleteRequest(item, index) {
      if (item.class_name != "") {
        this.$httpPost(
          "/shop/admin/product/class/delete/" + item.id,
          {},
          res => {
            if (res.code == 200) {
              this.immediatelyDelete(index);
            }
          }
        );
      } else {
        this.immediatelyDelete(index);
      }
    },
    commonModal(item, index) {
      this.$httpGet("/shop/admin/product/class/count/" + item.id, {}, res => {
        if (res.code == 200) {
          this.$Modal.confirm({
            title: "提示",
            content:
              "<p>当前一级分类【" +
              item.class_name +
              "】下关联<span style='color:red'>" +
              res.data.count +
              "</span>个商品，" +
              "删除后将对一级分类数据全部清空，是否确定继续删除？</p>",
            onOk: () => {
              this.commonDeleteRequest(item, index);
            }
          });
        }
      });
    },
    commonModalTwo(index) {
      this.$Modal.confirm({
        title: "提示",
        content: "<p>是否确定删除？</p>",
        onOk: () => {
          this.immediatelyDelete(index);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.first-menu {
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
        outline: none;
        cursor: pointer;
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

    span {
      color: #4a6af5;
      cursor: pointer;
    }

    .dropdown {
      margin-left: 27px;
      cursor: pointer;
    }

    .md-add {
      margin-top: -3px;
      color: #4a6af5;
      cursor: pointer;
    }

    .container {
      width: 24px;
      height: 24px;
      line-height: 24px;
      position: absolute;
      top: 13px;
      left: 63px;

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
        left: 16px;
        top: -8px;
        display: none;
        border-radius: 50%;
        background: #fff;
        cursor: pointer;
      }
    }

    input {
      width: 300px;
      height: 32px;
      margin: 9px 15px 8px 11px;
      border: 1px solid #dcdee2;
      border-radius: 5px;
      padding: 10px 0 10px 41px;
      outline: none;
    }

    .words {
      width: 20px;
      height: 11px;
      line-height: 11px;
      left: 329px;
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
    box-sizing: border-box;
  }
}

.handle {
  float: left;
  padding-top: 10px;
  padding-bottom: 10px;
  background: #3f66d3;
}
</style>

