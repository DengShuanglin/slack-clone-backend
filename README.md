<div align="center">
  <a href="https://nestjs.com/" target="blank">
  <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
  <br>
  <br>
  <a href="https://github.com/lhj-web/edu-cms-api/blob/main/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/lhj-web/edu-cms-api"></a>
  <a href="https://nestjs.com/"><img alt="GitHub license" src="https://img.shields.io/badge/nest-8.2.6-red"></a>
  <a href="https://typegoose.github.io/typegoose/"><img alt="GitHub license" src="https://img.shields.io/badge/typegoose-9.5.0-blue"></a>
  <h1>Slack-API</h1>
</div>

## 介绍

简单聊的后台，基于 Nestjs，数据库使用 MongoDB 和 Redis

## 进度

- [] 注册(邮箱注册，可找回)
- [] 登陆，需验证码
- [] 刷新 token，token 校验

  ......

## 项目结构

```
.
├── dist // 打包后的目录
├── src
│   ├── common // 项目通用模块
│   │   ├── decorators // 装饰器
│   │   ├── filters // 过滤器
│   │   ├── guards // 守卫
│   │   ├── interceptors // 拦截器(请求前后)
│   │   ├── pipes // 管道
│   │   └── transformers // 转换器
│   ├── constants // 全局变量
│   ├── errors // http请求错误类封装
│   ├── interfaces // 全局接口
│   ├── modules // 系统各模块
│   │   ├── auth
│   │   └── user
│   ├── processors
│   │   ├── cache // 缓存
│   │   ├── database // 数据库模块
│   │   └── helper // 邮箱模块
│   └── utils // 工具：分页和日志
└── test // 测试
```

## 接口地址

[接口地址链接]() **访问密码：**

## 安装使用

- 安装依赖

```bash
cd edu-cms-api

pnpm i
```

- 打包

```bash
pnpm build
```

- 运行

```bash
# development
pnpm dev

# watch mode
pnpm start:dev

# production mode
$ pnpm start:prod
```

## 数据库表设计

**表注释：系统用户**
