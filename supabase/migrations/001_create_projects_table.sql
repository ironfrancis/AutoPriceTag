-- 创建 projects 表
-- 在 Supabase Dashboard -> SQL Editor 中运行此脚本

-- 创建表
create table if not exists public.projects (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label_id text unique not null,
  name text not null,
  data text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_label_id_idx on public.projects(label_id);

-- 启用 RLS (Row Level Security)
alter table public.projects enable row level security;

-- 删除旧策略（如果存在）
drop policy if exists "Users can view own projects" on public.projects;
drop policy if exists "Users can insert own projects" on public.projects;
drop policy if exists "Users can update own projects" on public.projects;
drop policy if exists "Users can delete own projects" on public.projects;

-- 创建策略：用户只能查看自己的项目
create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的项目
create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的项目
create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的项目
create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- 创建更新时间触发器
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 为 updated_at 添加触发器
drop trigger if exists update_projects_updated_at on public.projects;
create trigger update_projects_updated_at
  before update on public.projects
  for each row
  execute function update_updated_at_column();

