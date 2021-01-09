import { ScrapeResult, ICSRate, SecurusRate, Rate as RateData, Stusab } from '@ptdp/lib';
import Rate from '../../../models/rate'

import crypto from 'crypto';

const sha1 = (str: string) => crypto.createHash("sha1").update(str).digest("hex")

/*
TODO - ICS transform!!

*/
const icsTransform = (rate: ICSRate) : RateData => ({
 initial_amount: rate.initialCost ? rate.initialCost * 100 : null,
 additional_amount: rate.overDuration ? rate.overDuration * 100 : null,
 initial_duration: rate.initialDuration ? parseInt(rate.initialDuration.match(new RegExp(/\d+/))[0]) : null,
 over_duration: rate.overDuration? parseInt(rate.overDuration.match(new RegExp(/\d+/))[0]) : null,

})

export const ics = async (scrape_result: ScrapeResult<ICSRate>) => {
    const errors = [];
    for (const property in scrape_result) {
        if (property === "errors") continue;

        const state = scrape_result[property as Stusab];

        for (const rate in state) {
            const sha = sha1(JSON.stringify(scrape_result));
            const match = await Rate.query().select('id').where('raw_sha1', '==', sha);
    
            if (match) {
                errors.push(`Duplicate: SHA: ${sha} matches SHA for ${match}`);
                continue;
            }
    
            await Rate.query.insert(icsTransform(rate))
        }
    }

    console.log(errors);
    // if a hash of the raw rate already exists in the table do not insert it (it is a dupe)
  
}

export const securus = async (scrape_result: ScrapeResult<SecurusRate>) => {

}