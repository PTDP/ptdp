import express from "express";
import etl from "./controllers/etl";
import scrape from "./controllers/scrape";
// import postgraphile from "./postgraphile";
import cors from "cors";

const app = express();

app.use(cors());
// // https://www.graphile.org/postgraphile/
// app.use(postgraphile);

app.use("/etl", etl);
app.use("/scrape", scrape);

export default app;
