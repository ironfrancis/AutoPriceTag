-- 创建整页排版表
-- 用于存储用户的整页排版设计

CREATE TABLE IF NOT EXISTS page_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_id TEXT UNIQUE NOT NULL,
  layout_name TEXT NOT NULL,
  canvas_preset JSONB NOT NULL,
  instances JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_page_layouts_user_id ON page_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_page_layouts_layout_id ON page_layouts(layout_id);
CREATE INDEX IF NOT EXISTS idx_page_layouts_updated_at ON page_layouts(updated_at DESC);

-- 启用行级安全策略 (RLS)
ALTER TABLE page_layouts ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能查看自己的排版
CREATE POLICY "Users can view their own page layouts"
  ON page_layouts FOR SELECT
  USING (auth.uid() = user_id);

-- 创建 RLS 策略：用户只能插入自己的排版
CREATE POLICY "Users can insert their own page layouts"
  ON page_layouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建 RLS 策略：用户只能更新自己的排版
CREATE POLICY "Users can update their own page layouts"
  ON page_layouts FOR UPDATE
  USING (auth.uid() = user_id);

-- 创建 RLS 策略：用户只能删除自己的排版
CREATE POLICY "Users can delete their own page layouts"
  ON page_layouts FOR DELETE
  USING (auth.uid() = user_id);

-- 创建触发器以自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_page_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_page_layouts_updated_at
  BEFORE UPDATE ON page_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_page_layouts_updated_at();


