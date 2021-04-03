import { ICSRate } from "@ptdp/lib";
import { Storage } from "@google-cloud/storage";
import * as states from "us-state-codes";

import {
    ScraperInput,
    ICSProduct,
    ICSProductAppended,
    StateInput,
    ICSFacility,
    ICSRawRate,
} from "./types";
import PendingXHR from "./pendingXHR";
import { falseyToNull, sleepInRange } from "./util";

const {
    GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    CLOUD_STORAGE_BUCKET,
} = process.env;
const BASE_URL = "https://icsonline.icsolutions.com";

const Apify = require("apify");

/*
EXAMPLE REQUEST

https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn, {
  "headers": {
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "faces-request": "partial/ajax",
    "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "javax.faces.partial.ajax=true&javax.faces.source=j_idt90%3Aj_idt176&javax.faces.partial.execute=j_idt90&javax.faces.partial.render=j_idt90&j_idt90%3Aj_idt176=j_idt90%3Aj_idt176&j_idt90=j_idt90&j_idt90%3Aservice=AdvancePay&j_idt90%3AfacilityState=IN&j_idt90%3Afacility=1023&j_idt90%3Asubfacility=4H01&j_idt90%3AphoneNumber=(208)+354-4311&j_idt90%3Ahour=12&j_idt90%3Aminute=00&j_idt90%3AamPm=PM&j_idt90%3AcallDuration=1&javax.faces.ViewState=4591427920265658729%3A108192668930020655",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"


  form data

    No sub facility
    javax.faces.partial.ajax: true
    javax.faces.source: j_idt90:j_idt176
    javax.faces.partial.execute: j_idt90
    javax.faces.partial.render: j_idt90
    j_idt90:j_idt176: j_idt90:j_idt176
    j_idt90: j_idt90
    j_idt90:service: AdvancePay | Collect // dynamic field
    j_idt90:facilityState: IN // dynamic field
    j_idt90:facility: 1023 // dynamic field
    j_idt90:phoneNumber: (208) 354-4311 // dynamic field
    j_idt90:hour: 8 // dynamic field
    j_idt90:minute: 00 // dynamic field
    j_idt90:amPm: PM // dynamic field
    j_idt90:callDuration: 1 // dynamic field
    javax.faces.ViewState: 4591427920265658729:108192668930020655 // dynamic field

    dynamic

    Sub Facility
    javax.faces.partial.ajax: true
    javax.faces.source: j_idt90:j_idt176
    javax.faces.partial.execute: j_idt90
    javax.faces.partial.render: j_idt90
    j_idt90:j_idt176: j_idt90:j_idt176
    j_idt90: j_idt90
    j_idt90:service: AdvancePay | Collect
    j_idt90:facilityState: IN
    j_idt90:facility: 808
    j_idt90:subfacility: 7220
    j_idt90:phoneNumber: (208) 354-4311
    j_idt90:hour: 8
    j_idt90:minute: 00
    j_idt90:amPm: PM
    j_idt90:callDuration: 1
    javax.faces.ViewState: 4591427920265658729:108192668930020655


    Field with call amount:
    The estimated cost of a phone call from Federal Bureau of Prisons AR-Forrest City FCC to the phone number you provided, conducted today at 8:00 PM and lasting 1 minute(s) is: $0.21

    Live Agent Fee
    Automated Payment Fee 
    Paper Bill/Statement Fee


*/

// const selectAgency = async (page) => {
//     await new Promise((res, err) => {
//         let agencySelectInterval = setInterval(async () => {
//             try {
//                 const agencyName = await page.evaluate((sel) => {
//                     return document.querySelector(sel);
//                 }, selectors.agency_name_dropdown);

//                 if (agencyName) {
//                     clearInterval(agencySelectInterval);
//                     await page.click(selectors.agency_name_dropdown);
//                     res(agencyName);
//                 }

//                 if (!agencyName) {
//                     // Retype and backspace to trigger results
//                     await page.focus(selectors.agency_name_input);
//                     await page.type(" ");
//                     await page.keyboard.press("Backspace");
//                 }
//             } catch (err) {
//                 console.error(err.toString());
//                 err(err.toString());
//             }
//         }, 100);
//     });
// };

const {
    utils: { log },
} = Apify;

