import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kkcqnidmrwnjhwyiketp.supabase.co";
const supabaseAnonKey = "sb_publishable_WkB_ETMw3vnNVUhSWa_7nw_vNkOoSeb";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);