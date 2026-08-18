import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mxmkbsngambpjbtzxfbe.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14bWtic25nYW1icGpidHp4ZmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5OTIzOTYsImV4cCI6MjEwMjU2ODM5Nn0.nCmizR3utwyjpUd5HFb_csLXorFMGjZMiTV6sYE2W-g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload an attachment (image, audio, etc.) to the 'chat-attachments' Supabase storage bucket
 */
export async function uploadChatAttachment(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.warn('Storage upload notice:', uploadError.message);
      return URL.createObjectURL(file);
    }

    const { data } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Upload exception:', err);
    return URL.createObjectURL(file);
  }
}
