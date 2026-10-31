import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mvwflakurihhakdrlteg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_nGBEVnx4ZFHEe-ne3SzeOw_y3Lpt4nd";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
