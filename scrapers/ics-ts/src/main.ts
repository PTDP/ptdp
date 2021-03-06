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
const selectors = {
    agency_name_input: '[ng-model="asyncSelected"]',
    agency_name_dropdown: 'ul[class^="dropdown-menu"] li[id^="typeahead"]',
    rates: 'div[ng-show="rates"]',
    facilities_option: '[ng-model="selectedFacility"] option',
    facilities_dropdown: '[ng-model="selectedFacility"]',
    phone_input: 'input[name="phone"]',
    calculate_button: 'button[class*="btn-primary"]',
    final_cost:
        '[ng-show="rates"] table tr:last-child span[class="pull-right"]',
    rate: '[ng-show="rates"] table tr:last-child span[class="pull-right"]',
};

const selectAgency = async (page) => {
    await new Promise((res, err) => {
        let agencySelectInterval = setInterval(async () => {
            try {
                const agencyName = await page.evaluate((sel) => {
                    return document.querySelector(sel);
                }, selectors.agency_name_dropdown);

                if (agencyName) {
                    clearInterval(agencySelectInterval);
                    await page.click(selectors.agency_name_dropdown);
                    res(agencyName);
                }

                if (!agencyName) {
                    // Retype and backspace to trigger results
                    await page.focus(selectors.agency_name_input);
                    await page.type(" ");
                    await page.keyboard.press("Backspace");
                }
            } catch (err) {
                console.error(err.toString());
                err(err.toString());
            }
        }, 100);
    });
};

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

const getHeaders = async (page) => {
    await page.waitForTimeout(selectors.agency_name_input);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.focus(selectors.agency_name_input);
    await page.type(selectors.agency_name_input, "Alabama".toLowerCase());
    selectAgency(page);

    return new Promise((res, err) => {
        new PendingXHR(
            page,
            (response) => {
                res(response._request._headers);
            },
            BASE_URL + "/public-api/facilities",
            true
        );
    });
};

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

Apify.main(async () => {
    const requestList = await Apify.openRequestList("start-urls", [
        "https://icsonline.icsolutions.com/rates",
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
            const headers = await getHeaders(page);
            const states = Object.values(input.data);
            const products: ICSProduct[] = await getProducts(page, headers);

            for (let i = 0; i < states.length; i++) {
                try {
                    const handler = new SingleStateHandler(
                        states[i],
                        input.uuid,
                        page,
                        headers,
                        products
                    );
                    const results = await handler.run();
                    output[states[i].stusab] = [...results];
                    await Apify.setValue("OUTPUT", { ...output });
                } catch (err) {
                    console.error(err);
                    output.errors.push(err.toString());
                    await Apify.setValue("OUTPUT", { ...output });
                }
            }

            await uploadFile(
                `etl/ics/${Date.now()}.json`,
                JSON.stringify(output)
            );
        },
    });

    log.info("Starting the crawl.");
    await crawler.run();
    log.info("Crawl finished.");
});
