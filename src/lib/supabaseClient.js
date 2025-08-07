import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cfysbejlmhgfgkrivlcy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeXNiZWpsbWhnZmdrcml2bGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTg3NjksImV4cCI6MjA3MDA3NDc2OX0.7b0GxDe5ZAkyDpiwJugm5c4tbyuQjCOMDrM6N9ScmR4";
export const supabase = createClient(
  "https://cfysbejlmhgfgkrivlcy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeXNiZWpsbWhnZmdrcml2bGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTg3NjksImV4cCI6MjA3MDA3NDc2OX0.7b0GxDe5ZAkyDpiwJugm5c4tbyuQjCOMDrM6N9ScmR4"
);
