import express from "express"
import metagamesRouter from "./routes/metagames.js";
import tournamentsRouter from "./routes/tournaments.js";
import archetypesRouter from "./routes/archetypes.js";
import decksRouter from "./routes/decks.js";
import searchRouter from "./routes/search.js";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "https://mtg-metagames-web.vercel.app"
}));
app.use(express.json());
app.use("/metagames", metagamesRouter);
app.use("/tournaments", tournamentsRouter);
app.use("/archetypes", archetypesRouter);
app.use("/decks", decksRouter);
app.use("/search", searchRouter);

app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});


app.listen(process.env.PORT || 3000);