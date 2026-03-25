insert into storage.buckets (id, name, public)
values
  ('portfolio-media', 'portfolio-media', true),
  ('portfolio-documents', 'portfolio-documents', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'portfolio_media_public_read'
  ) then
    create policy "portfolio_media_public_read"
    on storage.objects
    for select
    using (bucket_id = 'portfolio-media');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'portfolio_media_service_upload'
  ) then
    create policy "portfolio_media_service_upload"
    on storage.objects
    for insert
    with check (bucket_id = 'portfolio-media');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'portfolio_documents_service_upload'
  ) then
    create policy "portfolio_documents_service_upload"
    on storage.objects
    for insert
    with check (bucket_id = 'portfolio-documents');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'portfolio_documents_service_read'
  ) then
    create policy "portfolio_documents_service_read"
    on storage.objects
    for select
    using (bucket_id = 'portfolio-documents');
  end if;
end;
$$;