const icsRequest = (page, url, headers) =>
    page.evaluate(
        async (headers, url, BASE_URL) => {
            const response = await fetch(url, {
                headers,
                referrer: BASE_URL + "/rates",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET",
                mode: "cors",
                credentials: "include",
            });
            const json = await response.json();
            return json;
        },
        headers,
        url,
        BASE_URL
    );

const getMultiStateProducts = (products: ICSProduct[]) =>
    products.filter((p) =>
        products.find(
            (pr) => pr.agency_id === p.agency_id && pr.state_cd !== p.state_cd
        )
    );

class SingleStateHandler {
    multiStateProducts: ICSProductAppended[];
    singleStateProducts: ICSProductAppended[];

    constructor(
        private state: StateInput,
        private uid,
        private page,
        private headers,
        private products: ICSProduct[]
    ) {
        this.singleStateProducts = this.addPublicAgencies(
            this.stateProducts(this.getSingleStateProducts(this.products))
        ).filter(
            (v, i, a) => a.findIndex((t) => t.agency_id === v.agency_id) === i
        );

        this.multiStateProducts = this.addPublicAgencies(
            this.stateProducts(getMultiStateProducts(this.products))
        );
    }

    addPublicAgencies(products: ICSProduct[]): ICSProductAppended[] {
        return products.map((p, _, a) => {
            return {
                ...p,
                publicAgencies: a
                    .filter((el) => el.agency_id === p.agency_id)
                    .map((prod) => prod.full_nm)
                    .join(","),
            };
        });
    }

    async getFaciliites(product: ICSProduct) {
        const facilities: ICSFacility[] = await icsRequest(
            this.page,
            BASE_URL + `/public-api/products/${product.agency_id}/facilities`,
            this.headers
        );
        return facilities;
    }

    async getInStateRate(product, facility) {
        const in_state_rate: ICSRawRate = await icsRequest(
            this.page,
            BASE_URL +
                `/public-api/products/${
                    product.agency_id
                }/rates/${this.state.in_state_phone.slice(
                    1
                )}?duration=900&site_id=${facility.site_id}`,
            this.headers
        );

        return in_state_rate;
    }

    async getOutStateRate(product, facility) {
        const out_state_rate: ICSRawRate = await icsRequest(
            this.page,
            BASE_URL +
                `/public-api/products/${
                    product.agency_id
                }/rates/${this.state.out_state_phone.slice(
                    1
                )}?duration=900&site_id=${facility.site_id}`,
            this.headers
        );

        return out_state_rate;
    }

    rawRateToICSRate(
        rawRate: ICSRawRate,
        facility: ICSFacility,
        product: ICSProductAppended,
        number: string
    ) {
        const { summary } = rawRate || {};
        return falseyToNull({
            tariffBand: summary?.tariffBand,
            initialDuration: summary?.initialDuration,
            initialCost: summary?.initialCost,
            overDuration: summary?.overDuration,
            overCost: summary?.overCost,
            tax: summary?.tax,
            finalCost: summary?.finalCost,
            number: number,
            createdAt: Date.now(),
            scraper: this.uid,
            internalAgency: product.agency_id,
            internalAgencyFullName: product.agency_nm,
            publicAgencies: product.publicAgencies,
            facility: facility.facility_nm,
            seconds: rawRate.duration,
        });
    }

    async run() {
        const rates: ICSRate[] = [];
        const rate_calls: {
            facilities: ICSFacility[];
            product: ICSProductAppended;
        }[] = [];

        for (const product of this.singleStateProducts) {
            const facilities = await this.getFaciliites(product);
            await sleepInRange(400, 700);
            rate_calls.push({ facilities, product });
        }

        for (const product of this.multiStateProducts) {
            const facilities = [
                {
                    site_id: product.site_id,

                    // "Arizona - Central Arizona - Florence Correctional Complex" => "Central Arizona - Florence Correctional Complex""
                    facility_nm: product.full_nm
                        .split("-")
                        .slice(1)
                        .join("-")
                        .trim(),
                },
            ];

            rate_calls.push({ facilities, product });
        }

        for (const { facilities, product } of rate_calls) {
            for (const facility of facilities) {
                await sleepInRange(400, 700);
                const in_state_rate = await this.getInStateRate(
                    product,
                    facility
                );

                const in_state_ics = this.rawRateToICSRate(
                    in_state_rate,
                    facility,
                    product,
                    this.state.in_state_phone
                );

                const out_state_rate = await this.getOutStateRate(
                    product,
                    facility
                );

                const out_state_ics = this.rawRateToICSRate(
                    out_state_rate,
                    facility,
                    product,
                    this.state.out_state_phone
                );

                rates.push(in_state_ics, out_state_ics);
            }
        }
        return rates;
    }

