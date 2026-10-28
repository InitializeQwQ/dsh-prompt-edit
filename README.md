# Prompt Rewrite（对话提问编辑）

给 [DeepSeek Harness](https://github.com/deepseek-ai) 的 Web 界面加一个 **编辑提问** 动作：在已完成的一轮对话下修改原提问，从这条提问处把后面的对话切掉，并用改后的内容重新生成回答 —— 类似 ChatGPT 的「编辑并重新发送」。

> A DeepSeek Harness bundle (Host + Web Client) that adds an **Edit prompt** action to completed turns: edit the prompt, cut the conversation at that point, and regenerate the answer from the revised text.

- 纯前端能力，无需额外服务、无依赖、无构建步骤
- 使用宿主自带的 `session/fork` 权限与分支能力，切出来的对话与内置「分支」按钮的结果完全一致
- 不注入上下文、不改系统提示、不注册 Agent 工具：这是只属于人的操作

## 安装

前置条件：DeepSeek Harness Desktop，且使用带 Web 界面的 profile。

**方式一：让 Agent 安装（推荐）**

把下面任一 spec 发给会话里的 Agent：

```
安装插件 github:<你的用户名>/dsh-prompt-edit
```

也可用 HTTPS 地址：`https://github.com/<你的用户名>/dsh-prompt-edit`。

**方式二：在 Web 界面安装**

侧边栏 → **Plugins** → 安装/添加 bundle，粘贴同一个 spec（`github:<用户名>/dsh-prompt-edit`），确认。

**方式三：从本地克隆安装（内网/离线可用）**

```bash
git clone https://github.com/<你的用户名>/dsh-prompt-edit.git
```

然后让 Agent 安装该目录的绝对路径：

```
安装插件 /absolute/path/to/dsh-prompt-edit
```

安装结果里 `application: "applied"` 表示已在本 profile 生效（影响该 profile 下的所有会话，并在重启后保留）。

## 使用

1. 打开任一会话，把鼠标移到**已完成轮次**的页脚（回答下方、复制/分支图标那一行附近），出现 **编辑提问**。
2. 点击，编辑器会预填这条提问的原文；改成你想要的内容。
3. `⌘/Ctrl + Enter` 或点 **保存并重新生成**：
   - 从这条提问之前切出这段对话：这条提问及其之后的回答不再出现在当前对话里；
   - 改后的文字作为新的提问发送，回答重新流式生成；
   - 原对话被归档（标题不变），可在侧边栏「已归档」中找回。
4. `Esc` 取消。取消时若分支已创建但提问还没发出去，该空白分支会被自动归档，原对话不受影响。

只对「确实由一条人类提问开始」的轮次显示；命令触发、后台任务、唤醒消息开始的轮次没有这个入口。没有分支权限（`session/fork`）时也不显示。

## 更新与卸载

- **更新**：先移除再安装（git spec 固定在安装时的提交），或用带引用/提交的 spec 重装，如 `github:<用户名>/dsh-prompt-edit#main`。
- **卸载**：Plugins 页面对该 bundle 选择移除，或让 Agent 移除 `@local/dsh-prompt-edit`。

## 工作原理（简述）

- 动作注册在 `conversation.chat.turnTail`，编辑器注册在 `shell.overlay`（根层浮层，不会被聊天滚动容器裁剪）。
- 分支边界取**上一轮的 `turn/end`**（第一轮取 `0`）。宿主的 fork 边界是闭区间，而原提问的 `agent/inbox/spliced` 紧随上一轮结束之后，所以这样切分支**不会把原提问带进新会话**，也不会重复生成。
- 上一轮尚未载入时，先向上翻一页历史（按轮对齐）再解析边界；解析不到就明确报错，不会退化成可能带进原提问的位置。
- 发送走宿主 `session.prompt`，与输入框同一条链路；失败原因显示在弹窗内。

## 已知限制

- 只迁移文字内容；原提问里的图片/文件不会随分支重发（会提示有几个非文本块被丢弃）。
- 宿主的会话日志是只追加的，没有「原地截断」接口：实现上是切一段前缀 + 归档原会话，所以原对话本身仍完整保存在「已归档」里。
- 一轮里若同时领取了多条排队提问，只编辑第一条，其余留在原对话（已归档）里。
- 依赖 Harness 的客户端插槽与 `session/fork` API；DSH 大版本升级后若插槽或该方法签名变化，可能需要适配。
- 界面样式只用主题令牌（`--dsw-alias-*`），跟随明暗主题。

## 目录结构

```
package.json        # bundle 清单：dsh.bundle.patch + dsh.client
cordis.patch.yml    # 插入宿主侧插件行
index.js            # 宿主半边（仅保留可启停的插件条目）
client.js           # 全部前端实现：页脚动作 + 编辑弹窗
locale/en.json      # 插件管理器中的标题/说明（英文）
locale/zh.json      # 插件管理器中的标题/说明（中文）
icon.svg            # 插件图标
```

## License

MIT
