<template>
  <Modal
    v-model="modalStatus"
    :loading="checkInputUrl"
    :title="'链接选择器'"
    class="links-manage"
    :width="620"
    @on-ok="onSubmit"
  >
    <Tabs name="modalLinks" v-model="showTab" :animated="false">
      <TabPane
        tab="modalLinks"
        label="功能页面"
        class="static-url-container"
        name="static"
      >
        <div class="container">
          <Table
            v-if="modalStatus"
            height="418"
            :data="staticUrl"
            :loading="staticLoading"
            :columns="staticColumns"
            :width="572"
          ></Table>
        </div>
      </TabPane>
      <TabPane
        tab="modalLinks"
        label="店铺页面"
        class="page-url-container"
        name="page"
      >
        <div class="page-search">
          <i-input
            v-model="pageListSearchKeyword"
            placeholder="请输入关键字进行搜索"
          >
            <Button
              slot="append"
              icon="ios-search"
              @click="onSearchPageList"
            ></Button>
          </i-input>
        </div>
        <div class="page-list">
          <Table
            v-if="modalStatus"
            height="320"
            :data="pageList"
            class="page-list-container"
            :columns="pageListColumns"
          ></Table>
        </div>
        <div class="page-list-page">
          <Page
            :current="pageListCurrPage"
            :total="pageListTotal"
            :page-size="pageListPageSize"
            :transfer="true"
            @on-page-size-change="onPageListPageSizeChange"
            @on-change="onPageListPageChange"
            size="small"
            show-elevator
            show-sizer
          />
        </div>
      </TabPane>
      <TabPane
        tab="modalLinks"
        label="商品分类"
        class="product-class-container"
        name="product_class"
      >
        <div class="container">
          <div class="table">
            <div class="title">商品分类</div>
            <div class="list">
              <div v-for="(item, index) in sortedClass" :key="index">
                <div class="item" v-if="!item.hide">
                  <div class="name" @click="toggleSub(item)">
                    <span v-for="(s, i) in item.space" :key="i" class="space">
                      <span
                        v-if="s == 'icon'"
                        class="icon"
                        :class="{ isHaveSub: isShow(item) }"
                      >
                        <Icon v-if="item.hidesub" type="md-arrow-dropright" />
                        <Icon v-else type="md-arrow-dropdown" />
                      </span>
                      <span v-else>{{ s }}</span>
                    </span>
                    <span>{{ item.class_name }}</span>
                  </div>
                  <div class="op">
                    <Button
                      v-if="selectedLinkData != item.id"
                      :size="'small'"
                      type="primary"
                      @click="
                        onLinkClick(
                          item.class_name,
                          item.type,
                          item.id,
                          item.url,
                          '商品分类'
                        )
                      "
                      >选择</Button
                    >
                    <Button v-else :size="'small'" type="default" disabled
                      >已选</Button
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPane>
      <TabPane
        tab="modalLinks"
        label="商品详情"
        name="product_detail"
        class="product-detail-container"
      >
        <div class="product-search">
          <i-input
            v-model="productListSearchKeyword"
            placeholder="请输入商品名称"
          >
            <!-- <Select
              v-model="productListSearchClass"
              class="search-class-list"
              slot="prepend"
              style="width: 100px"
            >
              <Option value="-1">全部商品</Option>
              <Option
                v-for="(val, key) in classList"
                :key="key"
                :value="val.id"
                >{{ val.class_name }}</Option
              >
            </Select> -->
            <tree-select
              :data="classTreeList"
              slot="prepend"
              ref="clstree"
              @on-check-change="onSelectClass"
            ></tree-select>
            <Button
              slot="append"
              icon="ios-search"
              @click="onSearchProductList"
            ></Button>
          </i-input>
        </div>
        <div class="product-list">
          <Table
            height="320"
            :data="productList"
            class="product-list-container"
            :columns="productListColumns"
          ></Table>
        </div>
        <div class="product-list-page">
          <Page
            :current="productListCurrPage"
            :total="productListTotal"
            :page-size="productListPageSize"
            :transfer="true"
            @on-page-size-change="onProductListPageSizeChange"
            @on-change="onProductListPageChange"
            size="small"
            show-elevator
            show-sizer
          />
        </div>
      </TabPane>
      <TabPane
        tab="modalLinks"
        label="营销活动"
        name="activity"
        class="product-detail-container"
        v-if="hasLicensePerm('ENABLE_GROUP_BUYING')"
      >
        <div class="product-search activity-search">
          <i-input v-model="activitySearchKeyword" placeholder="请输入活动名称">
            <span slot="prepend" style="font-size:13px;color:#464C5B;">多人拼团</span>
            <Button
              slot="append"
              icon="ios-search"
              @click="onSearchActivity"
            ></Button>
          </i-input>
        </div>
        <div class="product-list">
          <Table
            height="320"
            :data="activityList"
            class="product-list-container"
            :columns="activityColumns"
          ></Table>
        </div>
        <div class="product-list-page">
          <Page
            :current="activityCurrPage"
            :total="activityTotal"
            :page-size="activityPageSize"
            :transfer="true"
            @on-page-size-change="onActivityPageSizeChange"
            @on-change="onActivityPageChange"
            size="small"
            show-elevator
            show-sizer
          />
        </div>
      </TabPane>
      <TabPane tab="modalLinks" label="站外链接" name="external">
        <div class="external-url-container">
          <span class="external-url-title">链接地址：</span>
          <i-input
            placeholder="请输入带有http://或https://的网址链接"
            class="external-url-input"
            v-model="externalUrl"
            @on-blur="onInputExternalUrl"
          ></i-input>
        </div>
        <p class="tips" v-show="checkInputUrl">
          网址必须以 http:// 或者 https:// 开头
        </p>
      </TabPane>
    </Tabs>
    <div class="selected-info" v-show="selectedLinkUrl !== ''">
      已选：{{ selectedTabName }} - {{ selectedLinkName }}
    </div>
  </Modal>
