import { createClient } from "@supabase/supabase-js";

// Supabase URL and publishable key are public client configuration.
// Never place a Supabase secret/service_role key in browser code.
const supabaseUrl = "https://mvwflakurihhakdrlteg.supabase.co";
const supabasePublishableKey = "sb_publishable_nGBEVnx4ZFHEe-ne3SzeOw_y3Lpt4nd";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
