# 网上冲浪扩展功能

## 说明

仅自用，不再支持 Tampermonkey，这样自己维护起来灵活一点

现在用 [User JavaScript and CSS](https://chromewebstore.google.com/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld) 这个插件来加载代码，写 css 也能方便一点。（加载脚本需要勾选 Run at the start）

源码直接用 JS + JSDoc 来写，不用 TS，不需要编译直接用，以便直接调试。

---

~~1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器插件~~

~~2. 加载所需的脚本~~

## 代码

### utils

封装了一些工具函数。直接挂载到全局 window，不通过 import，这样又不需要编译了。

- [dom-observer](./src//utils/dom-observer.js)
- [media-control](./src//utils/media-control.js)
- [playlist progress-bar](./src//utils/progress-bar.js)

![YouTube Playlist Timer](./images/youtube-playlist-timer.png)

### YouTube 增强

[code](./src/youtube-enhanced.js)

- 新增的快捷键
  - `Cmd + Shift + d` 复制字幕
  - `Cmd + Shift + s` 截图当前画面
  - `[`, `]` 切换列表上下集
  - `Backspace` 从头播放
  - `q` 倒退 1 秒
  - `e` 前进 1 秒
  - `z` 变速 -0.125
  - `x` 变速 +0.125
  - `v` 切换变速
- 自动化
  - 自动暂停其他 YouTube 标签页的视频，实现唯一当前播放
  - 初始自动设置最高清晰度
- 界面
  - 播放列表进度条

### Bilibili 增强

[code](./src/bilibili-enhanced.js)

覆写 B 站的快捷键（使大部分视频控制键位集中在左手区，以方便单手操作）

- 快捷键
  - `Cmd + Shift + s` 截图当前画面
  - `Cmd + Shift + c` 复制干净的当前视频链接（去除多余小尾巴）
  - `[`, `]` 切换列表上下集
  - `c` 软切换弹幕（通过控制图层的 `opacity`，而不是 `display`）
  - `t` 网页全屏
  - `f` 屏幕全屏
  - `Backspace` 从头播放
  - `Space` 播放暂停
  - `r` 切换单集循环
  - `q`, `ArrowLeft` 倒退 1 秒
  - `e`, `ArrowRight` 前进 1 秒
  - `z` 变速 -0.125
  - `x` 变速 +0.125
  - `v` 切换变速
- 自动化
  - 自动连播行为：如果是列表视频则自动连播，否则单集视频播完暂停
  - 自动暂停其他 B 站标签页的视频，实现唯一当前播放
- 界面
  - 播放列表进度条

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
