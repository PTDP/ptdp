import express from "express";
import etl from "./controllers/etl";
import postgraphile from './postgraphile';

const app = express();

app.use(postgraphile);
app.use("/etl", etl);

export default app;
