import crypto from "crypto";
import { ICSRate, SecurusRate } from "@ptdp/lib";

const sha1 = (str: string) =>
  crypto.createHash("sha1").update(str).digest("hex");

export const rawToSha = (raw: ICSRate | SecurusRate) =>
  sha1(JSON.stringify(removeMetadata(raw)));

export const removeMetadata = (
  raw: ICSRate | SecurusRate
): Omit<ICSRate | SecurusRate, "createdAt"> => {
  const r: ICSRate | SecurusRate = { ...raw };
  delete (r as any).createdAt;
  return r;
};
