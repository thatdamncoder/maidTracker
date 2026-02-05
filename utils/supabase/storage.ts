import { createClientSideSupabaseClient } from "@/utils/supabase/client";
 
const supabase = createClientSideSupabaseClient();

export const uploadFileToSupabaseStorage = async (file: File, bucketName: string, path: string) => {
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
    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    return data.publicUrl;
}