import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://mvwflakurihhakdrlteg.supabase.co";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_nGBEVnx4ZFHEe-ne3SzeOw_y3Lpt4nd";

// Publishable keys are intended for browser use. Never expose a Supabase secret key here.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

