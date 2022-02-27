//发布组件化
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        showModel: false,           // 控制显隐
        add_style: '',              // 样式

        showTab: true,              // 标签显隐
        nm: false,                  // 匿名开关
        isNm: '',                   // 匿名账号
        formTitle: ' ',
        formText: '',
        photo: [],                  // 照片
        choosenLabel: '',           // 已选标签
        menu: ["日常", "表白墙🎯", "吐槽","寻物发布"],

        imageHeight: 0,
        imageWidth: 0,
        current: 0,                 // 单个第x张照片
        //存储寻物发布信息
          "Time":"",
          "type":"",
          "campus":"",
          "Other":""

    },
    lifetimes: {
        ready() {
            let args = wx.getStorageSync('args');
            this.setData({ nm:args.nm })
        }
    },
    methods: {
        // 点击事件 - 组件显隐
        add(e) {
            var showModel = this.data.showModel;
            var that = this;

            if (showModel) {
                this.setData({
                    add_style: "add_hide"
                })
                setTimeout(() => {
                    that.setData({
                        showModel: !showModel
                    })
                }, 200);
            } else {
                this.setData({
                    add_style: "add_show",
                    showModel: !showModel
                })
            }
        },
        // 点击事件 - 标签显隐
        clickMenu(e) { 
            this.setData({
              showTab: !this.data.showTab,
            })
        },
        // 点击事件 - 匿名
        switchChange: function (res) {
            console.log(2323)
            this.setData({
              isNm: res.detail.value
            })
        },
        // 点击事件 - 选择标签
        chooseTab: function (e) {
            // 获取索引值
            let index = e.detail.currentTarget.dataset.index;
            this.setData({
              choosenLabel: this.data.menu[index],
            })
        },
        // 内部函数 - 
        ReOnLoad(){
            this.triggerEvent("ReOnLoad")
        },
        // 点击事件 - 发布
        formSubmit(e) { // 2.2 添加与存储 (发布点击事件)
          if(this.data.choosenLabel!="寻物发布"){
            this.setData({
              "Time":"",
              "type":"",
              "campus":"",
              "Other":""
            })
          }
            let {
              formTitle,
              formText
            } = e.detail.value;
            let args = wx.getStorageSync('args');
            let {iconUrl, nickName, school} = args;

            if (!formTitle) {
              formTitle = ""
            }
            if (!formText) {
              formText = ""
            }
            console.log(this.data.choosenLabel)

            if (this.data.photo.length == 0) {
              wx.showToast({
                title: '图片不能为空',
                icon: 'none'
              })
            } else if (!this.data.choosenLabel) {
              wx.showToast({
                title: '标签不能为空',
                icon: 'none'
              })
              
            }
            else if(this.data.choosenLabel=="寻物发布"&&!this.data.type){
              wx.showToast({
                title: '请选择失物类别',
                icon: 'none'
              })
            }
            else if(this.data.choosenLabel=="寻物发布"&&!this.data.campus){
              wx.showToast({
                title: '请选择学校校区',
                icon: 'none'
              })
            }
            else if(this.data.choosenLabel=="寻物发布"&&!this.data.Time){
              wx.showToast({
                title: '请选择丢失时间',
                icon: 'none'
              })
            }
            else if(this.data.choosenLabel=="寻物发布"&&!this.data.Other){
              wx.showToast({
                title: '请选择是否悬赏',
                icon: 'none'
              })
            }
            else if (!nickName && !iconUrl) {
              wx.showToast({
                title: '小主还没登录哟QwQ',
                icon: 'none'
              })
            } else {
                
              if (this.data.isNm) {
                iconUrl = '/pages/myself/images/logo.jpg'
                nickName = '匿名账号'
              }

              let add = {
                "Cover": this.data.photo[0],
                "AllPhoto": JSON.parse(JSON.stringify(this.data.photo)),
                "Title": formTitle,
                "Text": formText,
                "CoverHeight": this.data.imageHeight,
                "CoverWidth": this.data.imageWidth,
                "Label": this.data.choosenLabel,
                "Time": new Date().getTime(),
                "nickName": nickName,
                "School": school,
                "iconUrl": iconUrl,
                "LoseTime":this.data.Time,
                "campus":this.data.campus,
                "Other":this.data.Other,
                "LoseType":this.data.type
              }
              console.log(add)
              getApp().globalData.allList.push(add);
              let NewData = getApp().globalData.allList.length - 1;

              // 计算图片高度
              const CalculateImage = () => {
                let allList = getApp().globalData.allList;

                for (let i = 0; i < allList.length; i++) {
                    let height = parseInt(Math.round(allList[i].CoverHeight * 370 / allList[i].CoverWidth));      // 计算得到高度

                    if (height) {      
                        let currentItemHeight = parseInt(Math.round(allList[i].CoverHeight * 370 / allList[i].CoverWidth));

                        // 边界处理
                        currentItemHeight > 500 ? currentItemHeight = 500 : '';

                        allList[i].ShowHeight = currentItemHeight;
                        allList[i].CoverHeight = currentItemHeight + "rpx"; // 因为xml文件中直接引用的该值作为高度，所以添加对应单位
                    }
                }
                return ;
              }
              // 将数据上传到数据库  (仅uploadPhoto内调用) 
              const uploadData = (NewData, fileIDs) => {
                let args = wx.getStorageSync('args');
                var that = this
                if (fileIDs.length == getApp().globalData.allList[NewData].AllPhoto.length) {

                    wx.cloud.callFunction({
                        name: 'CampusCircle',
                        data: {
                            // LoseTime:
                            Cover: fileIDs[0],
                            LoseTime:getApp().globalData.allList[NewData].LoseTime?getApp().globalData.allList[NewData].LoseTime:"",
                            Other:getApp().globalData.allList[NewData].Other?getApp().globalData.allList[NewData].Other:"",
                            LoseType:getApp().globalData.allList[NewData].LoseType?getApp().globalData.allList[NewData].LoseType:"",
                            campus:getApp().globalData.allList[NewData].campus?getApp().globalData.allList[NewData].campus:"",
                            AllPhoto: fileIDs,
                            Title: getApp().globalData.allList[NewData].Title,
                            Text: getApp().globalData.allList[NewData].Text,
                            CoverHeight: getApp().globalData.allList[NewData].CoverHeight,
                            CoverWidth: getApp().globalData.allList[NewData].CoverWidth,
                            Label: getApp().globalData.allList[NewData].Label,
                            Time: getApp().globalData.allList[NewData].Time,
                            ShowHeight: getApp().globalData.allList[NewData].ShowHeight,
                            School: getApp().globalData.allList[NewData].School,
                            nickName: getApp().globalData.allList[NewData].nickName,
                            username: args.username,
                            iconUrl: getApp().globalData.allList[NewData].iconUrl,
                            Star: 0,
                            type: 'write'
                        },
                        success: res => {
                            console.log("add", res)
                            wx.showToast({
                                duration: 4000,
                                title: '添加成功'
                            })
                            setTimeout(()=>{
                                that.ReOnLoad();
                            },1000)
                        },
                        fail: err => {
                            wx.showToast({
                                icon: 'none',
                                title: '出错啦！请稍后重试'
                            })
                            console.error
                        },
                        complete() {
                            that.setData({
                                photo: [],
                                Input_Title: "",
                                Input_Text: "",
                                choosenLabel: " ",
                                showModel: !that.data.showModel,
                            })
                        }
                    })
                }
              }
              // 将本地图片上传到云存储，后续通过fileid进行图片展示
              const uploadPhoto = (NewData) => {
                /**
                 * 图片上传逻辑
                 * 1. 判断条件，是否符合上传条件
                 * 2. 自定义函数上传图片到云存储
                 * 3. 将所有信息保存到数据库
                 */
                wx.showLoading({
                    title: '加载中',
                    mask: true
                  })
                  var path = getApp().globalData.allList[NewData].AllPhoto;
                  var fileIDs = [];

                  for (var i = 0; i < path.length; i++) {
                    wx.compressImage({
                      src: path[i], // 图片路径
                      quality: 50, // 压缩质量,
                      success(res) {
                        wx.cloud.uploadFile({
                          cloudPath: 'CampusCircle_images/' + new Date().getTime() + Math.floor(Math.random() * 150) + '.png',
                          filePath: res.tempFilePath,
                        }).then(res => {
                          fileIDs.push(res.fileID)
                          uploadData(NewData, fileIDs)
                        })
                      }
                    })
                  }
              }

              CalculateImage();
              uploadPhoto(NewData);
            }
        },
        // 点击事件 - 选择图片
        chooseimage: function () {
            var that = this;
            if (that.data.photo.length == 0) {
              wx.chooseImage({
                count: 6,
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
                success: (res) => {
                  that.data.photo = res.tempFilePaths
                  // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
                  that.setData({
                    photo: that.data.photo
                  })
                  wx.getImageInfo({
                    src: that.data.photo[0],
                    success: function (res) {
                      that.data.imageHeight = res.height
                      that.data.imageWidth = res.width
                    }
                  })
                }
              })
            }
        },
        // 点击事件 - 删除图片
        deleteImage: function (e) {
            var that = this;
            var index = e.currentTarget.dataset.index; //获取当前长按图片下标
            if (that.data.photo.length != 0) {
              wx.showModal({
                title: '提示',
                content: '确定要删除此图片吗？',
                success: function (res) {
                  if (res.confirm) {
                    that.data.photo.splice(index, 1)
                  }
                  that.setData({
                    photo: that.data.photo,
                    current: 0
                  });
                  wx.getImageInfo({
                    src: that.data.photo[0],
                    success: function (res) {
                      that.data.imageHeight = res.height
                      that.data.imageWidth = res.width
                    }
                  })
                }
              })
            }
        },
        // 点击事件 - 预览图片
        PreviewImage: function (e) {
            let index = e.currentTarget.dataset.index;
            var imgs = this.data.photo;
            if (imgs.length != 0) {
              wx.previewImage({
                current: imgs[index],
                urls: imgs,
              })
            }
        },
        type(e){
          console.log(e.detail)
          this.setData({type:e.detail})
        },
        campus(e){
          console.log(e.detail)
          this.setData({campus:e.detail})
        },
        Other(e){
          console.log(e.detail)
          this.setData({Other:e.detail})

          // console.log(e.detail)
        },
        Time(e){
          console.log(e.detail)
          this.setData({Time:e.detail})
        }
    }
})
