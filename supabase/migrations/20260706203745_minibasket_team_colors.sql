alter table public.mb_teams
  add column if not exists color_d text not null default '#6e1526',
  add column if not exists color_s text not null default '#c39b41';