    getSingleStateProducts(products: ICSProduct[]) {
        const multistateP = getMultiStateProducts(products).map((p) =>
            JSON.stringify(p)
        );
        return products.filter(
            (p) => !multistateP.find((elt) => elt === JSON.stringify(p))
        );
    }

    productBelongsToState(product, state) {
        return (
            product.state_cd.toUpperCase() === state.stusab.toUpperCase() ||
            states.getStateCodeByStateName(product.state_nm) ===
                state.stusab.toUpperCase()
        );
    }

    stateProducts(products: ICSProduct[]) {
        return products.filter((p) =>
            this.productBelongsToState(p, this.state)
        );
    }
}

const getProducts = (page, headers) =>
    icsRequest(page, BASE_URL + "/public-api/products", headers);

async function uploadFile(destination, content) {
    let credentials = JSON.parse(
        Buffer.from(GOOGLE_APPLICATION_CREDENTIALS_BASE64, "base64").toString(
            "ascii"
        )
    );
    const storage = new Storage({
        credentials,
    });
    const file = storage.bucket(CLOUD_STORAGE_BUCKET).file(destination);
    await file.save(content);
}

const selectors = {
    state: 'select[id$=":facilityState"]',
    first_state: 'ul[class^="dropdown-menu"] li[id^="typeahead"]',
    submit: "//a[contains(., 'Submit')]",
};

