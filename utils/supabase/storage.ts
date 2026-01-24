import { createClient } from "@supabase/supabase-js";

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const uploadFileToSupabaseStorage = async (file: File, bucketName: string, path: string) => {
    if (!supabaseURL || !supabaseAnonKey) {
        throw new Error("Supabase URL or Anon Key is not defined.");
    }

    const supabase = createClient(supabaseURL, supabaseAnonKey);

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        throw error;
    }

    return data;
};

export const getPublicUrlFromSupabaseStorage = (bucketName: string, path: string): string => {
    if (!supabaseURL || !supabaseAnonKey) {
        throw new Error("Supabase URL or Anon Key is not defined.");
    }

    const supabase = createClient(supabaseURL, supabaseAnonKey);
    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    return data.publicUrl;
}