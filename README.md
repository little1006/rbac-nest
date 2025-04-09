# RBAC-NEST

## 技术栈/文档目录

nestjs nodejs 后端框架 [doc](https://nestjs.bootcss.com/index.html)
typeorm 关系映射[doc](https://www.typeorm.org/)
class-validator dto参数校验 [doc](https://github.com/typestack/class-validator#readme)
class-transformer 可能是用来类型转换的吧，项目里没用 [doc](https://github.com/typestack/class-transformer#readme)

## 准备工作

### 数据库

安装mysql 8以上版本，推荐docker安装

### 安装依赖

使用 pnpm 管理 ```pnpm install``` 安装项目依赖

## 开发工具 apifox  

推荐使用 apifox 等工具来管理项目，前后端对接测试都可以研究一下用法。

## 目录结构

```
rbac-nest/  
├── migrations/              # 数据库迁移文件夹 
├── src/  
│   ├── app.module.ts                # 应用的主模块  
│   ├── app.controller.ts            # 应用的主控制器  
│   ├── app.service.ts               # 应用的主服务  
│   ├── db.ts                        # TypeORM 数据源配置  
│   ├── entities/                    # 数据库实体文件夹  
│   │   ├── user.entity.ts           # 用户实体  
│   │   ├── role.entity.ts           # 角色实体  
│   │   └── permission.entity.ts     # 权限实体  
│   ├── guards/                      # 守卫文件夹  
│   │   └── jwt/  
│   │       └── jwt.guard.ts         # JWT 守卫  
│   ├── RBAC/                        # RBAC 相关模块  
│   │   ├── auth/                    # 认证模块  
│   │   │   ├── auth.module.ts       # 认证模块  
│   │   │   ├── auth.service.ts      # 认证服务  
│   │   │   ├── auth.controller.ts   # 认证控制器  
│   │   │   └── dto/                 # DTO 文件夹  
│   │   ├── users/                   # 用户模块  
│   │   │   ├── users.module.ts      # 用户模块  
│   │   │   ├── users.service.ts     # 用户服务  
│   │   │   ├── users.controller.ts  # 用户控制器  
│   │   │   └── dto/                 # DTO 文件夹  
│   │   ├── roles/                   # 角色模块  
│   │   │   ├── roles.module.ts      # 角色模块  
│   │   │   ├── roles.service.ts     # 角色服务  
│   │   │   ├── roles.controller.ts  # 角色控制器  
│   │   │   └── dto/                 # DTO 文件夹  
│   │   ├── permissions/             # 权限模块  
│   │       ├── permissions.module.ts # 权限模块  
│   │       ├── permissions.service.ts # 权限服务  
│   │       ├── permissions.controller.ts # 权限控制器  
│   │       └── dto/                 # DTO 文件夹  
│   ├── res/                         # 通用响应模块  
│   │   ├── res.module.ts            # 响应模块  
│   │   └── res.service.ts           # 响应服务  
│   ├── error-handler/               # 错误处理模块  
│   │   ├── error-handler.module.ts  # 错误处理模块  
│   │   └── BusinessException.ts     # 自定义业务异常  
│   ├── utils/                       # 工具模块  
│       ├── crud/                    # 通用 CRUD 工具  
│       │   ├── crud.module.ts       # CRUD 模块  
│       │   └── crud.service.ts      # CRUD 服务  
│       └── ...  
├── test/                            # 测试文件夹  
│   ├── app.e2e-spec.ts              # E2E 测试  
│   └── jest-e2e.json                # Jest 配置  
├── .env.example                     # 环境变量示例文件  
├── README.md                        # 项目说明文档  
├── package.json                     # 项目依赖配置  
├── tsconfig.json                    # TypeScript 配置  
└── nest-cli.json                    # Nest CLI 配置 
```

### CRUD resource 

像 module / service / controller / *.spec 这种文件结构，一类功能 可以直接调用 nest-cli 的代码生成命令

[nest-cli generate](https://nestjs.bootcss.com/cli/usages.html#nest-generate) 文档，比如 ```nest g res xxx``` 可以直接生成 http 的 controller 查询数据dto service 等文件，并大概建立好 crud 的结构，非常省事。

### res 通用响应

res 中封装了统一响应的json 格式，类似这样
```ts
type Res={
    code:string,
    msg:string,
    data:any
}
```

还有业务代码 static CODES 挂在了 ResService 上

### error-handler 异常拦截

如果不做任何异常拦截，HttpException将会被 error-handler 拦截处理，这里可以做统一的业务错误拦截，例如 参数校验 / 业务报错 ,可以省去一些在功能模块里的判断，如果需要更细节的错误处理，就别在 error-handler里写啦，在controller/service中自己拦截处理。

**HttpException** 所有拦截的错误都是基于 HttpException 基类
如果有不同类型的 Exception 可以自己封装一个，然后在controller一级去抛出异常，可以在 error-handler 中进行判断。

### .env 环境变量

.env.example 是一个示例文件，记录了所有项目中用到的环境变量值。
你需要在本地创建开发环境 .env.development 或是生产环境 .env.prod
.env.prod 和 .env.development 不提交git仓库

### entities 实体

typeorm-[实体](https://www.typeorm.org/entities)

实体配合 type-orm 可以
1.生成数据库访问对象，可以通过代码拼接sql。
2.生成数据表ddl语句。

或是自己写数据的操作存储逻辑。

### dto

一般稍微复杂的入参用 dto 定义，这里可以配合 class-validator 做参数校验。例如

```ts
import { IsOptional, IsNumber, Min, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 状态
 */
export enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Locked = 'locked',
}

export class QueryRoleListDto {
  /**
   * 当前页码
   */
  @Type(() => Number) // 确保 Query 参数转换为 Number
  @IsNumber({}, { message: 'current 必须是数字' })
  @Min(1, { message: 'current 最小值为 1' })
  @IsOptional()
  current?: number = 1;

  /**
   * 每页条数
   */
  @Type(() => Number)
  @IsNumber({}, { message: 'pageSize 必须是数字' })
  @Min(1, { message: 'pageSize 最小值为 1' })
  @IsOptional()
  pageSize?: number = 20;

  /**
   * 搜索关键字
   */
  @IsOptional()
  @IsString({ message: 'search 必须是字符串' })
  search?: string;

  /**
   * 排序字段
   */
  @IsOptional()
  @IsString({ message: 'sortBy 必须是字符串' })
  sortBy?: string = 'createdAt'; // 默认排序字段

  /**
   * 排序方向
   */
  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'sortOrder 必须是 ASC 或 DESC' }) // 限制排序方向
  sortOrder?: 'ASC' | 'DESC' = 'DESC'; // 默认降序
}

```

### migrations 迁移

[迁移](https://www.typeorm.org/migrations)

可以通过命令行创建迁移，控制某些表的数据库版本，控制表结构/数据的更新/回滚 可以通过 迁移版本来控制。

#### 命令

项目中 scripts 记录了 a.创建 迁移 b.运行 迁移 b.回滚 迁移 的脚本

```json
    "migration:generate": "pnpm typeorm migration:generate",
    "migration:run": "pnpm typeorm migration:run",
    "migration:revert": "pnpm typeorm migration:revert"
```

例如新加功能，可以通过 entity 实体创建迁移来获得 create table 语句。
功能迭代增减字段，可以在这里写ddl语句，通过 migration:run 修改数据表，当遇到问题时 代码回滚，数据表结构也可以通过迁移 migration:revert 回滚到对应版本。

## 开发流程

1. 写 apifox 文档
2. 创建对应实体 / 创建对应数据表
3. orm 生成数据表 / 由数据表创建实体
4. 修改实体
5. nest gen res 
6. 实现接口
7. apifox 书写测试用例
