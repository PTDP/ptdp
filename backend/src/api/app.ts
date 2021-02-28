import express from "express";
import etl from "./controllers/etl";
// import postgraphile from "./postgraphile";
import cors from "cors";

const app = express();

app.use(cors());
// // https://www.graphile.org/postgraphile/
// app.use(postgraphile);

app.use("/etl", etl);

export default app;
