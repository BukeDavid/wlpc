// app.js
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const app = express();

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || '2f234c7e9b3a8d1f5e6b4c7a9d8e2f1b4a7c9e3d6f8b2a5c7e9d1f4b8a2c6e3d';

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

app.use(express.json());

// 注册接口
app.post('/api/v1/auth/register', async (req, res) => {
  const { phone, serviceCode } = req.body;
  
  try {
    // 验证手机号格式
    if (!/^1\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 验证客服代码
    if (!serviceCode || serviceCode.length < 4) {
      return res.status(400).json({
        success: false,
        message: '客服代码格式不正确'
      });
    }

    const conn = await pool.getConnection();
    
    try {
      // 检查手机号是否已注册
      const [users] = await conn.query(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );

      if (users.length > 0) {
        return res.status(400).json({
          success: false,
          message: '该手机号已注册'
        });
      }

      // 创建新用户
      await conn.query(
        'INSERT INTO users (phone, service_code) VALUES (?, ?)',
        [phone, serviceCode]
      );

      res.json({
        success: true,
        message: '注册成功'
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 登录接口
app.post('/api/v1/auth/login', async (req, res) => {
  const { phone, serviceCode } = req.body;
  const ip = req.ip;

  try {
    const conn = await pool.getConnection();
    
    try {
      // 检查登录频率
      const [attempts] = await conn.query(
        `SELECT COUNT(*) as count FROM login_attempts 
         WHERE phone = ? AND attempt_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
        [phone]
      );

      if (attempts[0].count >= 10) {
        return res.status(429).json({
          success: false,
          message: '登录尝试次数过多，请24小时后再试'
        });
      }

      // 验证用户信息
      const [users] = await conn.query(
        'SELECT id FROM users WHERE phone = ? AND service_code = ?',
        [phone, serviceCode]
      );

      // 记录登录尝试
      await conn.query(
        'INSERT INTO login_attempts (phone, ip_address, success) VALUES (?, ?, ?)',
        [phone, ip, users.length > 0]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: '手机号或客服代码错误'
        });
      }

      // 更新最后登录时间
      await conn.query(
        'UPDATE users SET last_login_time = NOW() WHERE id = ?',
        [users[0].id]
      );

      // 生成JWT token
      const token = jwt.sign(
        { userId: users[0].id, phone },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: '登录成功',
        token
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取最新公告
app.get('/api/v1/notice/latest', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [notices] = await conn.query(
        'SELECT * FROM notices WHERE status = 1 ORDER BY create_time DESC LIMIT 1'
      );

      res.json({
        success: true,
        data: notices[0] || null
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('获取公告失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 启动服务器
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});