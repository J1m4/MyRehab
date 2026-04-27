import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadFile(
  file: File,
  bucket: 'exercise-videos' | 'profile-pictures' | 'avatars',
  userId?: string
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase credentials are not configured.");
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const fileName = userId 
    ? `${userId}-${timestamp}.${fileExt}`
    : `${Math.random().toString(36).substring(2)}-${timestamp}.${fileExt}`;
  
  const filePath = fileName;

  console.log(`[Supabase Upload] Target Bucket: ${bucket}`);
  console.log(`[Supabase Upload] File Path: ${filePath}`);
  console.log(`[Supabase Upload] File Type: ${file.type}, Size: ${file.size} bytes`);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Supabase Storage Upload Error Details:", {
      message: error.message,
      name: error.name,
      status: (error as any).status,
    });
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  console.log(`[Supabase Upload] Success. Public URL: ${publicUrl}`);

  return publicUrl;
}
