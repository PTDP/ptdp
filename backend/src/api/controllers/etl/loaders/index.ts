import { ScrapeResult, ICSRate, SecurusRate, Rate as RateData, Stusab } from '@ptdp/lib';
import Rate from '../../../models/rate'
import Service from '../../../models/service';
import Company from '../../../models/company';
import Scraper from '../../../models/scraper';
import Facility from '../../../models/facility';
import Agency from '../../../models/agency';

import crypto from 'crypto';

const sha1 = (str: string) => crypto.createHash("sha1").update(str).digest("hex")
const strToInt = (str: string) : number => parseInt(str.match(new RegExp(/\d+/))?.[0] || '0');


// Arizona - Arizona Department of Corrections => Arizona Department of Corrections
const trimAgency = (agency: string) => agency.split('-')[1].trim();

const icsTransform = async (rate: ICSRate, {
    sha,
    service_id,
    company_id
} : {
    sha: string,
    service_id: number,
    company_id: number
}) : Promise<RateData> => {

    let facility = await Facility.query().findOne('raw_name', '=', rate.facility).select('id');
    if (!facility) {
        let agency = await Agency.query().findOne('raw_name', '=', rate.agency).select('id');
        if (!agency) {
            agency = await Agency.query().insert({raw_name: rate.agency, name: trimAgency(rate.agency)});
        }
        facility = await Facility.query().insert({raw_name: rate.facility, name: rate.facility, agency_id: agency.id});
    }

    const scraper = await Scraper.query().findOne('uuid', '=', rate.scraper).select('id');
    const sixty_sec_tax_rate =  rate.tax ? (rate.tax / (rate.seconds / 60) as any).toPrecision(4) * 100 : null;

    return {
        initial_amount: rate.initialCost ? rate.initialCost * 100 : null,
        additional_amount: rate.overCost ? rate.overCost * 100 : null,
        initial_duration: rate.initialDuration ? strToInt(rate.initialDuration) : null,
        over_duration: rate.overDuration? strToInt(rate.overDuration) : null,
        // get 60 second tax rate
        tax: rate.tax ? sixty_sec_tax_rate : null,
        raw_sha1: sha,
        phone_number: parseInt(rate.number),
        service_id,
        company_id,
        scraped_at: new Date(rate.createdAt).toISOString(),
        scraper_id: scraper.id,
        raw: JSON.stringify(rate),
        facility_id: facility.id
    }

}

export const ics = async (scrape_result: ScrapeResult<ICSRate>) => {
    const errors = [];

    const service = await Service.query().findOne('name', '=', 'Default').select('id');
    const company = await Company.query().findOne('name', '=', 'ICS').select('id');

    let count = 0;
    let total = Object.keys(scrape_result).reduce((acc, elt) => {
        return acc + (scrape_result as any)[elt].length || 0;
    }, 0);

    for (const property in scrape_result) {
        if (property === "errors") continue;
        const state = scrape_result[property as Stusab];

        for (const rate of state!) {
            console.log(`Processing ${count}/${total}\n`);
            count += 1;

            const sha = sha1(JSON.stringify(rate));
            const match = await Rate.query().findOne('raw_sha1', '=', sha).select('id');
    
            if (match) {
                console.log(`Duplicate: SHA: ${sha} matches SHA for ${match.id} \n`);
                errors.push(`Duplicate: SHA: ${sha} matches SHA for ${match.id}`);
                continue;
            }

            const insertable = await icsTransform(rate, {
                sha,
                service_id: service.id,
                company_id: company.id
            })

            await Rate.query().insert(insertable);
        }
    }
    
    // upload errors to GCS
    console.log(errors);
}

export const securus = async (scrape_result: ScrapeResult<SecurusRate>) => {

}