</template>
<script>
import "@/assets/scrollbar.less";
import { setTimeout } from "timers";
import ClassUtil from "@/views/shop/product/components/class-util";
import treeSelect from "@/views/shop/components/selector/class-tree-select.vue";
export default {
  components: {
    treeSelect
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      checkInputUrl: false,
      modalStatus: false,
      hasData: false,
      staticLoading: true,
      showTab: "static",
      selectedLinkName: "", //选择的链接的名称
      selectedLinkType: "", //选择的链接的类型，（如产品分类，产品详情等）
      selectedLinkData: "", //选择的链接的数据，（如类型是产品分类时，data是分类ID，类型是产品详情时，data是产品ID）
      selectedLinkUrl: "", //选择的链接的地址
      selectedTabName: "",

      staticUrl: [],
      staticColumns: [
        {
          title: "页面名称",
          key: "name"
        },
        {
          key: "url",
          title: " ",
          align: "right",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type:
                      this.selectedLinkUrl == params.row.url
                        ? "default"
                        : "primary",
                    disabled: this.selectedLinkUrl == params.row.url,
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.onLinkClick(
                        params.row.name,
                        params.row.type,
                        "",
                        params.row.url,
                        "功能页面"
                      );
                    }
                  }
                },
                this.selectedLinkUrl == params.row.url ? "已选择" : "选择"
              )
            ]);
          }
        }
      ],

      classList: [],
      sortedClass: [],

      productList: [],
      productUrl: "",
      productUrlType: "",
      productListColumns: [
        {
          title: "商品信息",
          key: "name",
          width: 230,
          render: (h, params) => {
            return h(
              "div",
              {
                attrs: {
                  class: "product-list-info"
                }
              },
              [
                h(
                  "div",
                  {
                    attrs: {
                      class: "product-list-image-content"
                    }
                  },
                  [
                    h("img", {
                      attrs: {
                        class: "product-list-image",
                        src:
                          this.$store.state.siteComdataPath +
                          params.row.small_images
                      }
                    })
                  ]
                ),
                h(
                  "Tooltip",
                  {
                    props: {
                      theme: "dark",
                      placement: "top",
                      "max-width": 200,
                      transfer: true,
                      content: params.row.name
                    }
                  },
                  [
                    h(
                      "div",
                      {
                        attrs: {
                          class: "product-list-name"
                        }
                      },
                      params.row.name
                    )
                  ]
                )
              ]
            );
          }
        },
        {
          title: "商品分类",
          key: "class_name",
          align: "center",
          width: 140,
          render: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  theme: "dark",
                  placement: "top",
                  "max-width": 200,
                  transfer: true,
                  content: params.row.product_class
                }
              },
              [
                h(
                  "span",
                  {
                    attrs: {
                      class: "product-list-class"
                    }
                  },
                  params.row.product_class
                )
              ]
            );
          }
        },
        {
          title: "原售价",
          key: "price",
          align: "center",
          width: 110,
          render: (h, params) => {
            return h("span", {}, "￥" + params.row.price);
          }
        },
        {
          key: "url",
          title: " ",
          align: "right",
          width: 90,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type:
                      this.selectedLinkUrl ===
                      this.productUrl.replace("{product_id}", params.row.id)
                        ? "default"
                        : "primary",
                    disabled:
                      this.selectedLinkUrl ===
                      this.productUrl.replace("{product_id}", params.row.id),
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      let url = this.productUrl.replace(
                        "{product_id}",
                        params.row.id
                      );
                      this.onLinkClick(
                        params.row.name,
                        this.productUrlType,
                        params.row.id,
                        url,
                        "商品详情"
                      );
                    }
                  }
                },
                this.selectedLinkUrl ===
                  this.productUrl.replace("{product_id}", params.row.id)
                  ? "已选择"
                  : "选择"
              )
            ]);
          }
        }
      ],
      productListCurrPage: 1,
      productListTotalPage: 0,
      productListPageSize: 20,
      productListTotal: 0,
      classTreeList: [],
      productSelectClass: [-1],
      productSelectClassCopy: [-1],
      // productListSearchClass: "-1",
      productListSearchKeyword: "",

      externalUrl: "",

      pageList: [],
      pageUrl: "",
      pageUrlType: "",
      pageListCurrPage: 1,
      pageListTotalPage: 0,
      pageListPageSize: 20,
      pageListTotal: 0,
      pageListSearchKeyword: "",
      pageListColumns: [
        {
          title: "页面标题",
          key: "title"
        },
        {
          title: "页面描述",
          key: "description"
        },
        {
          key: "url",
          title: " ",
          align: "right",
          width: 100,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type:
                      this.selectedLinkUrl ===
                      this.pageUrl.replace("{page_id}", params.row.id)
                        ? "default"
                        : "primary",
                    disabled:
                      this.selectedLinkUrl ===
                      this.pageUrl.replace("{page_id}", params.row.id),
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      let url = this.pageUrl.replace(
                        "{page_id}",
                        params.row.id
                      );
                      this.onLinkClick(
                        params.row.title,
                        this.pageUrlType,
                        params.row.id,
                        url,
                        "店铺页面"
                      );
                    }
                  }
                },
                this.selectedLinkUrl ===
                  this.pageUrl.replace("{page_id}", params.row.id)
                  ? "已选择"
                  : "选择"
              )
            ]);
          }
        }
      ],
      activityList: [],
      activityColumns: [
        {
          width: 180,
          title: "活动名称",
          render: (h, params) => {
            return h("div", params.row.title);
          }
        },
        {
          width: 170,
          align: "center",
          title: "活动时间",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.start_time),
              h("div", params.row.end_time)
            ]);
          }
        },
        {
          width: 120,
          align: "center",
          title: "状态",
          render: (h, params) => {
            return h(
              "div",
              {
                class: ["table-warning", "table-success", "table-end"][
                  [0, 1, -1].findIndex(n => n === params.row.status)
                ]
              },
              ["未开始", "进行中", "已结束"][
                [0, 1, -1].findIndex(n => n === params.row.status)
              ]
            );
          }
        },
        {
          key: "url",
          title: " ",
          align: "right",
          width: 100,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type:
                      this.selectedLinkUrl ===
                      this.activityUrl.replace("{id}", params.row.id)
                        ? "default"
                        : "primary",
                    disabled:
                      this.selectedLinkUrl ===
                      this.activityUrl.replace("{id}", params.row.id),
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      let url = this.activityUrl.replace(
                        "{id}",
                        params.row.id
                      );
                      this.onLinkClick(
                        params.row.title,
                        this.activityUrlType,
                        params.row.id,
                        url,
                        "团购商品详情"
                      );
                    }
                  }
                },
                this.selectedLinkUrl ===
                  this.productUrl.replace("{product_id}", params.row.id)
                  ? "已选择"
                  : "选择"
              )
            ]);
          }
        }
      ],
      activityUrl: "",
      activityUrlType: "",
      activitySearchKeyword: "",
      activityCurrPage: 1,
      activityTotal: 0,
      activityPageSize: 20
    };
  },
  watch: {
    // 弹窗显示
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
        if (val && !this.hasData) {
          this.getStaticUrl();
          this.getClassList();
          this.getProductListUrl();
          this.getActivityList();
          this.getPageUrl();
          this.hasData = true;
        }
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
      //重新打开对话框时，清除之前已经选择的数据，保证每次打开都相当于新窗口
      if (val) {
        this.selectedLinkName = "";
        this.selectedLinkType = "";
        this.selectedLinkData = "";
        this.selectedLinkUrl = "";
        this.externalUrl = "";
      }
    }
  },
  created() {},
  methods: {
    /**
     * 没有二级分类的时候隐藏按钮
     */
    isShow(item) {
      if (!item.hasSub) {
        return true;
      }
      return false;
    },
    onSubmit() {
      this.onInputExternalUrl();
      //如果输入的网址格式不正确，弹窗不关闭
      if (this.checkInputUrl) {
        //1秒后不转圈圈
        setTimeout(() => {
          this.checkInputUrl = false;
        }, 300);
        setTimeout(() => {
          this.checkInputUrl = true;
        }, 300);
      } else {
        var retObj = {
          name: this.selectedLinkName,
          type: this.selectedLinkType,
          data: this.selectedLinkData,
          url: this.selectedLinkUrl,
          desc:
            this.selectedLinkType == "none" || !this.selectedLinkType
              ? ""
              : "链接到 " + this.selectedLinkName
        };
        this.$emit("onSelected", retObj);
        this.modalStatus = false;
      }
    },
    onLinkClick(name, type, data, url, tabName) {
      this.selectedLinkName = name;
      this.selectedLinkType = type;
      this.selectedLinkData = data;
      this.selectedLinkUrl = url;
      this.selectedTabName = tabName;
    },
    onInputExternalUrl() {
      if (!this.externalUrl.length) {
        this.checkInputUrl = false;
        return;
      }

      let testStr = /^http(s)?:\/\//;
      let cutInputUrl = testStr.test(this.externalUrl);

      if (cutInputUrl) {
        this.checkInputUrl = false;
        this.onLinkClick(
          this.externalUrl,
          "external",
          this.externalUrl,
          this.externalUrl,
          "外部链接"
        );
      } else {
        this.checkInputUrl = true;
        return;
      }
    },
    // 获取功能页面链接
    getStaticUrl() {
      this.$httpGet("/shop/admin/url/static", {}, res => {
        if (res.code === 200) {
          this.staticUrl = res.data.static_url;
        } else {
          this.$Message.error(res.msg);
        }
        this.staticLoading = false;
      });
    },
    // 获取店铺页面链接
    getPageUrl() {
      if (
        this.pageListCurrPage > 1 &&
        this.pageListCurrPage > this.pageListTotalPage
      ) {
        return false;
      }
      this.$httpGet(
        "/shop/admin/url/page",
        {
          page: this.pageListCurrPage,
          page_size: this.pageListPageSize,
          keyword: this.pageListSearchKeyword,
          type: 99
        },
        res => {
          if (res.code === 200) {
            this.pageList = res.data.page_list.list;
            this.pageListCurrPage = Number(res.data.page_list.current);
            this.pageListTotalPage = Number(res.data.page_list.last_page);
            this.pageListTotal = Number(res.data.page_list.total);

            this.pageUrl = res.data.page_url;
            this.pageUrlType = res.data.type;
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    // 店铺页面列表搜索
    onSearchPageList() {
      this.pageListCurrPage = 1;
      this.getPageUrl();
    },
    // 店铺页面列表每页条数改变
    onPageListPageSizeChange(pageSize) {
      this.pageListCurrPage = 1;
      this.pageListPageSize = pageSize;
      // --this.pageListCurrPage;
      this.getPageUrl();
    },
    // 店铺页面列表页码改变
    onPageListPageChange(page) {
      this.pageListCurrPage = page;
      this.getPageUrl();
    },
    /**
     * 获取产品分类列表
     */
    getClassList() {
      this.$httpGet("/shop/admin/url/product/class", {}, res => {
        this.setClassData(res.data.class_list || []);
        this.classList = res.data.class_list || [];
        let classUrl = res.data.product_list_url;
        let urlType = res.data.type;
        //生成树形结构
        this.sortedClass = [];
        this.classList.forEach(item => {
          if (item.parent_id == 0) {
            item.space = ["　", "icon", "　"];
            item.url = classUrl.replace("{class_id}", item.id);
            item.type = urlType;
            //item.hide = false;
            //item.hidesub = false;
            this.$set(item, "hide", false);
            this.$set(item, "hidesub", false);
            this.sortedClass.push(item);
            var sub = this.getClassByParent(item.id);
            if (sub.length > 0) {
              item.hasSub = true;
            }
            sub.forEach(sitem => {
              sitem.space = ["　", "　", "　", "　", "　", "　"];
              sitem.url = classUrl.replace("{class_id}", sitem.id);
              sitem.type = urlType;
              //sitem.hide = false;
              //sitem.hidesub = false;
              this.$set(sitem, "hide", false);
              this.$set(sitem, "hidesub", false);
              this.sortedClass.push(sitem);
            });
          }
        });
      });
    },
     /**
     * 多选分类
     */
    setClassData(list) {
      let data = [];
      list = list.map(item => {
        return Object.assign({}, item)
      })
      var clsTree = ClassUtil.newIntance(list).getTreeList();
      let sortedClassList = {
        title: "全部分类",
        data: { id: -1, class_name: "全部分类" },
        checked: this.productSelectClassCopy.findIndex(item => item === -1) > -1
      };
      if (clsTree.length > 0) {
        clsTree.forEach(item => {
          var titem = { title: item.class_name };
          titem.children = [];
          titem.expand = true;
          titem.data = { id: item.id, class_name: item.class_name };
          titem.checked =
            this.productSelectClassCopy.findIndex(n => n === item.id) >
            -1;
          item.children.forEach(item1 => {
            titem.children.push({
              title: item1.class_name,
              data: { id: item1.id, class_name: item1.class_name },
              checked:
                this.productSelectClassCopy.findIndex(
                  item => item === item1.id
                ) > -1
            });
          });
          data.push(titem);
        });
      }
      this.classTreeList = [sortedClassList, ...data];
    },
    onSelectClass() {
      let list = this.$refs["clstree"].getCheckedNodes();
      
      let classArray = [];
      list.forEach(item => {
        classArray.push(item.data.id);
      });
      // 只能有全选或多选（多于一个的时候有可能全选和多选都存在，根据标识去掉一种情况，如果没有选中则是都没有选，此时应该标识成全选）
      if (classArray.length > 1) {
        classArray = classArray.filter(item => item !== -1);
        this.$nextTick(() => {this.classTreeList[0].checked = false;})
      } else if (!classArray.length) {
        classArray = [-1];
        this.$nextTick(() => {this.classTreeList[0].checked = true;})
      }
      // if(classArray.includes(-1) && !this.productSelectClass.includes(-1)) {
      //   classArray = [-1];
      //   this.classTreeList.forEach(item => {
      //     if(item.children && item.children.length) {
      //       item.children.forEach(n => n.checked = true)
      //     } else {
      //       item.checked = true
      //     }
      //   })
      // } else if(!classArray.includes(-1) && this.productSelectClass.includes(-1)) {
      //   classArray = [];
      //   this.classTreeList.forEach(item => {
      //     if(item.children && item.children.length) {
      //       item.children.forEach(n => n.checked = false)
      //     } else {
      //       item.checked = false
      //     }
      //   })
      // }
      this.productSelectClass = classArray;
    },
    /**
     * 根据父级获取子级分类
     */
    getClassByParent(pid) {
      var arr = [];
      this.classList.forEach(item => {
        if (item.parent_id == pid) {
          arr.push(item);
        }
      });
      return arr;
    },
    /**
     * 切换展开状态
     */
    toggleSub(cls) {
      if (cls.parent_id == 0) {
        this.$set(cls, "hidesub", !cls.hidesub);
        this.sortedClass.forEach(sitem => {
          if (sitem.parent_id == cls.id) {
            this.$set(sitem, "hide", cls.hidesub);
          }
        });
      }
    },
    // 获取产品列表
    getProductListUrl() {
      if (
        this.productListCurrPage > 1 &&
        this.productListCurrPage > this.productListTotalPage
      ) {
        return false;
      }
      this.$httpPost(
        "/shop/admin/url/product/list",
        {
          page: this.productListCurrPage,
          page_size: this.productListPageSize,
          keyword: this.productListSearchKeyword,
          class: this.productSelectClassCopy[0] == -1 ? undefined :this.productSelectClassCopy 
        },
        res => {
          if (res.code === 200) {
            this.productList = res.data.product_list.list;
            this.productListCurrPage = res.data.product_list.current;
            this.productListTotalPage = res.data.product_list.last_page;
            this.productListTotal = res.data.product_list.total;

            this.productUrl = res.data.product_detail_url;
            this.productUrlType = res.data.type;
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    // 产品列表搜索
    onSearchProductList() {
      this.productSelectClassCopy = this.productSelectClass;
      this.productListCurrPage = 1;
      this.getProductListUrl();
    },
    // 产品列表每页条数改变
    onProductListPageSizeChange(pageSize) {
      this.productListCurrPage = 1;
      this.productListPageSize = pageSize;
      // --this.productListCurrPage;
      this.getProductListUrl();
    },
    // 产品列表页码改变
    onProductListPageChange(page) {
      this.productListCurrPage = page;
      this.getProductListUrl();
    },

     onSearchActivity() {
      this.activityCurrPage = 1;
      this.getActivityList();
    },
    // 产品列表每页条数改变
    onActivityPageSizeChange(pageSize) {
      this.activityCurrPage = 1;
      this.activityPageSize = pageSize;
      this.getActivityList();
    },
    // 产品列表页码改变
    onActivityPageChange(page) {
      this.activityCurrPage = page;
      this.getActivityList();
    },
    getActivityList() {
      this.$httpPost(
        "/shop/admin/url/groupbuying/list",
        {
          page: this.activityCurrPage,
          page_size: this.activityPageSize,
          keyword: this.activitySearchKeyword
        },
        res => {
          if (res.code === 200) {
            this.activityList = res.data.groupbuying_list.list;
            this.activityTotal = res.data.groupbuying_list.total;
            this.activityUrl = res.data.groupbuying_detail_url;
            this.activityUrlType = res.data.type;
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
/deep/.ivu-modal-body {
  padding: 0px;
  .ivu-tabs-nav-scroll {
    padding: 0px 24px 8px;
  }
  .ivu-tabs-tab {
    padding: 10px;
  }
  .ivu-tabs-tabpane {
    padding: 0px 24px;
  }
  .product-class-container {
    padding-right: 5px;
    .container {
      padding-right: 19px;
      .list {
        color: #657180;
      }
    }
  }
}
.links-manage /deep/.ivu-modal .ivu-modal-content {
  .selected-info {
    position: absolute;
    bottom: 21px;
    // margin-right: 16px;
    margin-left: 16px;
    font-size: 12px;
    color: #657180;
    width: 420px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ivu-modal-body {
    .ivu-tabs-content {
      height: 436px;
    }
    .product-class-container {
      height: 100%;
    }
    /* 分类样式 */
    .container {
      overflow: auto;
      height: 95%;
    }
    .list-show-select {
      position: absolute;
      bottom: 21px;
    }
    .mglr {
      margin-left: 30px;
      margin-right: 30px;
    }
    .table {
      border: 1px solid #ddd;
      .list {
        height: 355px;
        overflow: auto;
      }
      .title {
        padding-left: 18px;
        height: 40px;
        line-height: 40px;
        background: #f8f9fd;
        color: #464c5b;
        font-weight: bold;
        font-size: 13px;
        border-bottom: 1px solid rgba(232, 234, 236, 1);
      }
      .item {
        display: flex;
        cursor: default !important;
        border-bottom: 1px solid #f8f8f8;
        .ivu-btn-primary {
          display: none;
        }
        &:hover {
          background-color: #fcfcfd;
          .ivu-btn-primary {
            display: inline-block;
          }
        }

        .name {
          flex: 1;
          height: 50px;
          line-height: 50px;

          .space {
            height: 50px;
            line-height: 50px;
          }
          .ivu-icon {
            font-size: 20px;
            margin-top: -3px;
          }
        }
        .op {
          height: 50px;
          line-height: 50px;
          width: 60px;
        }
      }
    }
  }
  .ivu-tabs-bar {
    margin-bottom: 10px;
    border-width: 0px;
    padding-left: 0px !important;
  }
  .ivu-tabs-tab {
    font-size: 13px;
    padding: 15px 20px 10px 0px;
  }

  .ivu-tabs-ink-bar {
    background-color: transparent;
    width: 52px !important;
    &::before {
      content: "";
      width: 40px;
      height: 4px;
      background: #4570ea;
      border-radius: 2px;
      position: absolute;
      bottom: 0;
      left: 50%;
      -webkit-transform: translateX(-50%);
      transform: translateX(-50%);
    }
  }
  /* 功能页面 */
  .static-url-container {
    padding-right: 5px;
    .container {
      padding-right: 19px;
      overflow-y: auto;
      height: 100%;
    }
  }
  /* 店铺页面 */
  .page-url-container {
    padding-right: 5px;
    position: relative;
    .page-list {
      padding-right: 19px;
      height: 320px;
      overflow-y: auto;
      .page-list-container {
        width: 572px;
        overflow: hidden;
        .ivu-table-tbody tr {
          height: 50px;
        }
      }
    }
    .page-list-page {
      height: 70px;
      line-height: 70px;
      .ivu-page {
        text-align: right;
        padding-right: 19px;
      }
    }
  }
  /* 产品列表 */
  .product-detail-container {
    padding-right: 5px;
    position: relative;
    .product-list {
      padding-right: 19px;
      height: 320px;
      overflow-y: auto;
      .product-list-container {
        width: 572px;
        overflow: hidden;
        /deep/.ivu-table-body {
          overflow-x: hidden;
        }
        .ivu-table-tbody tr {
          height: 70px;
        }
        .product-list-info {
          .product-list-image-content {
            display: inline-block;
            margin-right: 8px;
            vertical-align: middle;
            border: 1px solid rgb(238, 238, 238);
            .product-list-image {
              width: 50px;
              height: 50px;
              display: block;
            }
          }
          .product-list-name {
            display: -webkit-inline-box;
            width: 114px;
            vertical-align: middle;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
        .product-list-class {
          display: -webkit-inline-box;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
    .product-list-page {
      // position: absolute;
      // right: 0px;
      // bottom: 10px;
      height: 70px;
      line-height: 70px;
      .ivu-page {
        text-align: right;
        padding-right: 19px;
        // padding-top: 5px;
      }
    }
    /deep/.ivu-select {
      width: 99px;
    }
    /deep/.class-tree-select {
      .ivu-select-dropdown {
        width: 260px;
        text-align: left;
      }
      .ivu-select-item:first-child {
        display: none;
      }
    } 
  }
  /* 外部链接 */
  .external-url-container {
    display: flex;
    align-items: center;
    padding-top: 30px;
    margin-left: 30px;
    .external-url-title {
      width: 70px;
      font-size: 13px;
    }
    .external-url-input {
      width: 440px;
    }
  }
  .product-search,
  .page-search {
    margin-bottom: 15px;
    padding-right: 19px;
    .ivu-input-group-append .ivu-btn-default {
      border-color: transparent;
      color: #464c5b;
      height: 35px;
    }
    .ivu-select-single .ivu-select-selection,
    .ivu-input-group .ivu-input {
      height: 35px;
    }
  }
  .activity-search {
    /deep/.ivu-input-group-prepend {
      width: 99px;
    }
  }
  .ivu-btn-small {
    width: 50px;
    height: 24px;
    line-height: 1;
    padding: 0px;
    padding-bottom: 2px;
  }
  .ivu-btn-default {
    border-color: #4a69f5;
    color: #4a69f5;
  }
  .ivu-table th {
    color: #464c5b;
    background-color: #f8f9fd;
  }
  .ivu-table td {
    color: #657180;
    height: 50px;
  }
  .ivu-table-body tr td {
    font-size: 12px;
  }
  .ivu-table-body tr:nth-child(2n) td {
    background: #fff;
  }
  .ivu-table-body tr:hover td {
    background: #fcfcfd;
  }
}
.tips {
  font-size: 12px;
  margin-left: 100px;
  margin-top: 5px;
  color: #f00;
}

/deep/.ivu-table-row {
  .ivu-btn-primary {
    display: none !important;
  }
  &:hover .ivu-btn-primary {
    display: inline-block !important;
  }
}

.isHaveSub {
  display: none;
}
</style>
