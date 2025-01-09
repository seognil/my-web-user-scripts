# 自用的一些网站脚本

## 自用

仅自用，不再支持 Tampermonkey，也是根据我自己的需求出发的，维护起来灵活一点

用 JS + JSDoc 来写，不用 TS，不需要编译直接用，直接调试也方便，也能有简单的类型检查

我用 [User JavaScript and CSS](https://chromewebstore.google.com/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld) 这个插件来加载脚本，加载 css 也方便一点。（加载脚本需要勾选 Run at the start）

写了两组工具函数，封装了一些常用功能。直接挂载到全局，不需要 import

- [dom-observer](./src//utils/dom-observer.js)
- [media-control](./src//utils/media-control.js)

---

~~1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器插件~~

~~2. 加载所需的脚本~~

---

### 给 Github 添加在线编辑器按钮

[code](./src/github-dev-button.js)

![github vscode button](./images/github-vscode-button.png)

[vscode.dev 和 github.dev 的区别](https://code.visualstudio.com/blogs/2021/10/20/vscode-dev#_github)

（github.dev 可以通过自带快捷键 `.`，不过可能因为有一些额外加载项，打开速度较慢，我不是很喜欢）

---

### link 链接自动跳转

[code](./src/autojump.js)

比如从知乎文章点击外部链接 xxx 时，不会直接访问 xxx，而是会访问 https://link.zhihu.com/?target=xxx

加载脚本以支持自动跳转到 xxx（自用，因为各个网站 url 都不太一样，目前只支持掘金、知乎）

---

### YouTube 播放列表进度条

[code](./src/youtube-playlist-timer.user.js)

![YouTube Playlist Timer](./images/youtube-playlist-timer.png)

给 YouTube 播放列表添加一个进度条，该快乐刷网课了 ☺

---

### Bilibili 快捷键

[code](./src/bilibili-enhanced.js)

覆写 B 站的快捷键（使大部分视频控制键位集中在左手区，以方便单手操作）

- 快捷键
  - `[`, `]` 切换列表上下集
  - `c` 软切换弹幕（通过控制图层的 `opacity`，而不是 `display`）
  - `t` 网页全屏
  - `f` 屏幕全屏
  - `Backspace` 从头播放
  - `q` 倒退 1 秒
  - `e` 前进 1 秒
  - `Space` 播放暂停
  - `z` 变速 -0.125
  - `x` 变速 +0.125
  - `v` 切换变速
  - `r` 切换单集循环
- 自动化
  - 如果是列表视频则自动连播，否则单集视频播完暂停。
  - 前景视频播放时，暂停其他标签页的视频（防止同时播放多个视频串音）（JS 安全限制所以只能控制 B 站同源页面，不知道有没有更好的做法…）

---
