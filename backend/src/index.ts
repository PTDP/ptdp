import * as functions from "firebase-functions";
import "./db/index";

import app from "./api/app";

export const api = functions.https.onRequest(app);
