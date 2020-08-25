<template>
  <div class="areagent-verify-passed">
    <search-list :searchParams="searchParams" :onLine="true" :search-data="searchData" @on-change="onSearchSelectChange"></search-list>
    <common-table
        :minWidth="1093"
        v-if="iscurrent"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="distributorListArray"
    ></common-table>
    <div class="bar-pager">
      <Page
          v-show="distributorListArray.length"
          :total="total"
          :page-size="pageSize"
          show-sizer
          :current="currentPage"
          @on-change="onPageChange"
          @on-page-size-change="onPageSizeChange"
          show-elevator
          class="page-style"
          :transfer="true"
      />
    </div>
    <apply-condition v-model="isShowCondition" :info="memberInfo"></apply-condition>
  </div>
</template>
<script>
  import searchList from "@/views/shop/components/search/search-list.vue";
  import commonTable from "@/views/shop/components/table/common-table.vue";
  import applyCondition from "./components/areaagent-apply-condition.vue";
  import memberInfor from "@/views/shop/components/table/member-infor.vue";
  import cityData from "@/views/shop/components/cityDataThree";
  const getNewArea = list => {
    return list.map(item => {
      let item1 = { ...item };
      item1.id = item1.value;
      item1.value = item1.label;
      return item1;
    });
  };
  let province = getNewArea(cityData[0].provinceArr);
  export default {
    components:{
      searchList,
      commonTable,
      applyCondition
    },
    props: {
      iscurrent: {
        type: Boolean
      }
    },
    data(){
      return {
        tableLoading:false,
        isShowCondition:false,
        // 分页数据
        total: 0,
        pageSize: 20,
        currentPage: 1,
        searchParams: [
          {
            type: 1,
            name: "",
            prefixIcon: "ios-search",
            key: "keyword",
            placeholder: "昵称/姓名/手机号"
          },
          {
            type: 3,
            key: "apply_area_type",
            name: "申请代理等级：",
            options: [
              { id: -1, value: "全部" },
              { id: 10, value: "省代" },
              { id: 9, value: "市代" },
              { id: 8, value: "区代" }
            ]
          },
          {
            type: 3,
            key: "province",
            combine: "agentarea",
            width: 140,
            name: "代理区域：",
            options: [{ id: -1, value: "所有省份" }, ...province]
          },
          {
            type: 3,
            key: "city",
            combine: "agentarea",
            width: 140,
            options: [{ id: -1, value: "所有城市" }]
          },
          {
            type: 3,
            key: "area",
            combine: "agentarea",
            width: 140,
            options: [{ id: -1, value: "所有区/县" }]
          },
          {
            type: 2,
            key: "beingTime",
            name: "审核通过时间："
          }
        ],
        // 搜索数据
        searchData: {
          keyword: "",
          apply_area_type: -1,
          beingTime: {
            startTime: "",
            endTime: ""
          },
          province:-1,
          city:-1,
          area:-1,
        },
        columnsData:[
          {
            title:"申请人信息",
            minWidth: 370,
            render: (h, params) => {
              return h(memberInfor, {
                props:{
                  id:Number(params.row.member_id),
                  headurl:this.padImgUrl(params.row.headurl) ||
                    require("../images/head-portrait.png"),
                  nickname:params.row.nickname,
                  mobile:params.row.member_mobile,
                  name:params.row.name || "--"
                },
                attrs: {
                  perm: "member.detail.view"
                }
              });
            }
          },
          {
            title: "申请级别/区域",
            minWidth: 249,
            key: "member_level_name",
            align: "left",
            render: (h, params) => {
              return h("div", [
                h("span", (params.row.apply_area_type==10?"省代":params.row.apply_area_type==9?"市代":params.row.apply_area_type==8?"区代":"")+"："),
                h(
                  "span",
                  params.row.apply_prov_text+(params.row.apply_city ? "-"+params.row.apply_city_text:"")+(params.row.apply_district ? "-"+params.row.apply_district_text:"")
                )
              ]);
            }
          },
          {
            title:"审核通过时间",
            minWidth: 180,
            align: "center",
            render: (h, params) => {
              return h(
                "div",
                params.row.passed_at
                // params.row.passed_at.replace(/-/g, "-")
              );
            }
          },
          {
            title:"状态",
            minWidth: 180,
            align: "center",
            render: (h, params) => {
              return h("div", [
                h(
                  "span",

                  {
                    class: {
                      "table-success": params.row.status === 1,
                      "table-error": params.row.status === -1,
                      "table-warning": params.row.status === 0
                    }
                  },
                  (() => {
                    if (params.row.status === 1) return "已通过";
                    if (params.row.status === -1) return "已拒绝";
                    return "待审核";
                  })()
                )
              ]);
            }
          },
          {
            title:"操作",
            minWidth:180,
            align:"center",
            render:(h,params)=>{
              return h("span",{
                class:{
                  "table-operation":true
                },
                attrs: {
                  perm: "area.agent.apply.view"
                },
                on:{
                  click:()=>{
                    this.memberInfo = params.row;
                    this.isShowCondition=true;
                  }
                }
              },"查看申请条件")
            }
          }
        ],
        distributorListArray:[],
        memberInfo:null
      }
    },
    watch: {
      searchData: {
        handler() {
          this.currentPage = 1;
          this.getDistributorVerifyList();
        },
        deep: true
      },
    },
    methods:{
      padImgUrl(url) {
        if (!url) {
          return;
        }
        if (/^http/i.test(url)) {
          return url;
        } else {
          return this.$store.state.siteComdataPath + url;
        }
      },
      loadPageData(){
        this.distributorListArray=[];
        this.$store.state.COMMON_loading = true;
        this.getDistributorVerifyList();
      },
      /**
       * 分页改变重新拉取数据
       */
      onPageChange(val) {
        this.currentPage = val;
        this.getDistributorVerifyList();
      },
      onPageSizeChange(size) {
        this.pageSize = size;
        this.getDistributorVerifyList();
      },
      getMemberLevelList() {
        return new Promise(resolve => {
          this.http({
            url: "/shop/admin/member/level/list"
          })
            .then(res => {
              if (res.code === 200) {
                this.memberLevelData = res.data.list || [];
                this.searchParams
                  .filter(item => item.key === "member_level")
                  .forEach(item => {
                    this.$set(item, "options", [
                      ...item.options,
                      ...this.memberLevelData.map(item => {
                        return {
                          id: item.id,
                          value: item.name
                        };
                      })
                    ]);
                  });
              } else {
                this.$Message.error(res.msg);
              }
              resolve();
            })
            .catch(e => {
              this.$store.state.COMMON_loading = false;
              this.$Message.error(e);
            });
        });
      },
      getDistributorVerifyList(){
        let data = this.getSearchParams();
        return new Promise(resolve => {
          this.tableLoading = true;
          this.http({
            url: "/shop/admin/area/agent/apply/list",
            data,
            method: "POST"
          })
            .then(res => {
              this.tableLoading = false;
              if (res.code === 200) {
                this.distributorListArray = [];
                this.$nextTick(() => {
                  let distributorList = res.data.list || [];
                  this.distributorListArray = distributorList;
                  this.total = res.data.total;
                  resolve();
                });
              } else {
                this.$Message.error(res.msg);
              }
            })
            .catch(e => {
              this.$Message.error(e);
            })
            .finally(() => {
              this.$store.state.COMMON_loading = false;
            });
        });
      },
      getSearchParams() {
        let data = {
          keyword: this.searchData.keyword,
          created_at_start: this.searchData.beingTime.startTime,
          created_at_end: this.searchData.beingTime.endTime,
          apply_prov:this.searchData.province==-1?null:this.searchData.province,
          apply_city:this.searchData.city==-1?null:this.searchData.city,
          apply_district:this.searchData.area==-1?null:this.searchData.area,
          page: this.currentPage,
          page_size: this.pageSize
        };
        if (this.searchData.apply_area_type !== -1) {
          data["apply_area_type"] = this.searchData.apply_area_type;
        }
        data["status"] = 1 //写死的,已通过
        // if (this.searchData.status !== -2) {
        //   data["status"] = this.searchData.status;
        // }
        return data;
      },
      //切换城市
      onSearchSelectChange(newData, oldData) {
        let provinceStatus = newData.province !== (oldData && oldData.province);
        let cityStatus = newData.city !== (oldData && oldData.city);
        // 如果是省或城市修改才需要改下拉框内容
        if (provinceStatus || cityStatus) {
          this.searchParams.forEach(item => {
            // 如果是修改了省才需要改市的选择
            if (provinceStatus && item.key === "city") {
              let options = [{ id: -1, value: "所有城市" }];
              let selectProvince = province.find(n => n.id === newData.province);
              if (selectProvince && selectProvince.children) {
                options.push(...getNewArea(selectProvince.children));
              }
              this.$set(item, "options", options);
              this.$set(newData, "city", -1);
              this.$set(newData, "area", -1);
            }
            // 不管是改省或市都需要更新市的选择
            if (cityStatus && item.key === "area") {
              let options = [{ id: -1, value: "所有区/县" }];
              let selectProvince = province.find(n => n.id === newData.province);
              if (selectProvince && selectProvince.children) {
                let selectCity = getNewArea(selectProvince.children).find(
                  n => n.id === newData.city
                );
                if (selectCity && selectCity.children) {
                  options.push(...getNewArea(selectCity.children));
                }
              }
              this.$set(item, "options", options);
              this.$set(newData, "area", -1);
            }
          });
        }
      },
    }
  }
</script>
<style lang="less" scoped>
  .areagent-verify-passed{
    padding:24px 24px 0;
    height:calc(100vh - 120px);
    overflow:auto;
    /deep/.data-list-search{
      // padding:16px 16px 0;
      // background:#F8F9FD;
      // margin-bottom:24px;
      .data-list-search-item {
        /*&:nth-child(3) {*/
          /*.ivu-select-dropdown,*/
          /*.ivu-select {*/
            /*width: 100px;*/
          /*}*/
        /*}*/
      }
    }
  }
</style>