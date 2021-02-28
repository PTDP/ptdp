import crypto from "crypto";

// Arizona - Arizona Department of Corrections => Arizona Department of Corrections
export const trimAgency = (agency: string) => agency.split("-")[1].trim();

export const sha256 = (str: string) =>
  crypto.createHash("sha256").update(str).digest("hex");
