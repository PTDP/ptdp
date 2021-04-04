const functions = require("firebase-functions");
import { postgraphile } from "postgraphile";

export default postgraphile(functions.config().db.connection, "public", {
  watchPg: false,
  graphiql: true,
  enhanceGraphiql: true,
  allowExplain: (req) => {
    return true;
  },
});
