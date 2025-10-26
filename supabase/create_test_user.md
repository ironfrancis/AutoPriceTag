# 创建测试用户

## 在 Supabase Dashboard 手动创建

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 左侧菜单 → **Authentication** → **Users**
4. 点击 **Add user** 或 **Create user**
5. 填写：
   - **Email**: `test@example.com`
   - **Password**: `test123456`
   - **Auto Confirm User**: 勾选（跳过邮箱验证）
6. 点击 **Create user**

创建后可以直接使用这个邮箱和密码登录应用。

## 使用 SQL 创建（高级）

```sql
-- 注意：实际应用中不要这样做，这里只是为了测试

-- 创建用户（需要超级管理员权限）
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('test123456', gen_salt('bf')),  -- 密码加密
  now(),
  now(),
  now(),
  '{"provider":"email"}',
  '{}'
);
```

**重要提示**：
- 直接插入到 `auth.users` 表需要超级管理员权限
- 推荐使用 Dashboard UI 创建
- 生产环境应该使用官方的认证 API

## 查看用户密码

**无法查看明文密码**，因为 Supabase 使用了密码哈希：
- 使用 **Argon2** 或 **Bcrypt** 算法
- 单向加密，不可逆
- 只能重置，不能恢复

## 重置密码

如果忘记密码，管理员可以：

1. **在 Dashboard 重置**：
   - Authentication → Users
   - 选择用户
   - 点击 "Send password reset email"

2. **使用 SQL**：
   ```sql
   -- 这会发送密码重置邮件
   UPDATE auth.users
   SET recovery_sent_at = now()
   WHERE email = 'test@example.com';
   ```

3. **直接修改密码（不推荐）**：
   - 使用 Supabase CLI 或通过管理员 API

## 最佳实践

1. **开发阶段**：
   - 使用 Dashboard 创建测试用户
   - 使用简单的密码（如 `test123456`）
   - 勾选 "Auto Confirm User"

2. **生产环境**：
   - 让用户自己注册
   - 启用邮箱验证
   - 使用强密码策略
   - 启用双因素认证（2FA）

