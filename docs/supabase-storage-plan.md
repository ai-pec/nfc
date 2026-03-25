# Supabase buckets and storage policies

Create these buckets in Supabase Storage:

1. `portfolio-media`
Public bucket for avatars, cover images, and gallery media used on the live hosted portfolio.

2. `document-vault`
Private bucket for certificates, resumes, and identity documents. Every file should be delivered through signed URLs only.

3. `admin-exports`
Private bucket for CSV exports, moderation backups, or internal review files.

Recommended object path strategy:

- `portfolio-media/{profile_id}/avatar/{filename}`
- `portfolio-media/{profile_id}/gallery/{filename}`
- `document-vault/{profile_id}/{asset_id}/{filename}`
- `admin-exports/{admin_profile_id}/{timestamp}-{filename}`

Recommended storage RLS policies:

```sql
create policy "portfolio_media_public_read"
on storage.objects
for select
using (bucket_id = 'portfolio-media');

create policy "portfolio_media_owner_upload"
on storage.objects
for insert
with check (
  bucket_id = 'portfolio-media'
  and auth.uid() is not null
);

create policy "portfolio_media_owner_update"
on storage.objects
for update
using (
  bucket_id = 'portfolio-media'
  and auth.uid() is not null
);

create policy "document_vault_owner_or_admin_read"
on storage.objects
for select
using (
  bucket_id = 'document-vault'
  and auth.uid() is not null
);

create policy "document_vault_owner_or_admin_write"
on storage.objects
for all
using (
  bucket_id = 'document-vault'
  and auth.uid() is not null
)
with check (
  bucket_id = 'document-vault'
  and auth.uid() is not null
);
```

Application rules to keep:

- Never expose `document-vault` paths directly in the client.
- Generate signed URLs on the server for 60 seconds or less.
- Keep delete, pause, and moderation actions server-side with a service role key.
- Log every destructive admin action into `public.admin_audit_logs`.
