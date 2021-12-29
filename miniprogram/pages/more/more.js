// pages/more/more.js
var app = getApp()
let currentPage = 0 // 当前第几页,0代表第一页 
// 旋转初始化
var _animation = wx.createAnimation({
  duration: _ANIMATION_TIME,
  timingFunction: 'linear', 
  delay: 0,
  transformOrigin: '50% 50% 0'
})
var _animationIndex = 0; // 动画执行次数index（当前执行了多少次）
var _animationIntervalId = -1; // 动画定时任务id，通过setInterval来达到无限旋转，记录id，用于结束定时任务
const _ANIMATION_TIME = 400; // 动画播放一次的时长ms
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    lineHeight: getApp().globalData.lineHeight,
    rectHeight: getApp().globalData.rectHeight,
    noramalData: [],
    current: 0,
    tabitem: [{
        title: "全部",
        type: 0
      },
      {
        title: "日常",
        type: 0
      },
      {
        title: "情墙",
        type: 0
      },
      {
        title: "学习",
        type: 0
      },
      {
        title: "地点",
        type: 0
      },
      {
        title: "二手",
        type: 0
      },
      {
        title: "社团",
        type: 0
      },
      {
        title: "拾领",
        type: 0
      },
      {
        title: "活动",
        type: 0
      },
      {
        title: "吐槽",
        type: 0
      },
      {
        title: "探店",
        type: 0
      }
    ],
    info: {
      licensePicUrls: [],
    },
    hideHidden: true,
    menu: [], // 发布栏的选择
    //imgShow:false,
    leftList: [],
    rightList: [],
    formTitle: ' ',
    formText: ' ',
    showModel: false,
    //tempFilePaths: '',
    Label: '全部',
    imageHeight: 0,
    imageWidth: 0,
    currentItemHeight: 0,
    leftH: 0,
    rightH: 0,
    photo: [],
    //Input:"",
    resultLength: 0,
    loadMore: false, //"上拉加载"的变量，默认false，隐藏  
    loadAll: false, //“没有数据”的变量，默认false，隐藏 
    fileIDs: [],
    addAft: 0,
    Showtabitem: 1,
    direction: " ",
    directionIndex: 0,
    showLoading: 0,
    animation: '',
    campus_account: false,
    describe: "",
    content: "",
    openusername: {}, //点赞人的对象
    // rotateIndex: '',
    // animationData: {}
  },
  getNewInfo() { // 获取新消息总数
    var that = this;
    const agrs = wx.getStorageSync('args')
    // 被评论者信息
    let be_character = {
      userName:this.data.content.username,    
      iconUrl: agrs.iconUrl,
      nickName: agrs.nickName
    }
    wx.cloud.database().collection('New-Information').where({
      be_character: be_character,
      status: 0
    }).count().then(res => {
      that.setData({
        NewInfo: res.total
      })
    })
  },
  naviToMyself() { // 跳转到个人信息页面
    wx.switchTab({
      url: '/pages/myself/myself',
    })
  },
  naviToNews() { // 跳转到新消息提示页面
    wx.navigateTo({
      url: './NewInfo/NewInfo',
    })
  },
  search_Input: function (e) {
    console.log("e.", e.detail.value)
    console.log("this.data.noramalData", this.data.noramalData)
    const setEmptyStatus = () => { 
      currentPage = 0
      this.data.leftList = []
      this.data.rightList = []
      this.data.leftH = 0
      this.data.rightH = 0
      var allData = res.result.data
      for (let i = 0; i < allData.length; i++) {
        if (this.data.leftH == this.data.rightH || this.data.leftH < this.data.rightH) { //判断左右两侧当前的累计高度，来确定item应该放置在左边还是右边
          this.data.leftList.push(allData[i]);
          this.data.leftH += allData[i].ShowHeight;
        } else {
          this.data.rightList.push(allData[i]);
          this.data.rightH += allData[i].ShowHeight;
        }
      }}
    if (e.detail.value) {
      wx.cloud.callFunction({
        name: "CampusCircle",
        data: {
          username: that.data.username,
          type: "search",
          searchKey: e.detail.value
        },
        success: res => {
          if (res.result.data.length != 0) {
            setEmptyStatus()
            this.data.tabitem[0].type = 1
            this.setData({
              leftList: this.data.leftList,
              rightList: this.data.rightList,
              leftH: this.data.leftH,
              right: this.data.rightH,
              tabitem: this.data.tabitem,
            });
            this.data.tabitem[0].type = 0
          } else {
            wx.showToast({
              icon: "none",
              title: "什么都找不到哟"
            })
            this.data.tabitem[0].type = 1
            this.setData({
              leftList: [],
              rightList: [],
              leftH: 0,
              right: 0,
              tabitem: this.data.tabitem,
            });
            this.data.tabitem[0].type = 0
          }
        },
        fail: err => {
          console.error
        }
      })
    } else {
      setEmptyStatus()
      for (let j = 0; j < this.data.tabitem.length; j++) {
        if (this.data.tabitem[j].title == this.data.Label) {
          this.data.tabitem[j].type = 1
          this.setData({
            tabitem: this.data.tabitem,
          })
          this.data.tabitem[j].type = 0
          break
        }
      }
      this.setData({
        leftList: this.data.leftList,
        rightList: this.data.rightList,
        leftH: this.data.leftH,
        right: this.data.rightH,
      });
    }
  },
  onReady: function () {
    _animationIndex = 0;
    _animationIntervalId = -1;
    this.data.animation = '';
  },
  /**
   * 实现image旋转动画，每次旋转 120*n度
   */
  rotateAni: function (n) {
    _animation.rotate(120 * (n)).step()
    this.setData({
      animation: _animation.export()
    })
  },
  /**
   * 开始旋转
   */
  startAnimationInterval: function () {
    var that = this;
    that.rotateAni(++_animationIndex); // 进行一次旋转
    _animationIntervalId = setInterval(function () {
      that.rotateAni(++_animationIndex);
    }, _ANIMATION_TIME); // 每间隔_ANIMATION_TIME进行一次旋转
    console.log("begin")
  },
  stopAnimationInterval: function () {
    if (_animationIntervalId > 0) {
      clearInterval(_animationIntervalId);
      _animationIntervalId = 0;
      console.log("stop")
    }
  },
  binderrorimg: function () {
    var errorImg = " "
    errorImg = "./Errimages.png" //我们构建一个对象
    this.setData(errorImg) //修改数据源对应的数据
  },
  /*添加内容图标按钮*/
  add() {
    var showModel = this.data.showModel
    var that = this
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
  User() {
    //TurnPage=1
    wx.navigateTo({
      url: "UserContent/UserContent",
    })
  },
  leftDirection: function () {
    this.data.direction = "Left"
  },
  rightDirection: function () {
    this.data.direction = "Right"
  },
  getBackData(e) {
    this.data.directionIndex = e.detail
    console.log("e.detail", e.detail)
  },

  chooseimage: function () {
    var that = this;
    if (that.data.photo.length == 0) {
      wx.chooseImage({
        count: 2,
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
  setTab: function (e) {
    var arry = this.data.tabitem
    if (this.data.Showtabitem == 1) {
      arry[0].type = 0
      console.log("2333")
    }
    this.data.Showtabitem = 0
    var index = e.currentTarget.dataset.index

    this.data.Label = arry[index].title
    arry[index].type = 1
    this.setData({
      tabitem: arry,
    })
    arry[index].type = 0
    currentPage = 0
    this.data.leftList = []
    this.data.rightList = []
    this.data.leftH = 0
    this.data.rightH = 0
    this.data.noramalData = []
    this.data.addAft = 0
    this.getData()
  },
  clickMenu: function (e) {
    var that = this;
    // 获取当前的状态，是否隐藏的值
    var staues = that.data.hideHidden;
    console.log("111", staues);
    // 第几个状态
    that.setData({
      hideHidden: !staues,
    })
  },
  clickMenuSecond: function (e) {
    var that = this;
    console.log("打印索引值233", e.currentTarget.dataset.index);
    // 获取索引值
    var index = e.currentTarget.dataset.index;
    console.log("that.data.arrayMenu.menu[index].cent", that.data.menu[index])
    that.setData({
      choosenLabel: that.data.menu[index],
    })
  },

  formSubmit: function (e) { //添加与存储
    let {
      formTitle,
      formText
    } = e.detail.value

    var that = this
    if (!formTitle) {
      wx.showToast({
        title: '标题不能为空',
        icon: 'none'
      })
    } else if (!formText) {
      wx.showToast({
        title: '文字不能为空',
        icon: 'none'
      })
    } else if (that.data.photo.length == 0) {
      wx.showToast({
        title: '图片不能为空',
        icon: 'none'
      })
    } else if (!that.data.choosenLabel) {
      wx.showToast({
        title: '标签不能为空',
        icon: 'none'
      })
    } else if (!that.data.nickname && !that.data.iconUrl) {
      wx.showToast({
        title: '小主还没登录哟QwQ',
        icon: 'none'
      })
    } else {
      var add = {
        "Cover": that.data.photo[0],
        "AllPhoto": JSON.parse(JSON.stringify(that.data.photo)),
        "Title": formTitle,
        "Text": formText,
        "CoverHeight": that.data.imageHeight,
        "CoverWidth": that.data.imageWidth,
        "Label": that.data.choosenLabel,
        "Time": new Date().getTime(),
        "nickName": that.data.nickname,
        "School": that.data.school,
        "iconUrl": that.data.iconUrl
      }
      console.log("that.data.nickname-Input", that.data.nickname)
      that.data.noramalData.push(add)
      var NewData = that.data.noramalData.length - 1
      that.CalculateImage()
      that.uploadimg(NewData)
    }
  },

  CalculateImage: function () {
    var that = this;
    var allData = that.data.noramalData;
    // console.log("that.data.leftH", that.data.leftH)
    // console.log("that.data.rightH", that.data.rightH)
    for (let i = 0; i < allData.length; i++) {
      var height = parseInt(Math.round(allData[i].CoverHeight * 370 / allData[i].CoverWidth));
      if (height) {
        var currentItemHeight = parseInt(Math.round(allData[i].CoverHeight * 370 / allData[i].CoverWidth));
        allData[i].ShowHeight = currentItemHeight
        if (currentItemHeight > 500) {
          currentItemHeight = 500
          allData[i].ShowHeight = currentItemHeight
        }
        allData[i].CoverHeight = currentItemHeight + "rpx"; //因为xml文件中直接引用的该值作为高度，所以添加对应单位
      }
    }
  },

  //以本地数据为例，实际开发中数据整理以及加载更多等实现逻辑可根据实际需求进行实现   
  onLoad: function () {
    currentPage = 0
    var that = this
    app.loginState() //判断登录
    this.getNewInfo() // 获取新消息通知
    //加载缓存获得学校和用户名和头像
    var data = wx.getStorageSync('args')
    that.data.tabitem = data.tabitem ? data.tabitem.map(e => {
      return {
        title: e,
        type: 0
      }
    }) : that.data.tabitem // that.data.tabitem是兜底数据
    var menu = that.data.tabitem.map(e => e.title)
    menu.splice(0, 1)
    that.data.tabitem[0].type = 1
    var campus_account = data.campus_account ? data.campus_account : false
    var describe = data.describe ? data.describe : false
    //判断封号
    if (campus_account === true) {
      wx.showModal({
        title: "提示",
        content: describe,
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }
        }
      })
    }
    that.setData({
      school: data.schoolName,
      menu,
      nickname: data.nickName,
      iconUrl: data.iconUrl,
      tabitem: that.data.tabitem,
      campus_account: campus_account,
      describe: describe,
      username: data.username,
      openusername: {
        username: data.username,
        iconUrl: data.iconUrl,
        nickName: data.nickName
      }
    })
    that.onPullDownRefresh()
  },
  //将本地图片上传到云存储进行存储，后续通过fileid进行图片展示
  // 图片上传逻辑
  // 1.判断条件，是否符合上传条件
  // 2.自定义函数上传图片到云存储
  // 3.将所有信息保存到数据库
  uploadimg: function (NewData) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var path = this.data.noramalData[NewData].AllPhoto
    console.log(path)
    var fileIDs = []
    var that = this
    for (var i = 0; i < path.length; i++) {
      wx.compressImage({
        src: path[i], // 图片路径
        quality: 20, // 压缩质量,
        success(res) {
          console.log(res)
          wx.cloud.uploadFile({
            cloudPath: 'CampusCircle_images/' + new Date().getTime() + Math.floor(Math.random() * 150) + '.png',
            filePath: res.tempFilePath,
          }).then(res => {
            fileIDs.push(res.fileID)
            console.log(fileIDs)
            that.uploadData(NewData, fileIDs)
          })
        }
      })

    }
  },
  //下拉触底改变状态
  onReachBottom: function () {
    console.log("上拉触底事件")
    let that = this
    if (!that.data.loadMore) {
      that.setData({
        loadMore: true, //加载中  
        loadAll: false //是否加载完所有数据
      });
      wx.showLoading({
        title: '加载更多中',
      })
      this.getNewInfo(); // 上拉刷新，是否有新消息
      that.getData()
      console.log("currentPage-onReachBottom", currentPage)
      wx.hideLoading()
      //加载更多，这里做下延时加载

    }
  },
  //将数据上传到数据库
  uploadData: function (NewData, fileIDs) {
    var that = this
    if (fileIDs.length == that.data.noramalData[NewData].AllPhoto.length) {
      console.log("NewData", NewData)
      console.log("that.data.noramalData[NewData].AllPhoto.length", that.data.noramalData[NewData].AllPhoto.length)
      console.log("fileIDs-Aft.length", fileIDs.length)
      wx.cloud.callFunction({
        name: 'CampusCircle',
        data: {
          Cover: fileIDs[0],
          AllPhoto: fileIDs,
          Title: that.data.noramalData[NewData].Title,
          Text: that.data.noramalData[NewData].Text,
          CoverHeight: that.data.noramalData[NewData].CoverHeight,
          CoverWidth: that.data.noramalData[NewData].CoverWidth,
          Label: that.data.noramalData[NewData].Label,
          Time: that.data.noramalData[NewData].Time,
          ShowHeight: that.data.noramalData[NewData].ShowHeight,
          School: that.data.noramalData[NewData].School,
          nickName: that.data.noramalData[NewData].nickName,
          username: that.data.username,
          iconUrl: that.data.noramalData[NewData].iconUrl,
          Star: 0,
          type: 'write'
        },
        success: res => {
          console.log("add", res)
          wx.showToast({
            duration: 4000,
            title: '添加成功'
          })
          that.onLoad()
          that.data.addAft = 1
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
  },

  //提高网络性能，分页加载数据
  getData: function () {
    let that = this;
    // console.log("that.data.noramalData", that.data.noramalData)
    that.data.noramalData = []
    // console.log("ShowId", that.data.Label)
    //第一次加载数据
    if (currentPage == 1) {
      this.setData({
        loadMore: true, //把"上拉加载"的变量设为true，显示  
        loadAll: false //把“没有数据”设为false，隐藏  
      })
    }
    console.log("that.data.addAft", that.data.addAft)
    console.log("currentPage", currentPage)
    //云数据的请求
    wx.cloud.callFunction({
      name: "CampusCircle",
      data: {
        type: "read",
        username: that.data.username,
        currentPage: currentPage,
        ShowId: that.data.Label,
        addAft: that.data.addAft,
        School: that.data.school
      },
      success(res) {
        if (res.result === null) {
          that.getData()
        } else {
          that.data.resultLength = res.result.data.length
        }
        console.log("that.data.resultLength", that.data.resultLength)
        if (res.result && res.result.data.length > 0) {
          console.log("请求成功", res.result.data)
          currentPage++
          //把新请求到的数据添加到noramalData里  
          let Batch_Data = that.data.noramalData.concat(res.result.data)
          var allData = res.result.data
          console.log(Batch_Data)
          for (let i = 0; i < allData.length; i++) {
            if (that.data.leftH == that.data.rightH || that.data.leftH < that.data.rightH) { //判断左右两侧当前的累计高度，来确定item应该放置在左边还是右边
              that.data.leftList.push(allData[i]);
              that.data.leftH += allData[i].ShowHeight;
            } else {
              that.data.rightList.push(allData[i]);
              that.data.rightH += allData[i].ShowHeight;
            }
          }
          that.setData({
            leftList: that.data.leftList,
            rightList: that.data.rightList,
            leftH: that.data.leftH,
            right: that.data.rightH,
            noramalData: Batch_Data, //获取数据数组    
            loadMore: false, //把"上拉加载"的变量设为false，显示  
            DataNull: 1,
            showLoading: 1
          });
          if (res.result.data.length < 10) {
            that.setData({
              loadMore: false, //隐藏加载中。。
              loadAll: true, //所有数据都加载完了
              DataNull: 0,
              showLoading: 1
            });
          }
        } else {
          if (that.data.leftH == 0 && that.data.rightH == 0) {
            that.setData({
              leftList: [],
              rightList: [],
            })
          }
          that.setData({
            loadAll: true, //把“没有数据”设为true，显示  
            loadMore: false, //把"上拉加载"的变量设为false，隐藏  
            DataNull: 0,
            showLoading: 1
          });
        }
      },
      fail(res) {
        console.log("请求失败", res)
        that.setData({
          loadAll: false,
          loadMore: false
        });
      }
    })
  },
  // 下拉刷新
  onPullDownRefresh() {
    var that = this
    //var showLoading=0
    wx.showNavigationBarLoading()              //在标题栏中显示加载
    that.setData({
      showLoading: 0
    })
    that.startAnimationInterval()
    console.log("下拉刷新")
    //that.startAnimationInterval()
    that.data.leftList = []
    that.data.rightList = []
    that.data.leftH = 0
    that.data.rightH = 0
    that.data.noramalData = []
    that.data.addAft = 0
    currentPage = 0
    that.getData()
    wx.hideNavigationBarLoading()             //完成停止加载
    wx.stopPullDownRefresh()                  //停止下拉刷新
  },
  onShow: function () {
    // console.log(app.globalData.List,21)
    var index = this.data.directionIndex
    if (this.data.direction == "Left") {
      this.data.leftList = app.globalData.List ? app.globalData.List : this.data.leftList
      this.data.leftList[index].CommentList = app.globalData.Comment //回复全局
      this.data.leftList[index].Star = app.globalData.Star_count
      this.data.leftList[index].Star_User = app.globalData.Star_User
    } else if (this.data.direction == "Right") {
      this.data.rightList = app.globalData.List ? app.globalData.List : this.data.rightList
      this.data.rightList[index].CommentList = app.globalData.Comment //回复全局
      this.data.rightList[index].Star = app.globalData.Star_count
      this.data.rightList[index].Star_User = app.globalData.Star_User
    }
    this.setData({
      leftList: this.data.leftList,
      rightList: this.data.rightList
    })
    this.getNewInfo()
    // console.log(this.data.leftList,"左");
    // console.log(this.data.rightList,"右");
  },
  onShareAppMessage: function (res) {
    return {
      title: 'WE校园',
    }
  },

})