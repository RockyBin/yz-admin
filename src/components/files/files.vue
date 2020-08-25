<template>
  <Modal
    v-model="modalStatus"
    :title="title"
    :styles="{ top: '50px' }"
    :width="1010"
    @on-ok="onSubmit"
  >
    <!--相关库的标签，暂时没用，以后会用到(比如会有我的文件、公共库文件之类)-->
    <!--<div v-if="tabs.length > 1" class="tabs-menu">
      <a :class="['tab-handle',currentTab=='files' ? 'active' : '']" href="#" @click="switchTab('files')">图片</a>
      <a :class="['tab-handle',currentTab=='icons' ? 'active' : '']" href="#" @click="switchTab('icons')">图标</a>
    </div>-->
    <div class="my-container" v-if="currentTab == 'files'">
      <div class="group-container">
        <div class="group-list">
          <div
            :class="['group-item', folderId == '' ? 'active' : '']"
            @click="onFolderClick('', '')"
          >
            全部图片
          </div>
          <div
            v-for="(item, index) in folderList"
            :key="index"
            :class="['group-item', folderId == item.id ? 'active' : '']"
            @click="onFolderClick(item.id, item.name)"
            @dblclick="addOrEditFolder(item)"
          >
            {{ item.name }}
            <Icon
              type="md-close"
              @click="deleteFloder(item.id)"
              class="delete-icon"
              :class="[
                'delete-icon',
                folderId == item.id && totalFiles == 0 ? 'delete-icon-show' : ''
              ]"
            ></Icon>
          </div>
          <div class="group-item-space"></div>
        </div>
        <div class="new-group" v-show="totalFolder < 100">
          <div class="new-button" @click="addOrEditFolder(false)">
            <span class="plus">+</span> 新建分组
          </div>
        </div>
      </div>
      <div class="file-container">
        <div class="file-addrbar">
          <div class="upload">
            <Upload
              multiple
              :before-upload="onUploadFile"
              action="/core/siteadmin/resourcemanage/file/upload"
            >
              <Button type="primary">上传图片</Button>
            </Upload>
          </div>
          <div class="search">
            <div>
              <Input
                v-model="fileKeyword"
                :maxlength="30"
                style="width:200px"
                placeholder="请输入关键词"
                clearable
              />
              <Button @click="onSearchFile" style="margin-left:10px"
                >搜索</Button
              >
            </div>
          </div>
        </div>
        <div class="file-list">
          <div class="list1">
            <div v-if="totalFiles == 0" class="nofile">当前条件下没有文件</div>
            <div style="height:322px; flex: 1;padding-top:10px;">
              <div
                v-for="(item, index) in fileList"
                :key="index"
                :class="['file-item', hasSelected(item) ? 'selected' : '']"
                href="#"
                @click="onFileClick(item)"
                @mouseenter="fileHover(item.id)"
                @mouseleave="fileLeave()"
              >
                <div class="file-img">
                  <div
                    v-if="isImage(item.path)"
                    class="img"
                    :style="
                      'background-image:url(' +
                        getFileFullPath(item.path) +
                        ');'
                    "
                  ></div>
                  <div v-else class="document">{{ item.type }} 文档</div>
                </div>
                <div class="file-name">{{ item.name }}</div>
                <div
                  v-if="!hasSelected(item) && curHoveFileId == item.id"
                  class="btn-del"
                >
                  <Icon type="md-close-circle" @click.stop="delFile(item.id)" />
                </div>
                <div v-if="hasSelected(item)" class="check"></div>
              </div>
            </div>
            <Spin fix v-if="uploading">
              <Icon
                type="ios-loading"
                size="50"
                class="demo-spin-icon-load"
              ></Icon>
              <div>上传中，请稍候</div>
            </Spin>
          </div>
          <div class="list2">
            <div class="selected-tips">
              已选择 ({{ selectedFiles.length }}) 张
            </div>
            <div
              v-for="(item, index) in selectedFiles"
              :key="index"
              :class="['file-item', max == 1 ? 'just1' : '']"
            >
              <div class="file-img">
                <div
                  v-if="isImage(item.path)"
                  class="img"
                  :style="
                    'background-image:url(' + getFileFullPath(item.path) + ');'
                  "
                ></div>
                <div v-else class="document">{{ item.type }} 文档</div>
                <div class="btn-del">
                  <Icon type="md-close-circle" @click="unSelectFile(item)" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pages">
          <Page
            :total="totalFiles"
            size="small"
            :page-size="pageSize"
            :current="currentFilePage"
            @on-change="onFilePageChange"
            @on-page-size-change="onPageSizeChange"
            show-elevator
          />
        </div>
      </div>
    </div>
    <Modal
      class="modal-newfolder"
      v-model="newFolderModalStatus"
      :title="modalTitle"
      :width="446"
      :loading="modalLoading"
      @on-visible-change="$refs.formValidate.resetFields()"
      @on-ok="onNewFolderSubmit"
    >
      <div style="height: 133px;padding: 24px;">
        <Form
          ref="formValidate"
          :model="newFolderName"
          :rules="ruleValidate"
          :label-width="95"
        >
          <FormItem label="文件夹名称：" prop="name" :show-message="false">
            <Input
              v-model="newFolderName.name"
              style="width: 303px;vertical-align: top;"
              :maxlength="20"
              placeholder="请输入名称"
            />
            <span
              style="position: absolute;right: 0;color: #9EA4B1;padding-right: 7px;"
              >{{ newFolderName.name.length }}/20</span
            >
          </FormItem>
        </Form>
      </div>
    </Modal>
  </Modal>