const splitPostData = (postData: string) => {
    const postDataKv = {};
    if (!postData) return;
    postData.split("&").forEach((d) => {
        if (!d) return;
        const split = d.split("=");
        if (!Array.isArray(split)) return;
        postDataKv[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
    });

    return postDataKv;
};

const getHeaders = async (page) => {
    await page.waitForSelector(selectors.state);
    await page.select(selectors.state, "AL");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await page.waitForXPath(selectors.submit);
    const [elt] = await page.$x(selectors.submit);

    const pending = new Promise((res, err) => {
        new PendingXHR(
            page,
            (response) => {
                res({
                    headers: response._request._headers,
                    postData: splitPostData(response._request._postData),
                });
            },
            "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn",
            true,
            "phoneNumber",
            "javax.faces.partial.event"
        );
    });
    await elt.click();

    return pending;
};

/*

javax.faces.partial.ajax: true
javax.faces.source: j_idt91:phoneNumber
javax.faces.partial.execute: j_idt91:phoneNumber
javax.faces.partial.render: j_idt91:phoneNumberUsaMessage
javax.faces.behavior.event: blur
javax.faces.partial.event: blur
j_idt91: j_idt91
j_idt91:service: AdvancePay
j_idt91:facilityState: AZ
j_idt91:facility: 727
j_idt91:phoneNumber: (323) 211-1111
j_idt91:hour: 2
j_idt91:minute: 00
j_idt91:amPm: AM
j_idt91:callDuration: 1
javax.faces.ViewState: 1385569115857674200:-7620499110560584746

*/

const gtlRequest = (page, url, headers, form_data) =>
    page.evaluate(
        async (headers, url, form_data) => {
            let formBody = [];
            for (var property in form_data) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(form_data[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            const formBodyStr = formBody.join("&");

            const response = await fetch(url, {
                headers,
                referrer:
                    "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: formBodyStr,
                method: "POST",
                mode: "cors",
                credentials: "include",
            });
            const text = await response.text();
            return text;
        },
        headers,
        url,
        form_data
    );

const login = async (page) => {
    const USERNAME = "xiwilan698@0pppp.com";
    const PW = "Ae9reoxee";

    const login_selectors = {
        login_link: 'a[id="cnForm:returnToLogin"]',
        email: "#user_email",
        password: "#user_password",
        submit: "#new_user button",
        skip_button: ".btn.btn-link.btn-lg",
        rates_fees: "//a[contains(., 'Rates and Fees')]",
    };

    await page.waitForSelector(login_selectors.login_link);
    await page.click(login_selectors.login_link);
    await page.waitForSelector(login_selectors.email);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.type(login_selectors.email, USERNAME);
    await page.type(login_selectors.password, PW);
    await page.click(login_selectors.submit);
    await page.waitForSelector(login_selectors.skip_button);
    await page.click(login_selectors.skip_button);
    await page.waitForXPath(login_selectors.rates_fees);
    const [elt] = await page.$x(login_selectors.rates_fees);
    await elt.click();
};

/*
javax.faces.partial.ajax: true
javax.faces.source: j_idt91:facilityState
javax.faces.partial.execute: j_idt91:facilityState
javax.faces.partial.render: j_idt91
javax.faces.behavior.event: valueChange
javax.faces.partial.event: change
j_idt91: j_idt91
j_idt91:service: AdvancePay
j_idt91:facilityState: FL
j_idt91:phoneNumber: (310) 333-3338
j_idt91:hour: 3
j_idt91:minute: 00
j_idt91:amPm: AM
j_idt91:callDuration: 1
javax.faces.ViewState: 7375367589559483721:113025909388038209
j_idt91:facility: 1010

*/

const createRequestBody = (
    postData,
    {
        service = "AdvancePay",
        facilityState = "FL",
        facility = "1010",
        phoneNumber = "(310) 333-3338",
        hour = "3",
        minute = "00",
        amPm = "AM",
        callDuration = "1",
    }
) => {
    const keys = Object.keys(postData);
    const prefix = keys.find((k) => k.includes("facilityState")).split(":")[0];

    const body = {
        ...postData,
        "javax.faces.source": `${prefix}:j_idt177`,
        "javax.faces.partial.execute": prefix,
    };

    const serviceK = keys.find((k) => k.includes("service"));
    const facilityStateK = keys.find((k) => k.includes("facilityState"));
    const facilityK = keys.find(
        (k) => k.includes("facility") && !k.includes("State")
    );
    const phoneNumberK = keys.find((k) => k.includes("phoneNumber"));
    const hourK = keys.find((k) => k.includes("hour"));
    const minuteK = keys.find((k) => k.includes("minute"));
    const amPmK = keys.find((k) => k.includes("amPm"));
    const callDurationK = keys.find((k) => k.includes("callDuration"));

    body[prefix + ":" + "service"] = service;
    body[prefix + ":" + "facilityState"] = facilityState;
    body[prefix + ":" + "facility"] = facility;
    body[prefix + ":" + "phoneNumber"] = phoneNumber;
    body[prefix + ":" + "hour"] = hour;
    body[prefix + ":" + "minute"] = minute;
    body[prefix + ":" + "amPm"] = amPm;
    body[prefix + ":" + "callDuration"] = callDuration;

    console.log("BODY", body);

    return body;
};

Apify.main(async () => {
    const requestList = await Apify.openRequestList("start-urls", [
        "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn",
    ]);

    const input: ScraperInput = await Apify.getInput();
    const output = {
        errors: [],
    };
    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        handlePageTimeoutSecs: 36000,
        launchContext: {
            useChrome: true,
            stealth: true,
        },

        handlePageFunction: async ({ page }) => {
            await login(page);
            const { headers, postData }: any = await getHeaders(page);

            console.log("HEADERS", headers);
            console.log("postData", postData);
            const result = await gtlRequest(
                page,
                "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn",
                {
                    ...headers,
                    "Content-Type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                },
                createRequestBody(postData, {
                    service: "AdvancePay",
                    facilityState: "FL",
                    facility: "1010",
                    phoneNumber: "(310) 333-3338",
                    hour: "3",
                    minute: "00",
                    amPm: "AM",
                    callDuration: "1",
                })
            );

            console.log("RESULT", result);

            await new Promise((resolve) => setTimeout(resolve, 2000000));
            // const states = Object.values(input.data);
            // const products: ICSProduct[] = await getProducts(page, headers);

            // for (let i = 0; i < states.length; i++) {
            //     try {
            //         const handler = new SingleStateHandler(
            //             states[i],
            //             input.uuid,
            //             page,
            //             headers,
            //             products
            //         );
            //         const results = await handler.run();
            //         output[states[i].stusab] = [...results];
            //         await Apify.setValue("OUTPUT", { ...output });
            //     } catch (err) {
            //         console.error(err);
            //         output.errors.push(err.toString());
            //         await Apify.setValue("OUTPUT", { ...output });
            //     }
            // }

            // await uploadFile(
            //     `etl/ics/${Date.now()}.json`,
            //     JSON.stringify(output)
            // );
        },
    });

    log.info("Starting the crawl.");
    await crawler.run();
    log.info("Crawl finished.");
});
