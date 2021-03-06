"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apify_1 = require("apify");
apify_1.default.main(async () => {
    const requestList = await apify_1.default.openRequestList("start-urls", [
        "https://icsonline.icsolutions.com/rates",
    ]);
    const input = await apify_1.default.getInput();
    const output = {
        errors: [],
    };
    const crawler = new apify_1.default.PuppeteerCrawler({
        requestList,
        // proxyConfiguration,
        handlePageTimeoutSecs: 36000,
        handlePageFunction: async ({ page, request, proxyInfo }) => {
            console.log("hello");
            await apify_1.default.setValue("OUTPUT", { hello: "there" });
        },
    });
    await crawler.run();
});
