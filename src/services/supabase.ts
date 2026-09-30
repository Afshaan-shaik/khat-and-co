import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LetterData } from '../types/letter';
import { sanitizeLoadedLetter } from '../utils/storage';

// Read environment variables (Vite requires VITE_ prefix for client-exposed variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey.length > 20
  );
};

// Singleton Supabase Client
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const STORAGE_BUCKET = 'letters';

/**
 * Generates an 8-character URL-friendly slug.
 */
export function generateShortSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

/**
 * Saves a letter into Supabase PostgreSQL table 'letters'.
 */
export async function saveLetterToDatabase(
  letter: LetterData,
  customSlug?: string
): Promise<{ id: string; slug: string; publicUrl?: string } | null> {
  if (!supabase) return null;

  try {
    const slug = customSlug || generateShortSlug();
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `letter_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const { error: dbError } = await supabase.from('letters').insert({
      id,
      slug,
      recipient: letter.recipient,
      sender: letter.sender,
      date: letter.date,
      greeting: letter.greeting,
      body: letter.body,
      signoff: letter.signoff,
      template_id: letter.templateId,
      font_id: letter.fontId,
      ink_color: letter.inkColor,
      ruled_lines: letter.ruledLines,
      wax_seal: letter.waxSeal || null,
      stickers: letter.stickers || [],
      metadata: {
        city: letter.city,
        stamp: letter.stamp,
        ps: letter.ps,
        unlockDate: letter.unlockDate,
        fontSize: letter.fontSize,
        language: letter.language
      },
      payload: letter,
      created_at: new Date().toISOString()
    });

    if (dbError) {
      console.error('Error inserting letter into Supabase DB:', dbError);
    }

    // Save JSON asset to Supabase Storage bucket
    const storageResult = await saveLetterToStorage(letter, slug);

    return {
      id,
      slug,
      publicUrl: storageResult?.publicUrl
    };
  } catch (err) {
    console.error('saveLetterToDatabase failed:', err);
    return null;
  }
}

/**
 * Saves a letter file into Supabase Storage container ('letters' bucket).
 */
export async function saveLetterToStorage(
  letter: LetterData,
  slug: string
): Promise<{ path: string; publicUrl: string } | null> {
  if (!supabase) return null;

  try {
    const filePath = `letters/${slug}.json`;
    const jsonBlob = new Blob([JSON.stringify(letter, null, 2)], {
      type: 'application/json'
    });

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, jsonBlob, {
        upsert: true,
        contentType: 'application/json'
      });

    if (uploadError) {
      console.warn('Storage upload notice (bucket might need creation):', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: urlData.publicUrl
    };
  } catch (err) {
    console.warn('saveLetterToStorage failed:', err);
    return null;
  }
}

/**
 * Fetches a letter from Supabase PostgreSQL by either ID or slug.
 */
export async function getLetterFromSupabase(idOrSlug: string): Promise<LetterData | null> {
  if (!supabase) return null;

  try {
    // 1. Try querying by slug or id
    const { data, error } = await supabase
      .from('letters')
      .select('payload, recipient, sender, body, wax_seal, template_id, font_id, ink_color, stickers, metadata')
      .or(`slug.eq.${idOrSlug},id.eq.${idOrSlug}`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      if (data.payload) {
        return sanitizeLoadedLetter(data.payload);
      }
      return sanitizeLoadedLetter({
        recipient: data.recipient,
        sender: data.sender,
        body: data.body,
        templateId: data.template_id,
        fontId: data.font_id,
        inkColor: data.ink_color,
        waxSeal: data.wax_seal,
        stickers: data.stickers,
        ...(data.metadata || {})
      });
    }

    // 2. Fallback to Storage bucket file if DB row missing
    const { data: fileData, error: fileError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(`letters/${idOrSlug}.json`);

    if (!fileError && fileData) {
      const text = await fileData.text();
      const parsed = JSON.parse(text);
      return sanitizeLoadedLetter(parsed);
    }
  } catch (err) {
    console.warn('getLetterFromSupabase failed:', err);
  }

  return null;
}

/**
 * Fetches the recent letters from Supabase for the Shelf.
 */
export async function fetchShelfFromSupabase(): Promise<LetterData[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('letters')
      .select('payload')
      .order('created_at', { ascending: false })
      .limit(25);

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((row) => sanitizeLoadedLetter(row.payload));
    }
  } catch (err) {
    console.warn('fetchShelfFromSupabase error:', err);
  }

  return null;
}

/**
 * Backs up all local drafts, shelf letters, and site data to Supabase Storage and DB.
 */
export async function backupAllSiteDataToSupabase(): Promise<{
  success: boolean;
  syncedCount: number;
  backupFileUrl?: string;
  error?: string;
}> {
  if (!supabase) {
    return {
      success: false,
      syncedCount: 0,
      error: 'Supabase credentials are not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
    };
  }

  try {
    let syncedCount = 0;

    // 1. Collect all local data
    const draftRaw = localStorage.getItem('khat-and-co:draft');
    const shelfRaw = localStorage.getItem('khath:shelf');
    const themeRaw = localStorage.getItem('khat-and-co:theme');

    const draft = draftRaw ? JSON.parse(draftRaw) : null;
    const shelf = shelfRaw ? JSON.parse(shelfRaw) : [];

    // 2. Sync each shelf letter into Supabase DB & Storage
    if (Array.isArray(shelf)) {
      for (const item of shelf) {
        if (item && item.body) {
          await saveLetterToDatabase(sanitizeLoadedLetter(item));
          syncedCount++;
        }
      }
    }

    if (draft && draft.body) {
      await saveLetterToDatabase(sanitizeLoadedLetter(draft));
      syncedCount++;
    }

    // 3. Create a master site backup snapshot JSON
    const masterBackup = {
      app: 'Khat & Co.',
      backupDate: new Date().toISOString(),
      theme: themeRaw || 'light',
      draft,
      shelf,
      version: '1.0.0'
    };

    const backupBlob = new Blob([JSON.stringify(masterBackup, null, 2)], {
      type: 'application/json'
    });
    const backupFileName = `backups/khat-site-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

    const { error: backupUploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(backupFileName, backupBlob, {
        upsert: true,
        contentType: 'application/json'
      });

    let backupFileUrl = '';
    if (!backupUploadError) {
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(backupFileName);
      backupFileUrl = urlData.publicUrl;
    }

    return {
      success: true,
      syncedCount,
      backupFileUrl
    };
  } catch (err: any) {
    console.error('backupAllSiteDataToSupabase error:', err);
    return {
      success: false,
      syncedCount: 0,
      error: err?.message || 'Failed to sync data to Supabase'
    };
  }
}

/**
 * Deletes a letter from Supabase DB and storage bucket upon permanent truncation.
 */
export async function deleteLetterFromSupabase(idOrSlug: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    // 1. Delete DB row
    const { error: dbError } = await supabase
      .from('letters')
      .delete()
      .or(`slug.eq.${idOrSlug},id.eq.${idOrSlug}`);

    if (dbError) {
      console.warn('Supabase DB delete warning:', dbError);
    }

    // 2. Delete storage file if present
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([`letters/${idOrSlug}.json`]);

    return true;
  } catch (err) {
    console.warn('deleteLetterFromSupabase error:', err);
    return false;
  }
}
