import { createClientSideSupabaseClient } from "@/utils/supabase/client";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClientSideSupabaseClient();

export const createServiceRoleSupabaseClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};