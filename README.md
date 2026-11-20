# Message Rewrite（对话消息编辑）

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

给 [DeepSeek Harness](https://github.com/deepseek-ai) 的 Web 界面加一个 **编辑消息** 动作：在已完成的一轮对话下修改原来的消息，从这条消息处把后面的对话切掉，并用改后的内容重新生成回答 —— 类似 ChatGPT 的「编辑并重新发送」。

> A DeepSeek Harness bundle (Host + Web Client) that adds an **Edit message** action to completed turns: edit the message, cut the conversation at that point, and regenerate the answer from the revised text.

- 不需要额外服务、没有 npm 依赖、没有构建步骤；Host 半侧只注册一条鉴权 RPC 通道
- 复用宿主自带的 `session/fork` 与 `session.prompt`，切出来的对话和内置「分支」按钮的结果一致
- 不注入上下文、不改系统提示、不注册 Agent 工具：这是只属于人的操作
- 界面只用 `--dsw-alias-*` 主题令牌，跟随明暗主题与字号

## 安装

前置条件：DeepSeek Harness Desktop，且当前 profile 带 Web 界面。

**方式一：让 Agent 安装（推荐）**

```
安装插件 github:InitializeQwQ/dsh-prompt-edit
```

也可以直接用 HTTPS 地址：`https://github.com/InitializeQwQ/dsh-prompt-edit`。

**方式二：在 Web 界面安装**

侧边栏 → **Plugins** → 安装 / 添加 bundle，粘贴同一份 spec（`github:InitializeQwQ/dsh-prompt-edit`），确认。

**方式三：本地克隆后安装（内网 / 离线可用）**

```bash
git clone https://github.com/InitializeQwQ/dsh-prompt-edit.git
```

然后让 Agent 安装这个目录的绝对路径：

```
安装插件 /absolute/path/to/dsh-prompt-edit
```

安装结果里 `application: "applied"` 表示已在本 profile 生效（影响该 profile 下所有会话，重启后保留）。

安装后的落点：`~/.dsh/profiles/<profile>/node_modules/<包名>/`，并在该 profile 的 `package.json` 里登记 `dependencies` 与 `dsh.profile.bundles`；GitHub 安装会用 `pnpm-lock.yaml` 固定到安装时的那个 commit。

## 使用

1. 把鼠标移到**你自己的那条消息**上，气泡下方的时间、复制图标右边会出现一支铅笔（和 DeepSeek 网页版一样，鼠标离开就收起）。
2. 点击铅笔，编辑器会预填这条消息的原文；改成你想要的内容。
3. `⌘/Ctrl + Enter` 或点 **保存并重新生成**：
   - 从这条消息之前切出这段对话：这条消息及其之后的回答不再出现在当前对话里；
   - 改后的文字作为新的消息发送，回答重新流式生成；
   - 原对话被归档（标题不变），可在侧边栏「已归档」中找回。
4. `Esc` 取消。取消时若分支已创建但消息还没发出去，该空白分支会被自动归档，原对话不受影响。

只对「确实由一条人类消息开始」的轮次显示；命令触发、后台任务、唤醒消息开始的轮次没有这个入口。没有分支权限（`session/fork`）时也不显示。

## 更新与卸载

- **更新**：git spec 固定在安装时的提交，所以先移除再安装；或用带引用 / 提交的 spec 重装，如 `github:InitializeQwQ/dsh-prompt-edit#main`。
- **卸载**：Plugins 页面对该 bundle 选择移除，或让 Agent 移除 `dsh-prompt-edit`。

## 工作原理（简述）

- 用户消息行由 `conversation.chat.node` 的 `user` 渲染位负责，宿主没有在它的动作条里留插槽，所以插件以更低优先级（`priority: -1`）**遮蔽**该渲染位：气泡内容仍由宿主的 `conversation.chat.user.content` 工厂渲染，只有「时间 + 复制 + 编辑」这条动作条是本地实现。编辑器注册在 `shell.overlay`（根层浮层，不会被聊天滚动容器裁剪）。
- 分支边界取**上一轮的 `turn/end`**（第一轮取 `0`）。宿主的 fork 边界是闭区间，而原消息的 `agent/inbox/spliced` 紧随上一轮结束之后，所以这样切**不会把原消息带进新会话**，也不会重复生成。
- 上一轮尚未载入时，先向上翻一页历史（按轮对齐）再解析边界；解析不到就明确报错，不会退化成可能带进原消息的位置。
- 创建分支后会先把原会话的**模型与推理等级**（provider / model / reasoningEffort）复制到新对话，再发送修改后的内容，所以重写不会退回默认路由；这一步失败只会记一条警告，不影响发送。
- 发送走宿主 `session.prompt`，与输入框同一条链路；失败原因显示在弹窗里。
- 附件迁移分两条路：图片在会话日志里是持久引用，客户端向 `session.attachment` 取回字节后以 base64 原样重发；普通文件的字节只在 Host 上（`attachments.readFileStream`），提示词又只能用上传回执引用文件，所以 `index.js` 在鉴权的 Connection RPC 通道 `/prompt-edit` 上把存储对象转成子会话的 `receiptId`，客户端用 `{ type: 'file', receiptId }` 引用。
- 保存成功后归档原会话并按原标题切到新对话，所以侧边栏看起来是**同一条对话被重写**，而不是多出一条分支。

## 已知限制

- 附件一并带走：图片按原样重发（引用同一份存储对象），普通文件由插件的 Host 半侧重新挂成新对话的上传回执，模型照常能读；个别附件失败时只影响它自己，其余照常发送（浏览器控制台会记一条警告）。
- 宿主会话日志是只追加的，没有「原地截断」接口：实现上是切一段前缀 + 归档原会话，所以被切掉的部分仍完整保存在「已归档」里。
- 一轮里若同时领取了多条排队消息，只编辑第一条，其余留在原对话（已归档）里。
- 依赖 Harness 的客户端插槽与 `session/fork` API；DSH 大版本升级后若插槽或方法签名变化，可能需要适配（见 `dsh.client.inject` 与 `client.js`）。
- 接管了 `user` 渲染位，宿主自带的「消息来源装饰」位（`conversation.chat.user.before`）因此不会渲染；它目前没有占用者，看不出差别，但别的插件往里注册的内容不会显示在用户消息上方。
- 气泡下方的时间与复制图标由插件重新实现（宿主那份动作条不开放插槽），样式对齐宿主，时间格式等细节可能略有差异。

## 目录结构

```
package.json        # bundle 清单：dsh.bundle.patch + dsh.client
cordis.patch.yml    # 插入宿主侧插件行
index.js            # 宿主半边：/api/prompt-edit 路由，把原消息的文件转成新会话的上传回执
client.js           # 全部前端实现：用户消息动作条 + 编辑弹窗
locale/en.json      # 插件管理器中的标题/说明（英文）
locale/zh.json      # 插件管理器中的标题/说明（中文）
icon.svg            # 插件图标
```

仓库根目录就是包根目录（`package.json` 在最外层），所以 `github:用户/仓库` 形式的 spec 可以直接安装。

## 开发

```bash
git clone https://github.com/InitializeQwQ/dsh-prompt-edit.git
```

在本地改完后，让 Agent 以链接方式安装这个目录：

```
安装插件 /absolute/path/to/dsh-prompt-edit
```

这样 profile 里记的是 `link:` 指向源码目录，改文件立即生效——但浏览器侧要**重新加载插件**才会读到新的 `client.js`：在 Plugins 页面把该插件关闭再打开即可（会热替换，不必刷新页面）。

调试入口：`cordis_inspect_query` 的 `Slots` 提供方可以列出插槽树与占用者：`Slots.listSubTree` 传 `conversation.chat.node` 可看到 `user` 键上 `priority: -1` 的遮蔽条目，传 `shell.overlay` 可确认对话框是否注册成功。

## License

[MIT](LICENSE)

用户消息动作条里的铅笔图标取自 [deepseek-ai/chat-demo](https://github.com/deepseek-ai/chat-demo) 的 `IconEditOutline16`（MIT，Copyright (c) 2026 DeepSeek）；复制与勾选图标使用宿主自带的 `IconCopyOutlineRegular` / `IconCheckOutlineRegular`。
