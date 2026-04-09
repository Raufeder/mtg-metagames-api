import { createClient } from "@supabase/supabase-js";

const createSupabaseUserAdmin = async (id: string) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase.auth.admin.updateUserById(id, {
  app_metadata: { role: "admin" }
});

  if (error) {
    console.error("Error creating admin user:", error.message);
  } else {
    console.log("Admin user created successfully:", data);
  }
};

createSupabaseUserAdmin("HAHA"); // Replace "HAHA" with the actual user ID you want to make an admin