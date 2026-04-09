import { supabase } from "../supabase.js";


  const seedFormats = async () => {
      const { error } = await supabase.from("metagames").update({ format: "Standard" }).is("format", null);
      if (error) {
        console.error(`Failed to batch update formats: ${error.message}`);
      } else {
        console.log(`Inserted formats successfully.`);
      }
  }

  seedFormats();