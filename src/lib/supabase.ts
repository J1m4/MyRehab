import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadFile(
  file: File,
  bucket: 'exercise-videos' | 'profile-pictures' | 'avatars' | 'message-attachments' | 'exercise-media',
  userId?: string,
  customFileName?: string
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase credentials are not configured.");
  }

  let fileToUpload: File | Blob = file;
  let fileName = '';
  const timestamp = Date.now();

  // Handle HEIC files from iPhone
  if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
    try {
      console.log("[Supabase Upload] Converting HEIC to JPEG...");
      const heic2any = (await import('heic2any')).default;
      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });
      
      fileToUpload = Array.isArray(blob) ? blob[0] : blob;
      fileName = customFileName 
        ? (customFileName.endsWith('.jpg') ? customFileName : `${customFileName}.jpg`)
        : (userId ? `${userId}-${timestamp}.jpg` : `${Math.random().toString(36).substring(2)}-${timestamp}.jpg`);
    } catch (e) {
      console.error("[Supabase Upload] HEIC conversion failed, uploading original:", e);
      const fileExt = file.name.split('.').pop() || 'heic';
      fileName = customFileName || (userId 
        ? `${userId}-${timestamp}.${fileExt}`
        : `${Math.random().toString(36).substring(2)}-${timestamp}.${fileExt}`);
    }
  } else {
    const fileExt = file.name.split('.').pop() || 'jpg';
    fileName = customFileName || (userId 
      ? `${userId}-${timestamp}.${fileExt}`
      : `${Math.random().toString(36).substring(2)}-${timestamp}.${fileExt}`);
  }
  
  const filePath = fileName;

  console.log(`[Supabase Upload] Target Bucket: ${bucket}`);
  console.log(`[Supabase Upload] File Path: ${filePath}`);
  console.log(`[Supabase Upload] File Type: ${fileToUpload.type}, Size: ${fileToUpload.size} bytes`);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileToUpload, {
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
