import express from "express"
import metagamesRouter from "./routes/metagames.js";
import tournamentsRouter from "./routes/tournaments.js";
import archetypesRouter from "./routes/archetypes.js";
import decksRouter from "./routes/decks.js";

const app = express();
app.use(express.json());
app.use("/metagames", metagamesRouter);
app.use("/tournaments", tournamentsRouter);
app.use("/archetypes", archetypesRouter);
app.use("/decks", decksRouter);

app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});


app.listen(process.env.PORT || 3000);