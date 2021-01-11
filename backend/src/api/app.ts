import express from "express";
import etl from "./controllers/etl";

const app = express();

app.use("/etl", etl);

export default app;
