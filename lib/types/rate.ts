import { SecurusServices } from './service';

export type ICSRate = {
    tariffBand: string
    initialDuration: string,
    initialCost: number,
    overDuration: number,
    overCost: number,
    tax: number,
    finalCost: number,
    number: string,
    createdAt: number,
    scraper: string,
    agency: string,
    seconds: number
}

export type SecurusRate = {
    additionalAmount: string,
    feeName: string | null,
    initalAmount: string,
    quoteRule: boolean,
    ratePerMinute: number,
    surCharge: number,
    totalAmount: string,
    number: string,
    service: SecurusServices,
    createdAt: number,
    scraper: string,
    facility: string,
    seconds: number
}

export type Stusab = "AL"|"AK"|"AZ"|"AR"|"CA"|"CO"|"CT"|"DE"|"FL"|"GA"|"HI"|"ID"|"IL"|"IN"|"IA"|"KS"|"KY"|"LA"|"ME"|"MD"|"MA"|"MI"|"MN"|"MS"|"MO"|"MT"|"NE"|"NV"|"NH"|"NJ"|"NM"|"NY"|"NC"|"ND"|"OH"|"OK"|"OR"|"PA"|"RI"|"SC"|"SD"|"TN"|"TX"|"UT"|"VT"|"VA"|"WA"|"WV"|"WI"|"WY";

export type ScrapeResult<T> = {
    errors: string[]
} & {
    [K in Stusab]?: T[]
}

export type Rate = {
    initial_amount: number,
    additional_amount: number,
    initial_duration: number,
    over_duration: number,
    tax: number,
    raw: ICSRate | SecurusRate,
    raw_sha1: string;
    created_at: number,
    phone_number: number,
    service_id: number,
    facility_id: number,
    company_id: number,
    scraper_id: number
}