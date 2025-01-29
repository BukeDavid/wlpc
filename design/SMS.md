### 短信验证服务设计文档

#### 1. 功能概述
短信验证服务用于验证用户手机号的真实性，主要应用于用户注册环节。

#### 2. 验证码规则
- 验证码为6位数字
- 有效期为5分钟
- 同一手机号1小时内最多发送3次
- 验证码发送后，原验证码自动失效

#### 3. 数据库设计
- **验证码记录表（SmsVerification）**
  - `id`: 主键，自增
  - `phoneNumber`: 手机号码
  - `verificationCode`: 验证码
  - `createTime`: 创建时间
  - `expireTime`: 过期时间
  - `isUsed`: 是否已使用
  - `useTime`: 使用时间

#### 4. 接口设计

##### 4.1 发送验证码
- **请求路径**：`/api/sms/send`
- **请求方法**：POST
- **请求参数**：
  ```json
  {
    "phoneNumber": "手机号码"
  }
  ```
- **返回数据**：
  ```json
  {
    "code": 200,
    "message": "验证码发送成功",
    "data": null
  }
  ```

##### 4.2 验证验证码
- **请求路径**：`/api/sms/verify`
- **请求方法**：POST
- **请求参数**：
  ```json
  {
    "phoneNumber": "手机号码",
    "code": "验证码"
  }
  ```
- **返回数据**：
  ```json
  {
    "code": 200,
    "message": "验证成功",
    "data": null
  }
  ```

#### 5. 错误处理
- 发送频率限制：返回429状态码
- 验证码错误：返回400状态码
- 验证码过期：返回400状态码
- 系统错误：返回500状态码

#### 6. 安全考虑
- 验证码在数据库中需要加密存储
- 接口需要添加防刷机制
- 日志记录所有验证码发送和验证行为
- IP级别的请求频率限制 

#### 7. 其他
- 公网域名访问
  ```  
  https://express-137278-10-1339258759.sh.run.tcloudbase.com
  ```
- 调用方法
  ```javascript
  wx.cloud.callContainer({
    config: {
      env: 'prod-0gdi5v7wb36848ce'
    },
    path: '/api/v1/auth/login',
    header: {
      'X-WX-SERVICE': 'express',
      'content-type': 'application/json'
    },
    method: 'POST',
    data: {
      // 请求数据
    }
  })
  ```

