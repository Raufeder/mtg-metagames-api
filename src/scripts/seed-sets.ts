import { supabase } from "../supabase.js";


  const seedSets = async () => {
    const response = await fetch("https://api.scryfall.com/sets");
    if (!response.ok) {
      console.error("Failed to fetch sets from Scryfall.");
      return;
    }
    const resJson = await response.json();
    const typesOfSetsToInclude = ["core", "expansion"];
    const arrayToSendToSupabase = resJson.data.filter((set: any) => typesOfSetsToInclude.includes(set.set_type)).map((set: any) => ({
      scryfall_id: set.id,
      icon_set_image: set.icon_svg_uri,
      name: set.name,
      set_code: set.code
    }));
      const { error } = await supabase.from("sets").upsert(arrayToSendToSupabase, {
        onConflict: "scryfall_id"
      });
      if (error) {
        console.error(`Failed to batch include sets: ${error.message}`);
      } else {
        console.log(`Inserted sets successfully.`);
      }
  }

  seedSets();