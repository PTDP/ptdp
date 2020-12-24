// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

const Apify = require('apify');

Apify.main(async () => {

    // const requestList = await Apify.openRequestList(
    //     "my-list", ["http://proxy.apify.com/?format=json"]
    // );

    // const proxyConfiguration = await Apify.createProxyConfiguration();

    const input = await Apify.getInput();
    console.log('Input:');
    console.log(input);
    const output = [];

    // const crawler = new Apify.PuppeteerCrawler({
    //     requestList,
    //     proxyConfiguration,
    //     handlePageFunction: async ({ page, request, proxyInfo }) => {
    //         console.log(await page.content())

    //         output.push({
                
    //         });
    //     }
    // });

    // await crawler.run();
    await Apify.setValue('OUTPUT', output);
});
