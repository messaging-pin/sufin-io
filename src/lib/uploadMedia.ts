import { supabase } from './supabase';

/**
 * Upload a media blob (voice note, image) to Supabase Storage
 * and return its public URL.
 */
export async function uploadMediaToSupabase(
  blob: Blob,
  folder: string = 'voice-notes',
  fileExtension: string = 'webm'
): Promise<string | null> {
  try {
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    // Ensure the 'chat-media' bucket exists (will silently fail if already exists)
    await supabase.storage.createBucket('chat-media', {
      public: true,
      allowedMimeTypes: ['audio/*', 'image/*', 'video/*'],
      fileSizeLimit: 52428800 // 50MB
    });

    // Upload the blob
    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, blob, {
        contentType: blob.type || 'audio/webm',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(data.path);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('Upload exception:', err);
    return null;
  }
}
