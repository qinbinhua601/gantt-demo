# Vercel 部署说明

## 前置条件

- Node.js 24.x（参考 `package.json` 与 `.nvmrc`）
- 已注册 Vercel 账号

## 使用 Vercel CLI 部署（无需 Git）

1. 安装 Vercel CLI：

```
npm i -g vercel
```

2. 登录：

```
vercel login
```

3. 部署预览环境：

```
vercel
```

4. 部署到生产环境：

```
vercel --prod
```

首次部署时，按以下选项选择：

- Framework：Vite
- Build Command：`npm run build`
- Output Directory：`dist`
- Root Directory：`.`

## 通过 Git 自动部署

1. 将代码推送到 GitHub 或 GitLab。
2. 在 Vercel 控制台导入该仓库。
3. Vercel 会自动识别 Vite 配置。
4. 绑定的分支每次 push 都会触发自动部署。

## CSP 验证步骤

部署完成后检查 CSP 是否生效：

1. 打开站点。
2. DevTools -> Network -> 选择 HTML 文档。
3. 检查 Response Headers，确认存在 `Content-Security-Policy` 且包含 `nonce-...`。
4. 查看页面源码，确认脚本标签包含 `nonce="..."`。

## 注意事项

- Preview 部署可能会注入 `vercel.live` 相关脚本。若要关闭，进入 Project Settings 关闭 Vercel Toolbar。
- 本项目通过 `/api/index` 动态注入 nonce，HTML 由函数返回。
- 静态资源（`dist/`）由 Vercel 文件系统直接提供。
