import * as bodyParser from "body-parser";
import cors from "cors";

const app = require("./app");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded());

/**
 * Start Express server.
 */
const server = app.listen(9898, () => {
  console.log("Press CTRL-C to stop\n");
});

export = server;
