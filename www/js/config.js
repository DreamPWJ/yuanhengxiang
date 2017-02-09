/**
 * Created by pwj on 2016/12/7.
 * 系统接口常量配置
 */
var configMod = angular.module("starter.config", []);

configMod.constant("YuanHenXiang", {
  'name': 'YuanHenXiang', //项目名称
  'debug': false, //调试标示 暂无使用
  'api': 'http://muying.tuokemao.com/index.php/Service',//接口服务地址  使用
  'siteUrl': 'http://a.yuanhengxiang.com',//仓库地址 暂无使用
  'imgUrl': 'http://f.yuanhengxiang.com',//图片地址 暂无使用
  'mobApi': 'http://m.yuanhengxiang.com',//手机端服务  使用（分享链接展示等调用）
  'gaoDeKey': '972cafdc2472d8f779c5274db770ac22',//高德web API服务key
  'version': '0.5.0' //当前版本号
});

