const Apify = require("apify");
const PendingXHR = require("./pendingXHR.js");

const rateDetailSel = async (text, page) => {
  const handle = (
    await page.$x(
      `//table/tbody/tr[td//text()[contains(., "${text}")]]/td[last()]`
    )
  ).find(Boolean);
  return handle ? await page.evaluate((el) => el.innerText, handle) : "";
};

const falseyToNull = (obj) => {
  const transformed = { ...obj };
  Object.entries(transformed).forEach((k, v) => {
    if (typeof v !== "number" && !v) transformed[k] = null;
  });
  return transformed;
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sleepInRange = async (min, max) =>
  await new Promise((resolve) => setTimeout(resolve, getRandomInt(min, max)));

const clearFocused = async (page) => {
  for (let j = 0; j < 200; j++) {
    await page.keyboard.press("Backspace");
  }
};

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

const selectAgency = (page) => {
  agencySelectInterval = setInterval(async () => {
    try {
      const agencyName = await page.evaluate((sel) => {
        return document.querySelector(sel);
      }, selectors.agency_name_dropdown.valueOf());

      if (agencyName) {
        clearInterval(agencySelectInterval);
      }

      if (!agencyName) {
        // Retype and backspace to trigger results
        await page.focus(selectors.agency_name_input);
        await page.type(" ");
        await page.keyboard.press("Backspace");
      }
    } catch (err) {
      console.error(err.toString());
    }
  }, 100);
};

const processState = async (state, scraper, page) => {
  const results = [];

  await page.focus(selectors.agency_name_input);

  await clearFocused(page);

  await page.type(
    selectors.agency_name_input,
    state["state_name"].toLowerCase()
  );

  selectAgency(page);
  let noAgenciesTimeout;

  // If no results in 5 seconds, move onto next state
  await Promise.race[
    (page.waitFor(selectors.agency_name_dropdown),
    new Promise((resolve, reject) => {
      noAgenciesTimeout = setTimeout(() => {
        output.errors.push({
          state,
          scraper,
          createdAt: Date.now(),
          error: "No facilities found",
        });
        resolve();
      }, 10000);
    }))
  ];

  clearTimeout(noAgenciesTimeout);

  const state_agencies = await page.$$eval(
    selectors.agency_name_dropdown,
    (nodes) => {
      return nodes.map((node) => node.innerText);
    }
  );

  for (let i = 0; i < state_agencies.length; i++) {
    const r = await processAgency(state_agencies[i], state, scraper, page);
    results.push(...r);
  }
  return results;
};

const processAgency = async (agency, state, scraper, page) => {
  const results = [];

  try {
    await page.focus(selectors.agency_name_input);

    await clearFocused(page);

    await page.type(selectors.agency_name_input, agency);
    await page.keyboard.press("Enter");
    await page.waitFor(selectors.rates);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // document.querySelector('[ng-model="selectedFacility"] option')
    const facilities = await page.$$eval(
      selectors.facilities_option,
      (nodes) => {
        return nodes
          .map((node) => ({ value: node.value, label: node.label }))
          .filter(Boolean);
      }
    );

    for (let i = 0; i < facilities.length; i++) {
      const [instate, outstate] = await processFacility(
        facilities[i],
        agency,
        state,
        scraper,
        page
      );
      results.push(instate, outstate);
    }
  } catch (error) {
    console.error(error);
    output.errors.push({
      createdAt: Date.now(),
      scraper,
      agency,
      error: error.toString(),
    });
  }

  return results;
};

const processFacility = async (facility, agency, state, scraper, page) => {
  const results = [];

  const oncomplete = async (response) => {
    const isXhr = ["xhr", "fetch"].includes(response.request().resourceType());
    const resp = await response.json();
    const isSuccessResp = resp && resp.to && resp.to.canonicalNumber;
    const isFailureResp = resp && resp.result === "Data not available";
    const duplicate =
      isSuccessResp &&
      results.find((r) => r.number === resp.to.canonicalNumber);

    if (isXhr && isSuccessResp && !duplicate) {
      const {
        tariffBand,
        initialDuration,
        initialCost,
        overDuration,
        overCost,
        tax,
        finalCost,
      } = resp.summary || {};

      results.push(
        falseyToNull({
          tariffBand,
          initialDuration,
          initialCost,
          overDuration,
          overCost,
          tax,
          finalCost,
          number: resp.to.canonicalNumber,
          createdAt: Date.now(),
          scraper,
          facility: facility.label,
          agency,
          seconds: 15 * 60,
        })
      );
    } else if (isFailureResp) {
      results.push(
        falseyToNull({
          tariffBand: null,
          initialDuration: null,
          initialCost: null,
          overDuration: null,
          overCost: null,
          tax: null,
          finalCost: null,
          number: null,
          createdAt: Date.now(),
          scraper,
          facility: facility.label,
          agency,
          seconds: 15 * 60,
          error: resp.result,
        })
      );
    }
  };

  const pendingXHR = new PendingXHR(page, oncomplete);

  // actually, why not capture the first, and use it to get second
  for (const phone of [state.in_state_phone, state.out_state_phone]) {
    try {
      await page.focus(selectors.phone_input);

      // arbitrary number of backspaces to make sure empty
      await clearFocused(page);

      await page.keyboard.type(phone.slice(1));
      await page.select(selectors.facilities_dropdown, facility.value);

      const previous = await page.evaluate(
        (sel) => document.querySelector(sel).innerText,
        selectors.rate
      );

      await sleepInRange(500, 1500);
      await page.waitFor(selectors.calculate_button);
      await page.click(selectors.calculate_button);

      await page.waitForFunction(
        () => `!document.querySelector('i[ng-if="calculating"]')`
      );
    } catch (error) {
      console.error(error);
      output.errors.push({
        number: phone,
        createdAt: Date.now(),
        scraper,
        facility: facility.label,
        agency,
        error: error.toString(),
      });
    }
  }

  await pendingXHR.waitForAllXhrFinished();
  return results;
};

Apify.main(async () => {
  const requestList = await Apify.openRequestList("ics", [
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
      const states = [input.data["AL"], input.data["AZ"]];
      await page.waitFor(selectors.agency_name_input);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      for (let i = 0; i < states.length; i++) {
        const results = await processState(states[i], input.uuid, page);
        output[states[i].stusab] = [...results];
        await Apify.setValue("OUTPUT", { ...output });
      }
    },
  });

  await crawler.run();
});
