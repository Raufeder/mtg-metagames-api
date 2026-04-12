import { supabase } from "../supabase.js";

const testJWT = async () => {
  const { data } = await supabase.auth.signInWithPassword({ email: "draufeisen1001@gmail.com", password: "testing" })
  if (data.session) {
  console.log("Bearer",data.session.access_token)
  } else {
    console.error("Failed to sign in:", data);
  }
}

testJWT();