<template>
  <div class="test">
    <h1>这是测试页</h1>
    <input type='button' value='test http get' @click="testget"><br><br>
    <input type='button' value='测试修改分销设置' @click="editfenxiao"><br><br>
	<input type='button' value='测试添加分销等级' @click="addfenxiaolevel"><br><br>
	<input type='button' value='测试修改分销等级' @click="editfenxiaolevel"><br><br>
	<input type='button' value='测试禁用分销等级' @click="disablefenxiaolevel"><br><br>
	<input type='button' value='测试转移分销等级' @click="transfenxiaolevel"><br><br>
    <input type="file" name="fileUpload" id="fileUp" ref="inputFile" ><br><br>
    <input type='button' value='test http upload' @click="testupload"><br><br>
	<input type='button' value='保存充值赠送' @click="setRechargeBonus"><br><br>
	<input type='button' value='读取充值赠送' @click="getRechargeBonus"><br><br>
    <button @click="message">Message</button>
    <div>
      <input ref="checkbox" type="checkbox">
      <button @click="disable">disable</button>
    </div>
    <a href="#" style="display:block">
      <div class="wrapper" style="height:50px;line-height:50px;">
        <span style="display:inline-block;width:50px;"><Icon type="md-cube" size="18"/></span>
      </div>
    </a>
    <div class="ivu-form-item-error">
      <Select>
        <Option value="1">111111</Option>
        <Option value="2">222222</Option>
      </Select>
    </div>
    <button @click="test1">test1</button>
    <button @click="test2">test2</button>
  </div>
</template>
<script>
// import compHoc from "./comp-hoc.js"
import myColorPicker from "@/views/shop/components/color-picker/ColorPicker.js";
export default {
  components: {
    // compHoc,
    myColorPicker
  },
  data() {
    return {
      file: null,
      asd: 123231221,
      color: null,
      number: null,
      data4: [
                    {
                        title: 'parent 1',
                        expand: true,
                        selected: true,
                        children: [
                            {
                                title: 'parent 1-1',
                                expand: true,
                                children: [
                                    {
                                        title: 'leaf 1-1-1',
                                        disabled: true
                                    },
                                    {
                                        title: 'leaf 1-1-2'
                                    }
                                ]
                            },
                            {
                                title: 'parent 1-2',
                                expand: true,
                                children: [
                                    {
                                        title: 'leaf 1-2-1',
                                        checked: true
                                    },
                                    {
                                        title: 'leaf 1-2-1'
                                    }
                                ]
                            }
                        ]
                    }
                ]
    };
  },
  methods: {
    async test1() {
      var res = await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(12345678)
        }, 10000);
      })
      console.log(res)
    },
    test2() {
      console.log(11111111)
    },
    onCheckChange(data) {
      console.log(1111,data)
    },
    filter(e) {
      console.log(this.number)
    },
    testget: function() {
      this.httpGet(
        "/?c=SysAdmin/test",
        { reqmethod: "get", name: "duron", desc: "superman" },
        function(res) {
          console.log(res.data);
        }
      );
    },
    editfenxiao: function() {
      this.httpPost(
        "/shop/admin/distribution/setting/edit",
        { reqmethod: "post", baseinfo: {"site_id":1,"level":3,"internal_purchase":0,"review_type":0,"bind_type":0,"show_code":1,"condition":0,"buy_times":1,"buy_times_flag":1,"buy_money":0.01,"buy_money_flag":1,"buy_product":0}, forminfo: {"site_id":1,"company_show":1,"company_require":1,"business_license_show":1,"business_license_require":1,"business_license_file_show":1,"business_license_file_require":1,"idcard_show":1,"idcard_require":1,"idcard_file_show":1,"idcard_file_require":1,"applicant_show":1,"applicant_require":1,"mobile_show":1,"mobile_require":1,"sex_show":1,"sex_require":1,"address_show":1,"address_require":1,"remark_show":1,"remark_require":1,"agreement_show":1,"agreement":"这是分销商申请协议","extend_fields":["现居住地","籍贯"]} },
        function(res) {
          console.log(res.data);
        }
      );
    },

	addfenxiaolevel: function() {
      this.httpPost(
        "/shop/admin/distribution/level/add",
        { name: "白银分销", weight: 2,levelCommission:{'1':25,'2':20,'3':15},upgradeCondition:[{type:1,value:200},'or',{type:2,value:10}] },
        function(res) {
          console.log(res.data);
        }
      );
    },

	editfenxiaolevel: function() {
      this.httpPost(
        "/shop/admin/distribution/level/edit",
        { id:2,name: "普通分销", weight: 1,new_open:1,levelCommission:{'1':20,'2':15,'3':10},upgradeCondition:[{type:1,value:100},'or',{type:2,value:10}] },
        function(res) {
          console.log(res.data);
        }
      );
    },

	disablefenxiaolevel: function() {
      this.httpPost(
        "/shop/admin/distribution/level/disable",
        { id:2 },
        function(res) {
          console.log(res.data);
        }
      );
    },

	transfenxiaolevel: function() {
      this.httpPost(
        "/shop/admin/distribution/level/trans",
        { id:2,new_level_id:3 },
        function(res) {
          console.log(res.data);
        }
      );
    },

    testupload: function() {
      var data = new FormData(); //重点在这里 如果使用 var data = {}; data.inputfile=... 这样的方式不能正常上传
      data.append("inputFile", this.$refs.inputFile.files[0]);
      data.append("name", "duron");
      data.append("filename", this.$refs.inputFile.files[0].name);
      this.httpUpload("/?c=SysAdmin/test", data, function(res) {
        console.log(res.data);
      });
    },

	setRechargeBonus: function() {
      this.$httpPost(
        "/shop/admin/promotions/rechargebonus/save",
        {
			"status": 1,
			"bonus": [
				{
					"recharge": 0.01,
					"bonus": 1
				},
				{
					"recharge": 0.02,
					"bonus": 2
				}
			]
		},
        function(res) {
          console.log(res.data);
        }
      );
    },

	getRechargeBonus: function() {
      this.$httpPost(
        "/shop/admin/promotions/rechargebonus/info",
        { id:2 },
        function(res) {
          console.log(res.data);
        }
      );
    },

    message(){
      this.$Message.info({content:'This is a info tip',duration:300});
    },
    disable(){
      var b=this.$refs.checkbox.hasAttribute("disabled")
      if(b){
        this.$refs.checkbox.removeAttribute("disabled")
      }else{
        this.$refs.checkbox.setAttribute("disabled","")
      }
      console.dir(this.$refs.checkbox)
    }

  }
};
</script>
<style lang="less">
  .flex {
    height: 100px;
    overflow:auto;
    display: flex;
    flex-direction:column;
    .item {
      position:relative;
      height: 30px;
      line-height: 30px;
      border: 1px solid red;
      span {
        // content: "";
        // height:100%;
        position:absolute;
      }
    }
  }
  .container {
    position: relative;
    .qrimg {
      width: 280px;
      height: 280px;
      background: green;
      &:before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 280px;
        height: 280px;
        background: red;
      }
    }
  }
</style>