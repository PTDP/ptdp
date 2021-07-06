// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

const Apify = require("apify");
const PendingXHR = require("./pendingXHR");
const axios = require("axios");

const env = {
  BASE_URL: "https://securustech.online",
};

const COMPANY = "securus";

const login = (page) => {};

const login_selectors = {
  email: 'input[formcontrolname="email"]',
  password: 'input[formcontrolname="password"]',
  submit: 'button[type="submit"]',
};

const home_page_selectors = {
  my_account: "scrs-my-account-page",
};

const rate_selectors = {
  states: 'select[formcontrolname="state"] option',
  states_dropdown: 'select[formcontrolname="state"]',
  sites: 'select[formcontrolname="siteId"] option',
  sites_dropdown: 'select[formcontrolname="siteId"]',
  services: 'select[formcontrolname="productType"] option',
  service_dropdown: 'select[formcontrolname="productType"]',
  phone: 'input[formcontrolname="phoneNumber"]',
  submit: 'button[name="submit"]',
};

const clearFocused = async (page) => {
  for (let j = 0; j < 200; j++) {
    await page.keyboard.press("Backspace");
  }
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sleepInRange = async (min, max) =>
  await new Promise((resolve) => setTimeout(resolve, getRandomInt(min, max)));

const falseyToNull = (obj) => {
  const transformed = { ...obj };
  Object.entries(transformed).forEach((k, v) => {
    if (typeof v !== "number" && !v) transformed[k] = null;
  });
  return transformed;
};

const process = async (page, input, output) => {
  await page.waitForTimeout(rate_selectors.states);
  const pendingXHR = new PendingXHR(page, () => {});
  await pendingXHR.waitForAllXhrFinished();
  await page.waitForFunction(
    (sel) => document.querySelectorAll(sel).length > 5,
    {},
    rate_selectors.states
  );

  const states_raw = await page.$$eval(rate_selectors.states, (nodes) => {
    return nodes
      .map((node) => ({
        value: node.value,
        label: node.innerText.trim(),
      }))
      .filter((s) => s.label !== "Select");
  });

  const states = Object.values(input.data)
    .map((s) => {
      const raw = states_raw.find((r_s) => r_s.value === s.stusab);
      return raw ? { ...s, ...raw } : null;
    })
    .filter(Boolean);

  for (const state of [states[0]]) {
    try {
      await processState(state, page, input, output);
    } catch (err) {
      console.error(err);
      output.errors.push({
        createdAt: Date.now(),
        state,
        scraper: input.uuid,
        error: err.toString(),
      });
    }
    await Apify.setValue("OUTPUT", output);
  }
};

const processState = async (state, page, input, output) => {
  const {
    data: { resultList },
  } = await axios.get(
    `https://securustech.online/ffws/api/sites/?state=${state.stusab}&acctType=ALL`
  );

  // Time for API response to propagate
  await new Promise((resolve) => setTimeout(resolve, 100));

  const facilities = resultList.map((r) => ({
    value: r.siteId,
    label: r.siteName,
  }));

  for (const facility of facilities) {
    try {
      const results = await processFacility(
        facility,
        state,
        page,
        input,
        output
      );
      output[state.stusab]
        ? output[state.stusab].push(...results)
        : (output[state.stusab] = [...results]);
      await Apify.setValue("OUTPUT", { ...output });
      await sleepInRange(500, 1500);
    } catch (err) {
      output.errors.push({
        createdAt: Date.now(),
        state,
        scraper: input.uuid,
        facility,
        error: err.toString(),
      });
    }
  }
};

const oncomplete = async (
  resp,
  results,
  { scraper, phone, service, facility, state }
) => {
  const isSuccessResp = resp && resp.result && resp.result.surCharge;
  const isFailureResp = resp && resp.errorMsg !== "Success";
  const duplicate = isSuccessResp && results.find((r) => r.number === phone);

  if (isXhr && isSuccessResp && !duplicate) {
    const {
      additionalAmount,
      feeName,
      initalAmount,
      quoteRule,
      ratePerMinute,
      surCharge,
      totalAmount,
    } = resp.result || {};

    results.push(
      falseyToNull({
        additionalAmount,
        feeName,
        initalAmount,
        quoteRule,
        ratePerMinute,
        surCharge,
        totalAmount,
        number: phone,
        service: service.label,
        createdAt: Date.now(),
        scraper,
        facility: facility.label,
        seconds: 60,
        company: COMPANY,
      })
    );
  } else if (isFailureResp) {
    results.push(
      falseyToNull({
        additionalAmount: null,
        feeName: null,
        initalAmount: null,
        quoteRule: null,
        ratePerMinute: null,
        surCharge: null,
        totalAmount: null,
        service: service.label,
        createdAt: Date.now(),
        scraper,
        facility: facility.label,
        seconds: 60,
        error: resp.errorMsg,
        company: COMPANY,
      })
    );
  }
};

const processFacility = async (facility, state, page, input, output) => {
  const results = [];

  await page.select(rate_selectors.sites_dropdown, facility.value);

  const ADVANCED_CONNECT_ENUM = 2;
  const services = [ADVANCED_CONNECT_ENUM];

  for (const service of services) {
    for (const phone of [state.in_state_phone, state.out_state_phone]) {
      const result = await axios.get(
        `https://securustech.online/ffws/api/sites/rate/${
          facility.value
        }?phoneNumber=${phone.slice(1)}&countryCode=1&serviceId=${service}`
      );

      console.log("result", result);

      /*
     { surCharge: '$0.000',
        initalAmount: '$0.050',
        additionalAmount: '$0.050',
        totalAmount: '$0.050',
        quoteRule: false,
        feeName: null,
        ratePerMinute: '$0.000' },
      */

      oncomplete(result, results, { scraper, phone, service, facility, state });
      results.push(result.data.result);
    }
  }

  console.log("results", results);
  return results;
};

Apify.main(async () => {
  const input = await Apify.getInput();
  const output = {
    errors: [],
  };

  const requestList = await Apify.openRequestList("securus", [
    `${env.BASE_URL}/#/rate-quote`,
  ]);

  const crawler = new Apify.PuppeteerCrawler({
    requestList,
    // proxyConfiguration,
    handlePageTimeoutSecs: 36000,
    launchPuppeteerOptions: {
      useChrome: true,
      stealth: true,
    },
    handlePageFunction: async ({ page, request, proxyInfo }) => {
      await process(page, input, output);
      await new Promise((resolve) => setTimeout(resolve, 50000));
    },
  });

  await crawler.run();

  console.log("Output:");
  console.dir(output);
  await Apify.setValue("OUTPUT", output);
});
