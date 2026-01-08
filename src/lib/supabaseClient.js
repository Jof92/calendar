// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fopfzwzxicsvjjonisbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcGZ6d3p4aWNzdmpqb25pc2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MDk5NjEsImV4cCI6MjA2Njk4NTk2MX0.W0Awbc4kNuGI-c9KI1KSIZuxJcxEOJuToLE-cfx2wUc'; // ⬅️ cole a chave ANON do painel

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;