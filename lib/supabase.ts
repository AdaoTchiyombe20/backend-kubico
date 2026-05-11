import { createClient } from '@supabase/supabase-js'
import "dotenv/config";
import { env } from "prisma/config";

export const supabase = createClient(env("PROJECT_URL"), env("API_KEY_supabase"))
export const supabaseAdmin = createClient(env("PROJECT_URL"), env("API_SECRET_KEY_supabase"))
