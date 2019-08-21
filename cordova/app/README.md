# Cordova app
===============

# プロジェクトの作成
```
cordova create app
```

# 追加したプラットフォーム
```
cd app
cordova platform add android
cordova platform add ios
cordova platform add browser
```

# カメラ機能
cordova-plugin-camera を使用します。  
iOS10 以降は info.plist に CAMERA_USAGE_DESCRIPTION と PHOTOLIBRARY_USAGE_DESCRIPTION を指定する必要があるそう。  
https://github.com/apache/cordova-plugin-camera
```
cordova plugin add cordova-plugin-camera --variable CAMERA_USAGE_DESCRIPTION="カメラへのアクセスを許可" --variable PHOTOLIBRARY_USAGE_DESCRIPTION="写真ライブラリへのアクセスを許可"
```
