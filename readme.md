# 我的一些网站自定义脚本

借助 [User JavaScript and CSS](https://chrome.google.com/webstore/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld) 挂载

不想搞得太复杂，直接全部用原生 JS 写，不含第三方库

（自用，随手写比较方便，所以没上传 [Greasy Fork](https://greasyfork.org/)）

## 说明

大部分代码都是根据我的个人喜好来的业务逻辑，一小部分页面控制代码具有普适性（比如为了监听页面封装的 MutationObserver util）

## 例子

比如 B 站，覆写了快捷键，现在一只左手就能花式控制视频播放，看学习视频方便极了。

- 快捷键
  - `[`, `]` 切换列表上下集
  - `c` 软切换弹幕（控制图层 `opacity`）
  - `t` 网页全屏
  - `f` 屏幕全屏
  - `Backspace` 从头播放
  - `q` 倒退 2 秒
  - `e` 前进 2 秒
  - `Space` 播放暂停
  - `z` 变速 -0.15
  - `x` 变速 +0.15
  - `v` 切换变速
  - `r` 洗脑循环
- 自动化
  - 如果是列表视频则自动连播，否则单集视频播完暂停。
  - 前景视频播放时，暂停其他标签页的视频（防止串音）（JS 安全限制所以只能控制 B 站同源页面）
