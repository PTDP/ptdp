import express from "express";
import etl from "./controllers/etl";
import postgraphile from './postgraphile';

const app = express();

// https://www.graphile.org/postgraphile/
app.use(postgraphile);
app.use("/etl", etl);

export default app;
