import Apify from "apify";

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
    // proxyConfiguration,
    handlePageTimeoutSecs: 36000,
    handlePageFunction: async ({ page, request, proxyInfo }) => {
      console.log("hello");
      await Apify.setValue("OUTPUT", { hello: "there" });
    },
  });

  await crawler.run();
});
