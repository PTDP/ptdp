import { ScrapeResult, ICSRate, SecurusRate } from '@ptdp/lib';
const { raw } = require('objection');
import crypto from 'crypto';

const sha1 = (str: string) => crypto.createHash("sha1").update(str).digest("hex")

export const ics = async (scrape_result: ScrapeResult<ICSRate>) => {
    for (const property in scrape_result) {
        if (property === "errors") continue;

        
    }
    // if a hash of the raw rate already exists in the table do not insert it (it is a dupe)
  
}

export const securus = async (scrape_result: ScrapeResult<SecurusRate>) => {

}