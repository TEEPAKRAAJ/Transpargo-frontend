import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nludidoespixgbdeomul.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdWRpZG9lc3BpeGdiZGVvbXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTg4MTYsImV4cCI6MjA3OTYzNDgxNn0.LXadVmJ6dhE7IkVkBSqLJafd-kQInF8JCp0A2OfnKwU";

export const supabase = createClient(supabaseUrl, supabaseKey);
