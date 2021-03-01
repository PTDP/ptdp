import crypto from "crypto";

export const sha256 = (str: string) =>
  crypto.createHash("sha256").update(str).digest("hex");

export const sha1 = (str: string) =>
  crypto.createHash("sha1").update(str).digest("hex");
