-- Early-access sign-ups from the fake-door panels on the PDF tools site.
create table public.signups (
  id uuid primary key default gen_random_uuid(),
  email text not null check (position('@' in email) > 1 and length(email) <= 320),
  source text not null check (source in ('auto_detect', 'auto_rename', 'pro')),
  -- Server time only; the browser's clock is not trusted.
  created_at timestamptz not null default now(),
  -- Which page the visitor was on, for reading the funnel later.
  referer text,
  unique (email, source)
);

comment on table public.signups is
  'Emails left on features that do not exist yet. Written only by the signup edge function.';

-- No policies are defined, so anon and authenticated cannot read or write this
-- table at all. The edge function writes with the service role, which bypasses RLS.
alter table public.signups enable row level security;

create index signups_created_at_idx on public.signups (created_at desc);
