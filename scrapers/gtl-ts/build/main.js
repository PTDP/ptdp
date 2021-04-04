"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const pendingXHR_1 = __importDefault(require("./pendingXHR"));
const util_1 = require("./util");
const gtlRequester_1 = require("./gtlRequester");
const { GOOGLE_APPLICATION_CREDENTIALS_BASE64, CLOUD_STORAGE_BUCKET, } = process.env;
const Apify = require("apify");
const { utils: { log }, } = Apify;
class SingleStateHandler {
    constructor(state, uid, page, metaData) {
        this.state = state;
        this.uid = uid;
        this.page = page;
        this.metaData = metaData;
    }
    async getFacilities() {
        //
        return [
            {
                name: "Baldwin County AL-Corrections Center",
                id: "1028",
                subFacilities: [],
            },
            {
                name: "Federal Bureau of Prisons AL-Aliceville FCC",
                id: "536",
                subFacilities: [
                    {
                        name: "FBOP_AL-Aliceville FCC",
                        id: "7472",
                    },
                    // {
                    //     name: "FBOP_IL-AUSP Thomson",
                    //     id: "7491",
                    // },
                    // {
                    //     name: "FBOP_NH-Berlin FCI",
                    //     id: "7473",
                    // },
                    // {
                    //     name: "Grant County WA-County Jail (old)",
                    //     id: "7446",
                    // },
                    // {
                    //     name: "Thurston County WA-Juvenile Facility",
                    //     id: "7434",
                    // },
                    // {
                    //     name: "USN_VA-USN Chesapeake NAVCONBRIG",
                    //     id: "7463",
                    // },
                    // {
                    //     name: "Yakima WA-City Jail",
                    //     id: "7427",
                    // },
                ],
            },
            {
                name: "Federal Bureau of Prisons AL-Montgomery FPC",
                id: "721",
                subFacilities: [],
            },
        ];
    }
    async getInStateRates(requester, services) {
        const rates = [];
        requester.updateNumber(this.state.in_state_phone);
        for (const service of services) {
            await requester.updateService(service);
            const result = await requester.submit();
            rates.push(result);
        }
        return rates;
    }
    async getOutStateRates(requester, services) {
        const rates = [];
        requester.updateNumber(this.state.out_state_phone);
        for (const service of services) {
            await requester.updateService(service);
            const result = await requester.submit();
            rates.push(result);
        }
        return rates;
    }
    async selectState() {
        // this.selectState
    }
    async run() {
        const rates = [];
        // seelct current state
        // const facilities = await this.getFacilities();
        const services = ["AdvancePay", "Collect"];
        const r = new gtlRequester_1.GTLRequester(this.metaData, {
            service: services[0],
            facilityState: this.state.stusab,
            facility: null,
            phoneNumber: this.state.in_state_phone,
        }, this.page, this.uid);
        const facilities = await r.updateState();
        // for each facility
        for (const f of facilities) {
            const subFacilities = await r.updateFacility(f.id, f.name);
            // we could set sub facilities here
            if (subFacilities.length) {
                for (const sf of subFacilities) {
                    await r.updateSubFacility(sf.id, sf.name);
                    const in_state = await this.getInStateRates(r, services);
                    const out_state = await this.getOutStateRates(r, services);
                    rates.push(...in_state, ...out_state);
                    await util_1.sleepInRange(400, 700);
                }
            }
            else {
                const in_state = await this.getInStateRates(r, services);
                const out_state = await this.getOutStateRates(r, services);
                rates.push(...in_state, ...out_state);
            }
            await util_1.sleepInRange(400, 700);
        }
        // await new Promise((resolve) => setTimeout(resolve, 10000000));
        return rates;
    }
}
async function uploadFile(destination, content) {
    let credentials = JSON.parse(Buffer.from(GOOGLE_APPLICATION_CREDENTIALS_BASE64, "base64").toString("ascii"));
    const storage = new storage_1.Storage({
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
const splitPostData = (postData) => {
    const postDataKv = {};
    if (!postData)
        return;
    postData.split("&").forEach((d) => {
        if (!d)
            return;
        const split = d.split("=");
        if (!Array.isArray(split))
            return;
        postDataKv[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
    });
    return postDataKv;
};
const getMetaData = async (page) => {
    await page.waitForSelector(selectors.state);
    await page.select(selectors.state, "AL");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await page.waitForXPath(selectors.submit);
    const [elt] = await page.$x(selectors.submit);
    const ps = new Promise((res, err) => {
        new pendingXHR_1.default(page, (response) => {
            const splitData = splitPostData(response._request._postData);
            const source = splitData["javax.faces.source"];
            const viewState = splitData["javax.faces.ViewState"];
            res({
                headers: response._request._headers,
                prefix1: source.split(":")[0],
                prefix2: source.split(":")[1],
                viewState,
            });
        }, "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn", true, "phoneNumber", "javax.faces.partial.event");
    });
    await elt.click();
    return ps;
};
const login = async (page) => {
    const USERNAME = "***REMOVED***";
    const PW = "***REMOVED***";
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
Apify.main(async () => {
    const requestList = await Apify.openRequestList("start-urls", [
        "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn",
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
            await login(page);
            const { headers, viewState, prefix1, prefix2, } = await getMetaData(page);
            const states = Object.values(input.data);
            for (let i = 0; i < 1; i++) {
                try {
                    const handler = new SingleStateHandler(states[i], input.uuid, page, {
                        headers,
                        viewState,
                        prefix1,
                        prefix2,
                    });
                    const results = await handler.run();
                    output[states[i].stusab] = [...results];
                    await Apify.setValue("OUTPUT", { ...output });
                }
                catch (err) {
                    console.error(err);
                    output.errors.push(err.toString());
                    await Apify.setValue("OUTPUT", { ...output });
                }
            }
            // await uploadFile(
            //     `etl/gtl/${Date.now()}.json`,
            //     JSON.stringify(output)
            // );
        },
    });
    log.info("Starting the crawl.");
    await crawler.run();
    log.info("Crawl finished.");
});
