angular.module('starter.services', [])
//service在使用this指针，而factory直接返回一个对象
  .service('CommonService', function ($ionicPopup, $ionicPopover, $rootScope, $state, $ionicModal, $cordovaCamera, $cordovaImagePicker, $ionicPlatform, $ionicActionSheet, $ionicHistory, $timeout, $cordovaToast, $cordovaGeolocation, $cordovaBarcodeScanner, $ionicViewSwitcher, $ionicLoading, AccountService, WeiXinService, EncodingService) {
    return {
      platformPrompt: function (msg, stateurl) {
        if ($ionicPlatform.is('android') || $ionicPlatform.is('ios')) {
          try {
            $cordovaToast.showLongCenter(msg);
          } catch (e) {
            this.showAlert("元亨祥", msg, stateurl);
          }
        } else {
          this.showAlert("元亨祥", msg, stateurl);
        }
      },
      showAlert: function (title, template, stateurl) {
        // 一个提示对话框
        var alertPopup = $ionicPopup.alert({
          cssClass: "show-alert",
          title: title,
          template: template,
          okText: '确定',
          okType: 'button-positive'
        });
        alertPopup.then(function (res) {
          if (stateurl == null || stateurl == '') {
            $ionicHistory.goBack();
          } else if (stateurl == 'close') {//不处理

          } else {
            $state.go(stateurl, {}, {reload: true});
          }

        });
      },
      showConfirm: function (title, template, okText, cancelText, stateurl, closeurl, confirmfunction) {
        var confirmPopup = $ionicPopup.confirm({
          cssClass: "show-confirm",
          title: '<strong>' + title + '</strong>',
          template: template,
          okText: okText,
          cancelText: cancelText,
          okType: 'button-positive',
          cancelType: 'button-assertive'
        });

        confirmPopup.then(function (res) {
          if (res) {
            if (stateurl != '') {
              $state.go(stateurl, {}, {reload: true});
              $ionicViewSwitcher.nextDirection("forward");//前进画效果
            } else {
              confirmfunction();
            }

          } else {
            if (closeurl == 'close') {//不处理
              return;
            }
            $state.go((closeurl == null || closeurl == '') ? 'tab.main' : closeurl, {}, {reload: true})
            $ionicViewSwitcher.nextDirection("back");//后退动画效果
          }
        });
      },

      customModal: function ($scope, templateurl, index, animation) { //自定义modal ndex页面出现多个模态框的情况 进行命名区别 index 可以为1.2.3.   animation动画slide-in-left slide-in-right
        index = index == undefined ? "" : index;
        $ionicModal.fromTemplateUrl(templateurl, {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          $scope["modal" + index] = modal;
        });
        $scope.openModal = function () {
          $scope["modal" + index].show();
        };
        $scope.closeModal = function () {
          $scope["modal" + index].hide();
        };
        //当我们用到模型时，清除它！
        $scope.$on('$destroy', function () {
          $scope["modal" + index].remove();
        });
        // 当隐藏的模型时执行动作
        $scope.$on('modal' + index + '.hide', function () {
          // 执行动作
        });
        // 当移动模型时执行动作
        $scope.$on('modal' + index + '.removed', function () {
          // 执行动作
        });
      }
      ,
      ionicPopover: function ($scope, templateUrl) {
        $ionicPopover.fromTemplateUrl('templates/popover/' + templateUrl, {
          scope: $scope,
        }).then(function (popover) {
          $scope.popover = popover;
        });
        $scope.openPopover = function ($event) {
          $scope.popover.show($event);
          //动态计算popover高度
          $rootScope.popoversize = document.querySelectorAll("#mypopover a").length * 55 + 'px';
        };
        $scope.closePopover = function () {
          $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it! 清除浮动框
        $scope.$on('$destroy', function () {
          $scope.popover.remove();
        });
        $scope.$on('$ionicView.leave', function () {
          $scope.popover.hide();
        });
        // 在隐藏浮动框后执行
        $scope.$on('popover.hidden', function () {
          // Execute action
        });
        // 移除浮动框后执行
        $scope.$on('popover.removed', function () {
          // Execute action
        });
      },

      ionicLoadingShow: function (content) {
        $ionicLoading.show({
          template: '<ion-spinner icon="bubbles" class="spinner-positive"></ion-spinner><p>' + (content ? content : '') + '</p>',
          animation: 'fade-in',
          showBackdrop: false

        });
      },
      ionicLoadingHide: function () {
        $ionicLoading.hide();
      },

      //扫一扫
      barcodeScanner: function ($scope) {
        //是否是微信
        if (WeiXinService.isWeiXin()) {
          //通过config接口注入权限验证配置
          WeiXinService.weichatConfig(localStorage.getItem("timestamp"), localStorage.getItem("noncestr"), localStorage.getItem("signature"));
          //通过ready接口处理成功验证
          wx.ready(function () {
            WeiXinService.wxscanQRCode($scope, $scope ? 1 : 0); //调起微信扫一扫接口
          })
          return;
        }
        /*      先检测设备是否就绪，通过cordova内置的原生事件deviceready来检测*/
        document.addEventListener("deviceready", function () {
          $cordovaBarcodeScanner
            .scan()
            .then(function (barcodeData) {
              // Success! Barcode data is here 扫描数据：barcodeData.text
              var reg = new RegExp("^((http)||(https)){1}://[\s]{0,}");//二维码信息是否有http链接
              if (reg.test(barcodeData.text)) {
                //通过默认浏览器打开
                window.open(barcodeData.text, '_system', 'location=yes');
              } else {
                $cordovaToast.showShortCenter('扫一扫信息:', barcodeData.text);
              }
            }, function (error) {
              $cordovaToast.showShortCenter('扫描失败,请重新扫描');
            });


          // NOTE: encoding not functioning yet 编不能正常工作
          $cordovaBarcodeScanner
            .encode(BarcodeScanner.Encode.TEXT_TYPE, "http://www.nytimes.com")
            .then(function (success) {
              // Success!
            }, function (error) {
              // An error occurred
            });
        }, false);
      }
      ,
      shareActionSheet: function (title, desc, link, imgUrl) {
        //通过config接口注入权限验证配置
        WeiXinService.weichatConfig(localStorage.getItem("timestamp"), localStorage.getItem("noncestr"), localStorage.getItem("signature"));
        //通过ready接口处理成功验证
        wx.ready(function () {
          // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
          //自动调用分享按钮注册和自定义分享
          WeiXinService.wxonMenuShareTimeline(title, link, imgUrl);//微信朋友圈
          WeiXinService.wxonMenuShareAppMessage(title, desc, link, imgUrl);//微信好友
          WeiXinService.wxonMenuShareQQ(title, desc, link, imgUrl);//QQ好友
          WeiXinService.wxonMenuShareQZone(title, desc, link, imgUrl);//QQ空间

        });

      },
      uploadActionSheet: function ($scope, filename) {
        CommonService = this;
        $ionicActionSheet.show({
          cssClass: 'action-s',
          titleText: '上传照片',
          buttons: [
            {text: '图库'},
            {text: '拍照'},
          ],
          cancelText: '取消',
          cancel: function () {
            return true;
          },
          buttonClicked: function (index) {
            switch (index) {
              case 0:
                CommonService.takePicture($scope, 0, filename)
                break;
              case 1:
                CommonService.takePicture($scope, 1, filename)
                break;
              default:
                break;
            }
            return true;
          }
        });
      },
      //调用摄像头和相册 type 0是图库 1是拍照
      takePicture: function ($scope, type, filenames) {
        //统计上传成功数量
        $scope.imageSuccessCount = 0;
        //是否是微信
        if (WeiXinService.isWeiXin()) {
          //通过config接口注入权限验证配置
          WeiXinService.weichatConfig(localStorage.getItem("timestamp"), localStorage.getItem("noncestr"), localStorage.getItem("signature"));
          //通过ready接口处理成功验证
          wx.ready(function () {
            WeiXinService.wxchooseImage($scope, type); //拍照或从手机相册中选图接口
          })
          return;
        }
        if (type == 0) {//图库
          var options = {
            maximumImagesCount: 6 - $scope.imageList.length,//需要显示的图片的数量
            width: 800,
            height: 800,
            quality: 80
          };
          $cordovaImagePicker.getPictures(options).then(function (results) {
            $scope.imageUploadCount = results.length;
            for (var i = 0, len = results.length; i < len; i++) {
              $scope.imageList.push(results[i]);
              AccountService.addFiles($scope, {filenames: filenames}, results[i]);
            }

          }, function (error) {
            $cordovaToast.showLongCenter('获取图片失败');
          });
        }
        if (type == 1) {  //拍照
          //$cordovaCamera.cleanup();
          var options = {
            quality: 100,//相片质量0-100
            destinationType: Camera.DestinationType.FILE_URI,        //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
            sourceType: type == 0 ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA,//从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
            allowEdit: false,                                        //在选择之前允许修改截图
            encodingType: Camera.EncodingType.JPEG,                   //保存的图片格式： JPEG = 0, PNG = 1
            targetWidth: 500,                                        //照片宽度
            targetHeight: 500,                                       //照片高度
            mediaType: 0,                                             //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
            cameraDirection: 0,                                       //枪后摄像头类型：Back= 0,Front-facing = 1
            saveToPhotoAlbum: true                                   //保存进手机相册
          };

          $cordovaCamera.getPicture(options).then(function (imageUrl) {
            $scope.imageUploadCount = 1;
            $scope.imageList.push(imageUrl);
            AccountService.addFiles($scope, {filenames: filenames}, imageUrl);

          }, function (err) {
            // An error occured. Show a message to the user
            $cordovaToast.showLongCenter('获取照片失败');

          });
        }

      },
      getLocation: function (callback) { //获取当前经纬度
        //是否是微信
        if (WeiXinService.isWeiXin()) {
          //通过config接口注入权限验证配置
          WeiXinService.weichatConfig(localStorage.getItem("timestamp"), localStorage.getItem("noncestr"), localStorage.getItem("signature"));
          //通过ready接口处理成功验证
          wx.ready(function () {
            WeiXinService.wxgetLocation(); //获取地理位置接口
          })
          return;
        }
        CommonService = this;
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            localStorage.setItem("longitude", position.coords.longitude);//经度
            localStorage.setItem("latitude", position.coords.latitude);//纬度
            callback.call(this);
          }, function (err) {
            // CommonService.platformPrompt("获取定位失败", 'close');
          });
      },
      isLogin: function (flag) {//判断是否登录
        if (!localStorage.getItem("token")) {
          if (flag) {
            $state.go('login');
            $ionicViewSwitcher.nextDirection("forward");//前进画效果
          } else {
            this.showConfirm('元亨祥', '温馨提示:此功能需要登录才能使用,请先登录', '登录', '关闭', 'login');
            return;
          }
          return false;
        } else {
          return true;
        }
      },
      getStateName: function () {    //得到上一个路由名称方法
        var stateName = "";
        if ($ionicHistory.backView() && $ionicHistory.backView().stateName != "tab.account") {
          stateName = $ionicHistory.backView().stateName;
        }
        if (stateName) {
          $ionicHistory.goBack();
        } else {
          $state.go("tab.main", {}, {reload: true});
        }
      },

      windowOpen: function (url) {        //通过默认浏览器打开
        if (ionic.Platform.isWebView()) {  // Check if we are running within a WebView (such as Cordova)
          window.open(url, '_system', 'location=yes');
        } else {//如果是H5浏览器页面或者微信
          window.open(url, "_self");
        }

      },

      toolTip: function (msg, type) { //全局tooltip提示
        this.message = msg;
        this.type = type;
        //提示框显示最多3秒消失
        var _self = this;
        $timeout(function () {
          _self.message = null;
          _self.type = null;
        }, 3000);
      },
      authParams: function (json) { //接口身份认证参数签名加密封装
        json.mid = localStorage.getItem("mid");//用户id
        json.token = localStorage.getItem("token");//用户token
        // 将参数按照参数名ASCII码从小到大排序（字典序）
        var dicJson = Object.keys(json).sort();
        //使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串
        var signTemp = ""
        angular.forEach(dicJson, function (key) {
          signTemp += key + "=" + encodeURIComponent(json[key]) + "&"
        })
        signTemp = (signTemp.substring(0, signTemp.length - 1)) + "tkm";
        json.signature = EncodingService.md5(signTemp);
        return json;

      },

    }
  })
  .service('MainService', function ($q, $http, YuanHenXiang) { //首页服务定义
    return {
      getCurrentCityName: function (params) { //获取首页地理位置城市名称 高德web API
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: " http://restapi.amap.com/v3/geocode/regeo",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (data) {
          deferred.reject(data);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getAdvList: function (params) { //获取首页广告列表
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Adv/getAdvList",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (data) {
          deferred.reject(data);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      }
    }
  })
  .service('ClassifyService', function ($q, $http, YuanHenXiang) { //产品分类服务定义
    return {
      getClassify: function (params) { //产品分类类别 侧边栏
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Goods/getGoodsCategory",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getClassifyDetails: function (params) { //产品分类类别详情数据
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "www/json/classify.json",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      }
    }
  })
  .service('GoodService', function ($q, $http, YuanHenXiang) { //产品商品服务定义
    return {
      getGoodsList: function (params) { //商品列表
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Goods/getGoodsList",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      }
    }
  })
  .service('AccountService', function ($q, $http, YuanHenXiang, $cordovaFileTransfer, $state, $cordovaToast, $interval, $timeout, $ionicPopup, $ionicLoading, $cordovaFile, $cordovaFileOpener2) {
    return {
      login: function (params) { //登录
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Login/login",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getVerifyCode: function (params) { //获取验证码
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Login/getVerify",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      register: function (params) { //注册方法
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Login/register",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      logout: function (params) { //退出登录
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Login/logout",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      resetPassword: function (params) { //重置密码
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Login/resetPassword",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      editPassword: function (params) { //修改密码
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Login/editPassword",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      countDown: function ($scope) {//60s倒计时
        var second = 60,
          timePromise = undefined;
        timePromise = $interval(function () {
          if (second <= 0) {
            $interval.cancel(timePromise);
            $scope.paracont = "重发验证码";
            $scope.paraclass = true;
          } else {
            $scope.paraclass = false;
            $scope.paracont = second + "s后重试";
            second--;
          }
        }, 1000, 100);
      },
      checkMobilePhone: function ($scope, mobilephone) {  //检查手机号
        if (/^1(3|4|5|7|8)\d{9}$/.test(mobilephone)) {
          $scope.paraclass = true;
          return true;
        } else {
          $scope.paraclass = false;
          return false;
        }
      },
      memberInfo: function (params) { //完善资料增加
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Member/info",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getMemberInfo: function (params) { //获取会员信息
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Member/getMemberInfo",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getAddressList: function (params) { //获取地址列表
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Address/getAddressList",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getAddressInfo: function (params) { //获取地址信息
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Address/getAddressInfo",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getDefaultAddress: function (params) { //获取默认地址
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Address/getDefaultAddress",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getDistrict: function (params) { //行政区域查询高德web API
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: "http://restapi.amap.com/v3/config/district",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (data) {
          deferred.reject(data);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      addAddress: function (params) { //添加地址
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Address/addAddress",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      updateAddress: function (params) { //修改地址
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Address/updateAddress",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      deleteAddress: function (params) { //删除地址
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Address/deleteAddress",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getBalance: function (params) { //我的余额
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Account/getBalance",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getIncome: function (params) { //我的收入
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Account/incmoeLog",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getWithdrawLog: function (params) { //我的提现
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Account/withdrawLog",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      addFeedback: function (params) { //添加反馈
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/Feedback/addFeedback",
          data: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      getConfigInfo: function (params) { //获取配置信息
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/Config/getConfigInfo",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      addFiles: function ($scope, params, imageUrl) {//上传附件
        //图片上传upImage（图片路径）
        //http://ngcordova.com/docs/plugins/fileTransfer/  资料地址
        var url = YuanHenXiang.api + "/Upload/uploadImage";//上传服务器地址
        var options = {
          fileKey: "image",//相当于form表单项的name属性
          fileName: imageUrl.substr(imageUrl.lastIndexOf('/') + 1),
          mimeType: "image/jpeg"
        };
        $cordovaFileTransfer.upload(url, imageUrl, options)
          .then(function (result) {
            var result = JSON.parse(result.response);
            $scope.imgsPicAddr.push(result.data.info.url);
            $scope.imageSuccessCount++;
            if ($scope.imageSuccessCount == $scope.imageUploadCount) {
              if (result.status == 1) {
                $cordovaToast.showLongCenter("上传图片成功");
              }
            }
            console.log("success=" + JSON.stringify(result));
          }, function (err) {
            $cordovaToast.showLongCenter("上传图片失败");
            $scope.imageList.splice(imageUrl, 1);//删除失败以后不显示
            console.log("err=" + err.response);
          }, function (progress) {
            // constant progress updates
          });
      },
      showUpdateConfirm: function (updatecontent, appurl, version) {    // 显示是否更新对话框
        var confirmPopup = $ionicPopup.confirm({
          cssClass: "show-updateconfirm",
          title: '<strong>发现新版本' + version + '</strong>',
          template: updatecontent, //从服务端获取更新的内容
          cancelText: '稍后再说',
          okText: '立刻更新',
          okType: 'button-positive',
          cancelType: 'button-assertive'
        });
        confirmPopup.then(function (res) {
          if (res) {
            $ionicLoading.show({
              template: "已经下载：0%"
            });
            var url = appurl; //可以从服务端获取更新APP的路径
            try {
              var targetPath = cordova.file.externalRootDirectory + "/boolv/boolv.apk"; //APP下载存放的路径，可以使用cordova file插件进行相关配置
            } catch (e) {
              $ionicLoading.hide();
            }

            var trustHosts = true;
            var options = {};
            $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
              // 打开下载下来的APP
              $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
              ).then(function () {
                // 成功
              }, function (err) {
                // 错误
              });
              $ionicLoading.hide();

            }, function (err) {
              $cordovaToast.showLongCenter("APP下载失败," + err);
              $ionicLoading.hide();
              return;
            }, function (progress) {
              //进度，这里使用文字显示下载百分比
              $timeout(function () {
                var downloadProgress = (progress.loaded / progress.total) * 100;
                $ionicLoading.show({
                  template: "已经下载：" + Math.floor(downloadProgress) + "%"
                });
                if (downloadProgress > 99) {
                  $ionicLoading.hide();
                }
              })
            });
          } else {
            // 取消更新
          }
        })
      }
    }
  })

  .service('WeiXinService', function ($q, $http, YuanHenXiang) { //微信 JS SDK 接口服务定义
    return {
      isWeiXin: function isWeiXin() { //判断是否是微信内置浏览器
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
          return true;
        } else {
          return false;
        }
      },
      //获取微信签名
      getWCSignature: function (params) {
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'POST',
          url: YuanHenXiang.api + "/wc/signature",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      //获取下载微信媒体文件
      getWCMedia: function (params) {
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: YuanHenXiang.api + "/wc/media",
          params: params
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },

      //获取微信支付统一下单接口参数
      getweixinPayData: function (params) {
        var deferred = $q.defer();// 声明延后执行，表示要去监控后面的执行
        var promise = deferred.promise
        promise = $http({
          method: 'GET',
          url: "http://www.6weiyi.com/jinlele/weixin/weixinPay/" + parseInt(new Date().getTime() / 1000) + "/0.01/商品微信支付测试/okhnkvvnLaxUQxAeH6v8SUcu9jZQ"
          //url: JinLeLe.api + "/weixin/weixinPay/" + params.orderNo + "/" + params.totalprice + "/" + params.descrip + "/" + params.openid
        }).success(function (data) {
          deferred.resolve(data);// 声明执行成功，即http请求数据成功，可以返回数据了
        }).error(function (err) {
          deferred.reject(err);// 声明执行失败，即服务器返回错误
        });
        return promise; // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      weixinPay: function (data) {//微信原生SDK支付
        var params = {
          partnerid: data.appId,     //公众号名称，由商户传入
          prepayid: data.package.replace("prepay_id=", ""), // prepay id
          noncestr: data.nonceStr, //随机串
          timestamp: data.timeStamp, //时间戳，自1970年以来的秒数
          sign: data.paySign //微信签名
        };
        alert(JSON.stringify(params))
        Wechat.sendPaymentRequest(params, function () {
          alert("Success");
        }, function (reason) {
          alert("Failed: " + reason);
        });
      },
      /*    所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用（同一个url仅需调用一次，对于变化url的SPA的web app可在每次url变化时进行调用,
       目前Android微信客户端不支持pushState的H5新特性，所以使用pushState来实现web app的页面会导致签名失败，此问题会在Android6.2中修复*/
      weichatConfig: function (timestamp, nonceStr, signature) { //微信JS SDK 通过config接口注入权限验证配置
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wx39ba5b2a2f59ef2c', // 必填，公众号的唯一标识
          timestamp: timestamp, // 必填，生成签名的时间戳
          nonceStr: nonceStr, // 必填，生成签名的随机串
          signature: signature,// 必填，签名，见附录1
          jsApiList: ['checkJsApi', 'chooseImage', 'uploadImage', 'getLocation', 'scanQRCode', 'chooseWXPay', 'onMenuShareAppMessage', 'onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
      },
      wxcheckJsApi: function () { //判断当前客户端版本是否支持指定微信 JS SDK接口
        wx.checkJsApi({
          jsApiList: ['chooseImage'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
          success: function (res) {
            // 以键值对的形式返回，可用的api值true，不可用为false
            // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
          }
        });

      },
      wxchooseImage: function ($scope, type) { //拍照或从手机相册中选图接口
        WeiXinService = this;
        wx.chooseImage({
          count: 6, // 默认9
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: type == 0 ? ['album'] : ['camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (results) {
            var localIds = results.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
            for (var i = 0, len = localIds.length; i < len; i++) {
              WeiXinService.wxuploadImage($scope, localIds[i].toString(), $scope.uploadtype)
            }
          }
        });
      },
      wxuploadImage: function ($scope, localId, uploadtype) {//微信上传图片接口
        WeiXinService = this;
        wx.uploadImage({
          localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
          isShowProgressTips: 1, // 默认为1，显示进度提示
          success: function (res) {
            var serverId = res.serverId; // 返回图片的服务器端ID
            //获取下载微信媒体文件
            $scope.mediaparams = {
              mediaId: serverId,//返回图片的服务器端ID
              optId: uploadtype //上传媒体操作类型 1.卖货单 2 供货单 3 买货单 4身份证 5 头像
            }
            WeiXinService.getWCMedia($scope.mediaparams).success(function (data) {
              $scope.imageList.push(data.Values.url);//客户端显示的url
            })
          }
        });
      },
      wxgetLocation: function () { //获取地理位置接口
        wx.getLocation({
          type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
          success: function (res) {
            var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
            var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
            var speed = res.speed; // 速度，以米/每秒计
            var accuracy = res.accuracy; // 位置精度
            localStorage.setItem("latitude", latitude);
            localStorage.setItem("longitude", longitude);
          }
        });
      },
      wxscanQRCode: function ($scope, type) {//调起微信扫一扫接口
        wx.scanQRCode({
          needResult: type, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
          success: function (res) {
            if (type == 1) {// 当needResult 为 1 时，扫码返回的结果
              var result = res.resultStr.split(",")[1];
            }
          }
        });
      },
      wxchooseWXPay: function () {//微信支付请求接口
        wx.chooseWXPay({
          timestamp: 0, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
          nonceStr: '', // 支付签名随机串，不长于 32 位
          package: '', // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
          signType: '', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
          paySign: '', // 支付签名
          success: function (res) {
            // 支付成功后的回调函数
          }
        });
      },
      wxonMenuShareAppMessage: function (title, desc, link, imgUrl) { //获取“分享给朋友”按钮点击状态及自定义分享内容接口
        wx.onMenuShareAppMessage({
          title: title, // 分享标题
          desc: desc, // 分享描述
          link: link, // 分享链接
          imgUrl: imgUrl, // 分享图标
          type: '', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
      },
      wxonMenuShareTimeline: function (title, link, imgUrl) {//获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
        wx.onMenuShareTimeline({
          title: title, // 分享标题
          link: link, // 分享链接
          imgUrl: imgUrl, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
      },
      wxonMenuShareQQ: function (title, desc, link, imgUrl) {//获取“分享到QQ”按钮点击状态及自定义分享内容接口
        wx.onMenuShareQQ({
          title: title, // 分享标题
          desc: desc, // 分享描述
          link: link, // 分享链接
          imgUrl: imgUrl, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
      },
      wxonMenuShareQZone: function (title, desc, link, imgUrl) {//获取“分享到QQ空间”按钮点击状态及自定义分享内容接口
        wx.onMenuShareQZone({
          title: title, // 分享标题
          desc: desc, // 分享描述
          link: link, // 分享链接
          imgUrl: imgUrl, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
      }
    }
  })
  .service('EncodingService', function () {
    return {
      md5: function (str) {
        var hexcase = 0;

        function hex_md5(a) {
          if (a == "") return a;
          return rstr2hex(rstr_md5(str2rstr_utf8(a)))
        }

        function hex_hmac_md5(a, b) {
          return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(b)))
        }

        function md5_vm_test() {
          return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72"
        }

        function rstr_md5(a) {
          return binl2rstr(binl_md5(rstr2binl(a), a.length * 8))
        }

        function rstr_hmac_md5(c, f) {
          var e = rstr2binl(c);
          if (e.length > 16) {
            e = binl_md5(e, c.length * 8)
          }
          var a = Array(16),
            d = Array(16);
          for (var b = 0; b < 16; b++) {
            a[b] = e[b] ^ 909522486;
            d[b] = e[b] ^ 1549556828
          }
          var g = binl_md5(a.concat(rstr2binl(f)), 512 + f.length * 8);
          return binl2rstr(binl_md5(d.concat(g), 512 + 128))
        }

        function rstr2hex(c) {
          try {
            hexcase
          } catch (g) {
            hexcase = 0
          }
          var f = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
          var b = "";
          var a;
          for (var d = 0; d < c.length; d++) {
            a = c.charCodeAt(d);
            b += f.charAt((a >>> 4) & 15) + f.charAt(a & 15)
          }
          return b
        }

        function str2rstr_utf8(c) {
          var b = "";
          var d = -1;
          var a, e;
          while (++d < c.length) {
            a = c.charCodeAt(d);
            e = d + 1 < c.length ? c.charCodeAt(d + 1) : 0;
            if (55296 <= a && a <= 56319 && 56320 <= e && e <= 57343) {
              a = 65536 + ((a & 1023) << 10) + (e & 1023);
              d++
            }
            if (a <= 127) {
              b += String.fromCharCode(a)
            } else {
              if (a <= 2047) {
                b += String.fromCharCode(192 | ((a >>> 6) & 31), 128 | (a & 63))
              } else {
                if (a <= 65535) {
                  b += String.fromCharCode(224 | ((a >>> 12) & 15), 128 | ((a >>> 6) & 63), 128 | (a & 63))
                } else {
                  if (a <= 2097151) {
                    b += String.fromCharCode(240 | ((a >>> 18) & 7), 128 | ((a >>> 12) & 63), 128 | ((a >>> 6) & 63), 128 | (a & 63))
                  }
                }
              }
            }
          }
          return b
        }

        function rstr2binl(b) {
          var a = Array(b.length >> 2);
          for (var c = 0; c < a.length; c++) {
            a[c] = 0
          }
          for (var c = 0; c < b.length * 8; c += 8) {
            a[c >> 5] |= (b.charCodeAt(c / 8) & 255) << (c % 32)
          }
          return a
        }

        function binl2rstr(b) {
          var a = "";
          for (var c = 0; c < b.length * 32; c += 8) {
            a += String.fromCharCode((b[c >> 5] >>> (c % 32)) & 255)
          }
          return a
        }

        function binl_md5(p, k) {
          p[k >> 5] |= 128 << ((k) % 32);
          p[(((k + 64) >>> 9) << 4) + 14] = k;
          var o = 1732584193;
          var n = -271733879;
          var m = -1732584194;
          var l = 271733878;
          for (var g = 0; g < p.length; g += 16) {
            var j = o;
            var h = n;
            var f = m;
            var e = l;
            o = md5_ff(o, n, m, l, p[g + 0], 7, -680876936);
            l = md5_ff(l, o, n, m, p[g + 1], 12, -389564586);
            m = md5_ff(m, l, o, n, p[g + 2], 17, 606105819);
            n = md5_ff(n, m, l, o, p[g + 3], 22, -1044525330);
            o = md5_ff(o, n, m, l, p[g + 4], 7, -176418897);
            l = md5_ff(l, o, n, m, p[g + 5], 12, 1200080426);
            m = md5_ff(m, l, o, n, p[g + 6], 17, -1473231341);
            n = md5_ff(n, m, l, o, p[g + 7], 22, -45705983);
            o = md5_ff(o, n, m, l, p[g + 8], 7, 1770035416);
            l = md5_ff(l, o, n, m, p[g + 9], 12, -1958414417);
            m = md5_ff(m, l, o, n, p[g + 10], 17, -42063);
            n = md5_ff(n, m, l, o, p[g + 11], 22, -1990404162);
            o = md5_ff(o, n, m, l, p[g + 12], 7, 1804603682);
            l = md5_ff(l, o, n, m, p[g + 13], 12, -40341101);
            m = md5_ff(m, l, o, n, p[g + 14], 17, -1502002290);
            n = md5_ff(n, m, l, o, p[g + 15], 22, 1236535329);
            o = md5_gg(o, n, m, l, p[g + 1], 5, -165796510);
            l = md5_gg(l, o, n, m, p[g + 6], 9, -1069501632);
            m = md5_gg(m, l, o, n, p[g + 11], 14, 643717713);
            n = md5_gg(n, m, l, o, p[g + 0], 20, -373897302);
            o = md5_gg(o, n, m, l, p[g + 5], 5, -701558691);
            l = md5_gg(l, o, n, m, p[g + 10], 9, 38016083);
            m = md5_gg(m, l, o, n, p[g + 15], 14, -660478335);
            n = md5_gg(n, m, l, o, p[g + 4], 20, -405537848);
            o = md5_gg(o, n, m, l, p[g + 9], 5, 568446438);
            l = md5_gg(l, o, n, m, p[g + 14], 9, -1019803690);
            m = md5_gg(m, l, o, n, p[g + 3], 14, -187363961);
            n = md5_gg(n, m, l, o, p[g + 8], 20, 1163531501);
            o = md5_gg(o, n, m, l, p[g + 13], 5, -1444681467);
            l = md5_gg(l, o, n, m, p[g + 2], 9, -51403784);
            m = md5_gg(m, l, o, n, p[g + 7], 14, 1735328473);
            n = md5_gg(n, m, l, o, p[g + 12], 20, -1926607734);
            o = md5_hh(o, n, m, l, p[g + 5], 4, -378558);
            l = md5_hh(l, o, n, m, p[g + 8], 11, -2022574463);
            m = md5_hh(m, l, o, n, p[g + 11], 16, 1839030562);
            n = md5_hh(n, m, l, o, p[g + 14], 23, -35309556);
            o = md5_hh(o, n, m, l, p[g + 1], 4, -1530992060);
            l = md5_hh(l, o, n, m, p[g + 4], 11, 1272893353);
            m = md5_hh(m, l, o, n, p[g + 7], 16, -155497632);
            n = md5_hh(n, m, l, o, p[g + 10], 23, -1094730640);
            o = md5_hh(o, n, m, l, p[g + 13], 4, 681279174);
            l = md5_hh(l, o, n, m, p[g + 0], 11, -358537222);
            m = md5_hh(m, l, o, n, p[g + 3], 16, -722521979);
            n = md5_hh(n, m, l, o, p[g + 6], 23, 76029189);
            o = md5_hh(o, n, m, l, p[g + 9], 4, -640364487);
            l = md5_hh(l, o, n, m, p[g + 12], 11, -421815835);
            m = md5_hh(m, l, o, n, p[g + 15], 16, 530742520);
            n = md5_hh(n, m, l, o, p[g + 2], 23, -995338651);
            o = md5_ii(o, n, m, l, p[g + 0], 6, -198630844);
            l = md5_ii(l, o, n, m, p[g + 7], 10, 1126891415);
            m = md5_ii(m, l, o, n, p[g + 14], 15, -1416354905);
            n = md5_ii(n, m, l, o, p[g + 5], 21, -57434055);
            o = md5_ii(o, n, m, l, p[g + 12], 6, 1700485571);
            l = md5_ii(l, o, n, m, p[g + 3], 10, -1894986606);
            m = md5_ii(m, l, o, n, p[g + 10], 15, -1051523);
            n = md5_ii(n, m, l, o, p[g + 1], 21, -2054922799);
            o = md5_ii(o, n, m, l, p[g + 8], 6, 1873313359);
            l = md5_ii(l, o, n, m, p[g + 15], 10, -30611744);
            m = md5_ii(m, l, o, n, p[g + 6], 15, -1560198380);
            n = md5_ii(n, m, l, o, p[g + 13], 21, 1309151649);
            o = md5_ii(o, n, m, l, p[g + 4], 6, -145523070);
            l = md5_ii(l, o, n, m, p[g + 11], 10, -1120210379);
            m = md5_ii(m, l, o, n, p[g + 2], 15, 718787259);
            n = md5_ii(n, m, l, o, p[g + 9], 21, -343485551);
            o = safe_add(o, j);
            n = safe_add(n, h);
            m = safe_add(m, f);
            l = safe_add(l, e)
          }
          return Array(o, n, m, l)
        }

        function md5_cmn(h, e, d, c, g, f) {
          return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d)
        }

        function md5_ff(g, f, k, j, e, i, h) {
          return md5_cmn((f & k) | ((~f) & j), g, f, e, i, h)
        }

        function md5_gg(g, f, k, j, e, i, h) {
          return md5_cmn((f & j) | (k & (~j)), g, f, e, i, h)
        }

        function md5_hh(g, f, k, j, e, i, h) {
          return md5_cmn(f ^ k ^ j, g, f, e, i, h)
        }

        function md5_ii(g, f, k, j, e, i, h) {
          return md5_cmn(k ^ (f | (~j)), g, f, e, i, h)
        }

        function safe_add(a, d) {
          var c = (a & 65535) + (d & 65535);
          var b = (a >> 16) + (d >> 16) + (c >> 16);
          return (b << 16) | (c & 65535)
        }

        function bit_rol(a, b) {
          return (a << b) | (a >>> (32 - b))
        };

        return hex_md5(str)
      }
    }
  })
  .factory('MyInterceptor', function ($injector) {//设置请求头信息的地方是$httpProvider.interceptors。也就是为请求或响应注册一个拦截器。使用这种方式首先需要定义一个服务

    return {
      request: function (config) {////通过实现 request 方法拦截请求: 该方法会在 $http 发送请求道后台之前执行
        if (config.url.toString().indexOf('http://') === 0) {
          //http请求Loading加载动画
          $injector.get('$ionicLoading').show({
            template: '<ion-spinner icon="bubbles" class="spinner-positive"></ion-spinner><p>',
            animation: 'fade-in',
            showBackdrop: false
          });
        }
        //授权
        config.headers = config.headers || {};
        var token = localStorage.getItem('token');
        if (token) {
          config.headers.authorization = token;
        }
        return config;
      },
      requestError: function (config) {//通过实现 requestError 方法拦截请求异常: 请求发送失败或者被拦截器拒绝
        if (config.url.toString().indexOf('http://') === 0) {
          $injector.get('$ionicLoading').hide();
        }
        return config;
      },
      response: function (response) {//通过实现 response 方法拦截响应: 该方法会在 $http 接收到从后台过来的响应之后执行
        if (response.config.url.toString().indexOf('http://') === 0) {
          $injector.get('$ionicLoading').hide();
        }
        return response;
      },
      responseError: function (response) {////通过实现 responseError 方法拦截响应异常:后台调用失败 响应异常拦截器可以帮助我们恢复后台调用
        if (response.config.url.toString().indexOf('http://') === 0) {
          $injector.get('$ionicLoading').hide();
        }
        return response;
      }
    };
  })
