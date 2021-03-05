"use strict";
/**
 * This template is a production ready boilerplate for developing with `PuppeteerCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const pendingXHR_1 = require("./pendingXHR");
const util_1 = require("./util");
const Apify = require("apify");
const selectors = {
    agency_name_input: '[ng-model="asyncSelected"]',
    agency_name_dropdown: 'ul[class^="dropdown-menu"] li[id^="typeahead"]',
    rates: 'div[ng-show="rates"]',
    facilities_option: '[ng-model="selectedFacility"] option',
    facilities_dropdown: '[ng-model="selectedFacility"]',
    phone_input: 'input[name="phone"]',
    calculate_button: 'button[class*="btn-primary"]',
    final_cost: '[ng-show="rates"] table tr:last-child span[class="pull-right"]',
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
            }
            catch (err) {
                console.error(err.toString());
                err(err.toString());
            }
        }, 100);
    });
};
const { utils: { log }, } = Apify;
const icsRequest = (page, url, headers) => page.evaluate(async (headers, url) => {
    const response = await fetch(url, {
        headers,
        referrer: "https://icsonline.icsolutions.com/rates",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
    });
    const json = await response.json();
    return json;
}, headers, url);
const getHeaders = async (page) => {
    await page.waitForTimeout(selectors.agency_name_input);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.focus(selectors.agency_name_input);
    await page.type(selectors.agency_name_input, "Alabama".toLowerCase());
    selectAgency(page);
    return new Promise((res, err) => {
        new pendingXHR_1.default(page, (response) => {
            res(response._request._headers);
        }, "https://icsonline.icsolutions.com/public-api/facilities", true);
    });
};
const multiStateProducts = (products) => products.filter((p) => products.find((pr) => pr.agency_id === p.agency_id && pr.state_cd !== p.state_cd));
// get products associated w/ a particular state
class StateHandler {
    constructor(state, uid, page, headers, products) {
        this.state = state;
        this.uid = uid;
        this.page = page;
        this.headers = headers;
        this.products = products;
        this.products = this.stateProducts(this.singleStateProducts(products), state);
    }
    async getFaciliites(product) {
        const facilities = await icsRequest(this.page, `https://icsonline.icsolutions.com/public-api/products/${product.agency_id}/facilities`, this.headers);
        return facilities;
    }
    async getInStateRate(product, facility) {
        const in_state_rate = await icsRequest(this.page, `https://icsonline.icsolutions.com/public-api/products/${product.agency_id}/rates/${this.state.in_state_phone.slice(1)}?duration=900&site_id=${facility.site_id}`, this.headers);
        return in_state_rate;
    }
    async getOutStateRate(product, facility) {
        const out_state_rate = await icsRequest(this.page, `https://icsonline.icsolutions.com/public-api/products/${product.agency_id}/rates/${this.state.out_state_phone.slice(1)}?duration=900&site_id=${facility.site_id}`, this.headers);
        return out_state_rate;
    }
    rawRateToICSRate(rawRate, facility, product, number) {
        const { summary } = rawRate || {};
        return {
            tariffBand: summary === null || summary === void 0 ? void 0 : summary.tariffBand,
            initialDuration: summary === null || summary === void 0 ? void 0 : summary.initialDuration,
            initialCost: summary === null || summary === void 0 ? void 0 : summary.initialCost,
            overDuration: summary === null || summary === void 0 ? void 0 : summary.overDuration,
            overCost: summary === null || summary === void 0 ? void 0 : summary.overCost,
            tax: summary === null || summary === void 0 ? void 0 : summary.tax,
            finalCost: summary === null || summary === void 0 ? void 0 : summary.finalCost,
            number: number,
            createdAt: Date.now(),
            scraper: this.uid,
            agency: product.agency_id,
            agencyFullName: product.agency_nm,
            facility: facility.facility_nm,
            seconds: rawRate.duration,
        };
    }
    async run() {
        const rates = [];
        for (const product of this.products) {
            const facilities = await this.getFaciliites(product);
            for (const facility of facilities) {
                await util_1.sleepInRange(400, 700);
                const in_state_rate = await this.getInStateRate(product, facility);
                const in_state_ics = this.rawRateToICSRate(in_state_rate, facility, product, this.state.in_state_phone);
                const out_state_rate = await this.getOutStateRate(product, facility);
                const out_state_ics = this.rawRateToICSRate(out_state_rate, facility, product, this.state.out_state_phone);
                rates.push(in_state_ics, out_state_ics);
            }
        }
        return rates;
    }
    singleStateProducts(products) {
        const multistateP = multiStateProducts(products).map((p) => JSON.stringify(p));
        return products.filter((p) => !multistateP.find((elt) => elt === JSON.stringify(p)));
    }
    stateProducts(products, state) {
        return products.filter((p) => p.state_cd.toUpperCase() === state.stusab.toUpperCase());
    }
}
// get multi-state products
// class MultiStateHandler {
//     constructor(
//         private uid,
//         private page,
//         private headers,
//         private products: ICSProduct[]
//     ) {
//         this.products = multiStateProducts(products);
//     }
// }
Apify.main(async () => {
    const requestList = await Apify.openRequestList("start-urls", [
        "https://icsonline.icsolutions.com/rates",
    ]);
    const input = await Apify.getInput();
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
            const products = await icsRequest(page, "https://icsonline.icsolutions.com/public-api/products", headers);
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            for (let i = 0; i < 1; i++) {
                try {
                    const handler = new StateHandler(states[i], input.uuid, page, headers, products);
                    const results = await handler.run();
                    output[states[i].stusab] = [...results];
                    await Apify.setValue("OUTPUT", { ...output });
                }
                catch (err) {
                    output.errors.push(err.toString());
                }
            }
            // Apify.setValue("OUTPUT", multiStateProducts(products));
        },
    });
    log.info("Starting the crawl.");
    await crawler.run();
    log.info("Crawl finished.");
});
