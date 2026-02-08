-- Create storage bucket for melodies
insert into storage.buckets (id, name, public)
values ('melodies', 'melodies', true);

-- Set up storage policies for melodies bucket
-- Allow anyone to upload melodies (authenticated users)
create policy "Allow authenticated users to upload melodies"
on storage.objects for insert
to authenticated
with check (bucket_id = 'melodies');

-- Allow anyone to read melodies (public access)
create policy "Allow public to read melodies"
on storage.objects for select
to public
using (bucket_id = 'melodies');

-- Allow authenticated users to delete their own melodies
create policy "Allow users to delete melodies"
on storage.objects for delete
to authenticated
using (bucket_id = 'melodies');
