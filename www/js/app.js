// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.config', 'starter.directive', 'starter.filter', 'ngCordova', 'ionic-native-transitions'])

  .run(function ($ionicPlatform, $rootScope, $location, $ionicHistory, $cordovaToast, $cordovaNetwork, CommonService) {
    $ionicPlatform.ready(function () {

      if (window.StatusBar) {
        //状态栏颜色设置
        // org.apache.cordova.statusbar required
        if ($ionicPlatform.is('ios')) {
          StatusBar.styleDefault();
          //  StatusBar.overlaysWebView(false);//ios状态栏内容上移
          //StatusBar.styleLightContent();
        }
        if ($ionicPlatform.is('android')) {
          StatusBar.backgroundColorByHexString("#FF93BC");
        }

      }

      //hide splash immediately 加载完成立刻隐藏启动画面
      if (navigator && navigator.splashscreen) {
        setTimeout(function () { //延迟显示 让页面先加载 不显示不美观的加载过程
          navigator.splashscreen.hide();
        }, 500);

      }

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      //主页面显示退出提示
      $ionicPlatform.registerBackButtonAction(function (e) {
        e.preventDefault();
        // Is there a page to go back to? 制定页面返回退出程序
        if ($location.path() == '/tab/main') {
          if ($rootScope.backButtonPressedOnceToExit) {
            ionic.Platform.exitApp();
          } else {
            $rootScope.backButtonPressedOnceToExit = true;
            $cordovaToast.showShortCenter('再次按返回退出元亨祥商城');
            setTimeout(function () {
              $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
          }

        } else if ($ionicHistory.backView()) {
          // Go back in history
          $ionicHistory.goBack();
        } else {
        }

        return false;
      }, 101);

      //判断网络状态以及横屏事件
      document.addEventListener("deviceready", function () {
        // listen for Online event
        $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
          var onlineState = networkState;
        })

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
          var offlineState = networkState;
          //提醒用户的网络异常
          CommonService.platformPrompt("网络异常 无法连接元亨祥服务器", 'close');
        })
        //添加JS 屏幕监听事件 禁止APP 横屏
        if (screenOrientation) {
          screenOrientation.setOrientation('portrait');
        }

      }, false);

      //打开外部网页
      if (window.cordova && window.cordova.InAppBrowser) {
        window.open = window.cordova.InAppBrowser.open;
      }

      //启动极光推送服务
      /*    try {
       window.plugins.jPushPlugin.init();
       } catch (e) {
       console.log(e);
       }
       // System events
       document.addEventListener("resume", resume, false);
       function resume() {
       if (window.plugins.jPushPlugin.isPlatformIOS()) {
       window.plugins.jPushPlugin.setBadge(0);
       window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
       } else if (device.platform == "Android") {
       window.plugins.jPushPlugin.setLatestNotificationNum(3);
       window.plugins.jPushPlugin.clearAllNotification();
       }
       }
       //点击极光推送跳转到相应页面
       document.addEventListener("jpush.openNotification", function (data) {

       }, false)*/

      //调试模式，这样报错会在应用中弹出一个遮罩层显示错误信息
      //window.plugins.jPushPlugin.setDebugMode(true);

    });
  })

  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicNativeTransitionsProvider) {
    /* 设置平台特性*/
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('bottom');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-left');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-ios-arrow-left');

    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');
    //设置默认返回按钮的文字
    $ionicConfigProvider.backButton.previousTitleText(false).text('');

    //ion-content to have overflow-scroll='false'
    $ionicConfigProvider.scrolling.jsScrolling(false);
    //Checkbox style. Android defaults to square and iOS defaults to circle
    $ionicConfigProvider.form.checkbox('circle');
    //Toggle item style. Android defaults to small and iOS defaults to large.
    $ionicConfigProvider.form.toggle('large');
    //原生动画效果统一配置
    $ionicNativeTransitionsProvider.setDefaultOptions({
      duration: 200 // in milliseconds (ms), default 400,

    });
    $ionicNativeTransitionsProvider.setDefaultTransition({
      type: 'slide',
      direction: 'left'
    });
    $ionicNativeTransitionsProvider.setDefaultBackTransition({
      type: 'slide',
      direction: 'right'
    });
    // $ionicConfigProvider.views.transition('no');//禁用ionic动画
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      //APP首页面
      .state('tab.main', {
        url: '/main',
        nativeTransitions: null,
        views: {
          'tab-main': {
            templateUrl: 'templates/main.html',
            controller: 'MainCtrl'
          }
        }
      })

      //产品分类主页面
      .state('tab.classify', {
        url: '/classify',
        nativeTransitions: null,
        views: {
          'tab-classify': {
            templateUrl: 'templates/classify.html',
            controller: 'ClassifyCtrl'
          }
        }
      })

      //产品列表
      .state('productlist', {
        url: '/productlist/:type/:id',
        templateUrl: 'templates/main/productlist.html',
        controller: 'ProductListCtrl'

      })

      //产品详情
      .state('productdetails', {
        url: '/productdetails',
        templateUrl: 'templates/main/productdetails.html',
        controller: 'ProductDetailsCtrl'

      })
      //购物车页面
      .state('tab.shoppingcart', {
        url: '/shoppingcart',
        nativeTransitions: null,
        cache: false,
        views: {
          'tab-shoppingcart': {
            templateUrl: 'templates/shoppingcart.html',
            controller: 'ShoppingCartCtrl'
          }
        }
      })
      //提交订单核对订单
      .state('revieworder', {
        url: '/revieworder',
        templateUrl: 'templates/main/revieworder.html',
        controller: 'ReviewOrderCtrl'

      })

      //我的订单
      .state('myorder', {
        url: '/myorder',
        cache: false,
        templateUrl: 'templates/account/myorder.html',
        controller: 'MyOrderCtrl'

      })

      //我的账号
      .state('tab.account', {
        url: '/account',
        cache: false,
        nativeTransitions: null,
        views: {
          'tab-account': {
            templateUrl: 'templates/account.html',
            controller: 'AccountCtrl'
          }
        }
      })

      //登录页面
      .state('login', {
        url: '/login',
        cache: false,
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      //注册页面
      .state('register', {
        url: '/register',
        cache: false,
        templateUrl: 'templates/account/register.html',
        controller: 'RegisterCtrl'
      })

      //重置密码页面
      .state('resetpassword', {
        url: '/resetpassword',
        cache: false,
        templateUrl: 'templates/account/resetpassword.html',
        controller: 'ResetPasswordCtrl'
      })

      //修改密码页面
      .state('changepassword', {
        url: '/changepassword',
        cache: false,
        templateUrl: 'templates/account/changepassword.html',
        controller: 'ChangePasswordCtrl'
      })

      //反馈建议页面
      .state('helpfeedback', {
        url: '/helpfeedback',
        cache: false,
        templateUrl: 'templates/account/helpfeedback.html',
        controller: 'HelpFeedbackCtrl'
      })

      //地址管理页面
      .state('addressmanage', {
        url: '/addressmanage',
        cache: false,
        templateUrl: 'templates/account/addressmanage.html',
        controller: 'AddressManageCtrl'
      })

      //添加地址页面
      .state('addaddress', {
        url: '/addaddress/:id',
        cache: false,
        templateUrl: 'templates/account/addaddress.html',
        controller: 'AddAddressCtrl'
      })

      //联系我们页面
      .state('contactus', {
        url: '/contactus',
        templateUrl: 'templates/account/contactus.html',
        controller: 'ContactUsCtrl'
      })

      //完善资料页面
      .state('organizingdata', {
        url: '/organizingdata',
        cache: false,
        templateUrl: 'templates/account/organizingdata.html',
        controller: 'OrganizingDataCtrl'
      })

      //我的钱包页面
      .state('mywallet', {
        url: '/mywallet',
        cache: false,
        templateUrl: 'templates/account/mywallet.html',
        controller: 'MyWalletCtrl'
      })

      //我的收入页面
      .state('myincome', {
        url: '/myincome',
        templateUrl: 'templates/account/myincome.html',
        controller: 'MyIncomeCtrl'
      })
      //我的优惠卷页面
      .state('mycoupon', {
        url: '/mycoupon',
        cache: false,
        templateUrl: 'templates/account/mycoupon.html',
        controller: 'MyCouponCtrl'
      })

      //邀请记录页面
      .state('invitationlist', {
        url: '/invitationlist',
        cache: false,
        templateUrl: 'templates/account/invitationlist.html',
        controller: 'InvitationListCtrl'
      })

      //我的积分页面
      .state('myntegral', {
        url: '/myntegral',
        cache: false,
        templateUrl: 'templates/account/myntegral.html',
        controller: 'MyNtegralCtrl'
      })

      //每日签到页面
      .state('signin', {
        url: '/signin',
        cache: false,
        templateUrl: 'templates/account/signin.html',
        controller: 'SignInCtrl'
      })

      //问卷调查页面
      .state('questionnaire', {
        url: '/questionnaire',
        cache: false,
        templateUrl: 'templates/account/questionnaire.html',
        controller: 'QuestionnaireCtrl'
      })
      //上传头像
      .state('uploadhead', {
        url: '/uploadhead',
        templateUrl: 'templates/account/uploadhead.html',
        controller: 'UploadHeadCtrl'
      })
      //评价
      .state('evaluate', {
        url: '/evaluate',
        templateUrl: 'templates/account/evaluate.html',
        controller: 'EvaluateCtrl'
      })
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/main');

  });
