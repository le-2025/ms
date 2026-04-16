# 部署指南（中小团队版）

本项目包含“前端 React (Vite)”和“后端 Node.js (Express)”。后端存储已全面对接 **Vercel KV (Redis)** 数据库。

针对中小团队，最推荐且最简单的部署方式是直接托管到 Vercel.com。

---

## 方案一：Vercel 免费 Serverless 部署（🌟 强烈推荐）
通过 Vercel 托管前后端，并使用 Vercel KV 存储数据。无需购买服务器，零维护成本。

### 1. 将代码推送到 GitHub
确保你的代码已经提交并推送到你的 GitHub 仓库。

### 2. 在 Vercel 中导入项目
1. 登录 [Vercel.com](https://vercel.com/)，点击右上角的 **Add New...** -> **Project**。
2. 关联你的 GitHub 账号，找到上传的仓库，点击 **Import**。
3. **环境变量配置 (Environment Variables)**：
   添加一条环境变量：
   - Key: `ADMIN_PASSWORD`
   - Value: `设置你们公司的复杂后台口令`
4. 点击 **Deploy**。等待大约 1-2 分钟，部署完成。

### 3. 开通 Vercel KV 数据库 (核心步骤)
部署完成后，前端可以访问，但点击“分享”或登录后台会报错，因为还没有连接数据库。
1. 在 Vercel 的控制台中，进入你刚刚部署好的项目页面。
2. 点击顶部的 **Storage** 选项卡。
3. 点击 **Create Database**，选择 **KV (Redis)**，点击 Continue。
4. 勾选同意条款并创建（默认会分配到最近的可用区域，例如 `iad1` 或 `sin1`）。
5. 创建完成后，系统会提示将环境变量注入到你的项目中（"Connect to Project"）。
   确保注入成功，系统会自动在你的 Vercel 环境变量里添加诸如 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 的配置。
6. 重新部署一次项目：点击顶部的 **Deployments**，找到最近的一次部署，点击右侧的三个点，选择 **Redeploy**。

重新部署完成后，你的测试系统就拥有了持久化存储能力，可以稳定收集员工的测试报告并在后台查看了！

---

## 方案二：Docker Compose 自建部署
如果你必须部署在公司内网或自己购买的云服务器上，可使用 Docker 部署（需要自行配置 Redis 服务替换 Vercel KV，或者回滚代码中 `api/storage.ts` 为本地文件存储版本）。

### 1. 环境要求
服务器（Linux/云主机）上已安装 `docker` 和 `docker-compose`。

### 2. 构建与启动
1. 准备好代码目录，设置后台密码：
   ```bash
   echo "ADMIN_PASSWORD=你们团队的复杂密码" > .env.production
   ```
2. 注意：当前代码已对接 `@vercel/kv`，如果脱离 Vercel 环境使用，请在环境变量中自行配置 Redis 连接串（设置 `KV_URL` 或对应的环境变量，详见 Upstash Redis 文档）。
3. 启动服务：
   ```bash
   docker-compose up -d --build
   ```

*如果你希望使用最简单的本地 JSON 存储（免装数据库），请使用 git 历史回退 `api/storage.ts` 的修改。*