</template>
<script type="text/ecmascript-6">
import "@/assets/scrollbar.less";
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    /**
     * 对话框标题
     */
    title: {
      type: String,
      default: "我的图片"
    },
    /** 最多可以选多少个文件 */
    max: {
      type: Number,
      default: 1
    },
    /** fileTypes */
    fileTypes: {
      type: String,
      default: "image"
    },
    /**
     * 要显示的tab有哪些
     */
    tabs: {
      type: Array,
      default: function() {
        return ["files"];
      }
    }
  },
  data() {
    return {
      firstLoad: true,
      modalStatus: false,
      fileKeyword: "",
      fileList: [],
      currentFilePage: 1,
      pageSize: 10,
      totalFiles: 0,
      folderList: [],
      folderId: "",
      curHoveFileId: 0,
      selectedFiles: [],
      newFolderModalStatus: false,
      editFolderNameID: 0,
      modalTitle: "新建文件夹",
      newFolderName: {
        name: ""
      },
      ruleValidate: {
        name: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value.replace(/^\s+|\s+$/, "")) {
                return callback();
              }
              return callback(new Error(""));
            }
          }
        ]
      },
      curFolder: "",
      uploading: false,
      modalLoading: true,
      currentTab: "",
      totalFolder: 0
    };
  },
  created() {
    this.currentTab = this.tabs[0];
  },
  watch: {
    // 弹窗显示
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
        if (this.modalStatus && this.firstLoad) {
          //只有在窗口打开时才加载数据，如果已经加载过，就不再加载
          this.getFolderList();
          this.getFileList();
          this.firstLoad = false;
        }
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    }
  },
  methods: {
    /**
     * 切换标签
     */
    switchTab(current) {
      this.currentTab = current;
    },
    /**
     * 点击确定
     */
    onSubmit() {
      var ret = [];
      this.selectedFiles.forEach(element => {
        if (/^icon:/i.test(element.path)) ret.push(element.path);
        else ret.push(this.$store.state.siteComdataPath + element.path);
      });
      this.$emit("onSelected", ret);
      this.modalStatus = false;
      this.selectedFiles = [];
    },
    /**
     * 选中文件夹
     */
    onFolderClick(id, name) {
      if (this.folderId != id) {
        this.curFolder = name;
        this.folderId = id;
        this.fileKeyword = "";
        this.currentFilePage = 1;
        this.getFileList();
      }
    },
    /**
     * 选中文件
     */
    onFileClick(file) {
      if (this.max == 1) this.selectedFiles = []; //当只能选一个文件时，先清空已选文件列表，以便让新选的文件替换原来的文件
      if (this.max == this.selectedFiles.length) {
        this.$Message.error({
          content: "最多只能选择" + this.max + "个文件",
          duration: 2
        });
        return;
      }
      var found = false;
      this.selectedFiles.forEach(element => {
        if (element.path == file.path) {
          found = true;
        }
      });
      if (!found) this.selectedFiles.push(file);
      //当只能选图标，并且只能选一个时，直接返回
      if (this.tabs[0] == "icons" && this.tabs.length == 1 && this.max == 1) {
        this.onSubmit();
      }
    },
    /**
     * 取消选中文件
     */
    unSelectFile(file) {
      var gindex = -1;
      this.selectedFiles.forEach((element, index) => {
        if (element.path == file.path) {
          gindex = index;
        }
      });
      if (gindex > -1) {
        this.selectedFiles.splice(gindex, 1);
      }
    },
    /**
     * 删除文件夹
     */
    deleteFloder(id) {
      let data = { id: id };
      this.$httpPost(
        "/core/siteadmin/resourcemanage/folder/delete",
        data,
        res => {
          if (res.code != 200) {
            this.$Message.error({
              content: res.msg,
              duration: 2
            });
          } else {
            this.$Message.success({
              content: "删除成功！",
              duration: 2
            });
            this.getFolderList();
            if (id == this.folderId) {
              // if (this.totalFolder == 0) {
              //   this.folderId = "";
              // } else {
              //   this.folderId = this.folderList[this.totalFolder - 1]['id'];
              // }
              this.folderId = "";
              this.fileKeyword = "";
              this.currentFilePage = 0;
              this.getFileList();
            }
          }
        }
      );
    },
    /**
     * 新建文件夹
     */
    onNewFolderSubmit() {
      this.$refs["formValidate"].validate(valid => {
        if (!valid) {
          this.$Message.error({
            content: "请输入文件夹名称",
            duration: 2
          });
          this.modalLoading = false;
          this.$nextTick(() => {
            this.modalLoading = true;
          })
        } else {
          let data = { name: this.newFolderName.name };
          let url = "/core/siteadmin/resourcemanage/folder/add";
          if (this.editFolderNameID > 0) {
            data['id'] = this.editFolderNameID;
            url = "/core/siteadmin/resourcemanage/folder/rename";
          }
          this.$httpPost(
            url,
            data,
            res => {
              if (res.code != 200) {
                this.$Message.error({
                  content: res.msg,
                  duration: 2
                });
                this.modalLoading = false;
                this.$nextTick(() => {
                  this.modalLoading = true;
                })
                return;
              }
              this.newFolderModalStatus = false;
              this.newFolderName = {
                name: ""
              };
              this.getFolderList();
            }
          );
        }
      })
    },
    /**
     * 获取文件夹列表
     */
    getFolderList() {
      let data = { sort_key: "id", sort_direction: "asc" };
      this.$httpGet("/core/siteadmin/resourcemanage/folder/list", data, res => {
        if (res.code == 200) {
          this.folderList = res.data.list || [];
          this.totalFolder = res.data.total;
        } else {
          this.$Message.error({
              content: res.msg,
              duration: 2
            });
        }
      });
    },
    /**
     * 获取文件列表
     */
    getFileList() {
      let data = {
        page: this.currentFilePage,
        page_size: this.pageSize,
        keyword: this.fileKeyword,
        folder_id: this.folderId,
        type: this.fileTypes,
        sort_key: "id",
        sort_direction: "desc"
      };
      this.$httpGet("/core/siteadmin/resourcemanage/file/list", data, res => {
        this.currentFilePage = Number(res.data.current);
        this.totalFiles = res.data.total;
        this.fileList = res.data.list || [];
      });
    },
    /**
     * 分页切换
     */
    onFilePageChange(index) {
      this.currentFilePage = index;
      this.getFileList();
    },
    /**
     * 页数变化
     */
    onPageSizeChange(size) {
      this.pageSize = size;
      this.getFileList();
    },
    /**
     * 搜索文件
     */
    onSearchFile() {
      this.fileKeyword.replace(/^\s+|\s+$/, "");
      this.currentFilePage = 1;
      this.getFileList();
    },
    /**
     * 清除所有查询条件
     */
    resetFileQueryParams() {
      this.folderId = "";
      this.fileKeyword = "";
      this.currentFilePage = 1;
      this.curFolder = "";
    },
    /**
     * 上传文件
     */
    onUploadFile(file) {
      let fileData = new FormData();
      this.uploading = true;
      fileData.append("file", file);
      fileData.append("folder_id", this.folderId);
      this.$httpUpload(
        "/core/siteadmin/resourcemanage/file/upload",
        fileData,
        res => {
          if (res.code != 200) {
            this.$Message.error({
              content: res.msg,
              duration: 2
            });
            this.uploading = false;
            return;
          }
          this.fileKeyword = "";
          this.currentFilePage = 1;
          this.uploading = false;
          this.getFileList();
        }
      );
      return false;
    },
    hasSelected(item) {
      var found = false;
      this.selectedFiles.forEach(element => {
        if (element.path == item.path) {
          found = true;
        }
      });
      return found;
    },
    /**
     * 获取用户上传文件的完整路径
     */
    getFileFullPath(path) {
      return this.$store.state.siteComdataPath + path;
    },
    /**
     * 获取文件是否为图片
     */
    isImage(path) {
      return /\.(gif|jpg|png|jpeg)$/i.test(path);
    },
    /**
     * 删除文件
     */
    delFile(id) {
      this.$Modal.confirm({
        title: "删除确认",
        content: "删除文件后不能恢复，确认吗？",
        okText: "删除",
        cancelText: "取消",
        loading: true,
        onOk: () => {
          let data = { id: id };
          this.$httpPost(
            "/core/siteadmin/resourcemanage/file/delete",
            data,
            res => {
              if (res.code != 200) {
                this.$Message.error({
                  content: res.msg,
                  duration: 2
                });
                return;
              }
              this.$Modal.remove();
              this.getFileList();
            }
          );
        }
      });
    },
    fileHover(id) {
      if (window["timeout_file"]) clearTimeout(window["timeout_file"]);
      this.curHoveFileId = id;
    },
    fileLeave() {
      window["timeout_file"] = setTimeout(() => {
        this.curHoveFileId = 0;
      }, 100);
    },
    addOrEditFolder(item) {
      if (item === false) {
        this.editFolderNameID = 0;
      } else {
        this.modalTitle = "修改文件夹";
        this.newFolderName = { name: item.name };
        this.editFolderNameID = item.id;
      }
      this.newFolderModalStatus = true;
    }
  }
};
</script>
<style lang="less" scoped>
/deep/.ivu-modal-body {
  padding: 0px 0px !important;
}
.my-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 465px;

  .group-container {
    width: 150px;
    display: flex;
    flex-direction: column;
    background-color: #f9fbfd;

    .new-group {
      height: 67px;
      border-right: 1px solid #e9e9e9;
      text-align: center;

      .new-button {
        background-color: #fff;
        border: solid 1px #e9e9e9;
        border-radius: 5px;
        width: 100px;
        height: 28px;
        line-height: 24px;
        font-size: 13px;
        color: #464c5b;
        margin: 20px auto 0 auto;
        cursor: pointer;
        .plus {
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
    .group-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: auto;
    }
    .group-item-space {
      flex: 1;
      border-right: 1px solid #e9e9e9;
    }
    .group-item {
      display: flex;
      text-align: center;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 0 10px;
      height: 72px;
      text-align: center;
      position: relative;
      border-right: 1px solid #e9e9e9;
      color: #464c5b;
      cursor: pointer;
      flex-shrink: 0;
      word-break: break-all;
      &:first-child {
        border-top: none;
      }
      .delete-icon {
        display: none;
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 20px;
        cursor: pointer;
      }
      .delete-icon:hover {
        font-size: 24px;
      }

      &.active {
        border-top: 1px solid #e9e9e9;
        border-bottom: 1px solid #e9e9e9;
        border-right: 1px solid white;
        background: #fff;
        &:first-child {
          border-top: none;
        }
        .delete-icon-show {
          display: block;
        }
      }
      &.active::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 4px;
        background-color: #4570ea;
        border-radius: 2px;
      }
    }
  }

  /deep/.file-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 20px;

    .file-addrbar {
      height: 60px;
      line-height: 60px;
      padding-top: 17px;
      display: flex;
      align-items: center;
      justify-items: center;

      .upload {
        flex: 1;

        .ivu-upload {
          .ivu-btn {
            width: 80px;
            height: 32px;
            padding: 0 0 4px 0;
            text-align: center;
          }
        }
      }
      .search {
        width: 278px;
        > div {
          margin-top: -10px;
          text-align: right;
        }
        .ivu-btn {
          width: 50px;
          height: 32px;
          padding: 0 0 4px 0;
          text-align: center;
        }
      }
    }
    .pages {
      width: 100%;
      height: 90px;
      padding-top: 50px;
      text-align: center;
    }
    .file-list {
      flex: 1;
      position: relative;
      display: flex;
      height: 322px;
      .list1 {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
        margin-right: 10px;

        .file-item {
          position: relative;
          display: inline-block;
          margin-right: 16px;
          margin-bottom: 16px;
          padding: 10px 10px 0 10px;
          border-radius: 5px;
          border: solid 1px #e5e5e5;

          &.selected {
            border: 1px solid #fd8f1e;
          }

          &:hover {
            border: 1px solid #fd8f1e;
          }
        }
        .file-item:nth-child(5n) {
          margin-right: 0;
        }
        .file-name {
          text-align: center;
          overflow: hidden;
          height: 32px;
          line-height: 32px;
          word-break: keep-all;
          width: 100px;
        }
        .file-img {
          width: 100px;
          height: 100px;
          position: relative;

          .img {
            width: 100%;
            height: 100%;
            position: relative;
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
          }
          .document {
            position: absolute;
            width: 100%;
            height: 100%;
            line-height: 100%;
            text-align: center;
          }
        }
        .btn-del {
          position: absolute;
          cursor: pointer;
          top: -12px;
          right: -10px;
          background-color: #fff;
          i {
            font-size: 20px;
          }
        }
        .check {
          position: absolute;
          top: 0;
          right: 0;
          width: 25px;
          height: 25px;
          background-image: url(../../../public/images/check.png);
          background-repeat: no-repeat;
          background-size: 100% 100%;
        }
      }
      .list2 {
        width: 130px;
        border: solid 1px #e9e9e9;
        border-radius: 5px;
        padding: 13px 10px;
        margin-top: 10px;
        height: 100%;
        overflow-y: auto;
        .file-item {
          width: 46px;
          height: 46px;
          border-radius: 5px;
          border: 1px solid #e5e5e5;
          display: inline-block;
          margin-bottom: 10px;
          position: relative;

          &.just1 {
            width: 80px;
            height: 80px;
            margin-left: 15px;
          }

          &:nth-child(odd) {
            float: right;
          }

          .btn-del {
            display: none;
            position: absolute;
            top: -12px;
            right: -10px;
            cursor: pointer;
            background-color: #fff;
            border-radius: 10px;
            i {
              font-size: 20px;
            }
          }
          &:hover .btn-del {
            display: block;
          }

          .file-img {
            width: 100%;
            height: 100%;
            position: relative;

            .img {
              width: 100%;
              height: 100%;
              position: relative;
              background-position: center;
              background-repeat: no-repeat;
              background-size: contain;
              border-radius: 5px;
            }
            .document {
              position: absolute;
              width: 100%;
              height: 100%;
              line-height: 100%;
              text-align: center;
            }
          }
        }
        .selected-tips {
          text-align: center;
          color: #666;
          margin-bottom: 13px;
        }
      }
    }
    /deep/.ivu-page-item-active {
      background-color: #4a6af5;
      border-radius: 2px;
      a {
        color: white;
      }
    }
    .nofile {
      height: 300;
      line-height: 300px;
      width: 100%;
      font-size: 14px;
      text-align: center;
    }
  }
  .modal-newfolder {
    padding: 30px;
  }
}
</style>
