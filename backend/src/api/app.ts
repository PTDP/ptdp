import * as express from "express";
import load from "./controllers/etl";

const app = express();

app.use("/load", load);

export default app;
