// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

const Apify = require("apify");

const rateDetailSel = async (text, page) =>  {
    const handle = (await page.$x(`//table/tbody/tr[td//text()[contains(., "${text}")]]/td[last()]`)).find(Boolean);
    return handle ? await page.evaluate(el => el.innerText, handle) : '';
}

const falseyToNull = (obj) => {
  const transformed = { ...obj };
  Object.entries(transformed).forEach((k,v) => {
    if (typeof v !== 'number' && !v) transformed[k] = null;
  })
  return transformed;
}

const selectors = {
  agency_name_input: '[ng-model="asyncSelected"]',
  agency_name_dropdown: 'ul[class^="dropdown-menu"] li[id^="typeahead"]',
  rates: 'div[ng-show="rates"]',
  facilities_option: '[ng-model="selectedFacility"] option',
  facilities_dropdown: '[ng-model="selectedFacility"]',
  phone_input: 'input[name="phone"]',
  calculate_button: 'button[class*="btn-primary"]',
  final_cost: '[ng-show="rates"] table tr:last-child span[class="pull-right"]',
  rate: '[ng-show="rates"] table tr:last-child span[class="pull-right"]'
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
    } catch(err) {
      console.error(err.toString());
    }
  }, 100);
}

const processState = async (state, scraper, page) => {
  const results = [];
  await page.type(
    selectors.agency_name_input,
    state["state_name"].toLowerCase()
  );

  selectAgency(page);
  // If no results in 5 seconds, move onto next state
  await Promise.race[
    (page.waitFor(selectors.agency_name_dropdown),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        results.push({
          state,
          scraper,
          createdAt: Date.now(),
          error: "No facilities found",
        });
        resolve();
      }, 5000);
    }))
  ];

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

    // arbitrary number of backspaces to make sure empty
    for (let j = 0; j < 150; j++) {
      await page.keyboard.press("Backspace");
    }

    await page.type(selectors.agency_name_input, agency);
    await page.keyboard.press("Enter");
    await page.waitFor(selectors.rates);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // document.querySelector('[ng-model="selectedFacility"] option')
    const facilities = await page.$$eval(
      selectors.facilities_option,
      (nodes) => {
        return nodes.map((node) => node.value).filter(Boolean);
      }
    );

    for (let i = 0; i < facilities.length; i++) {
      const [instate, outstate] = await processFacility(facilities[i], agency, state, scraper, page);
      results.push(instate, outstate);
    }
  } catch(error) {
    console.error(error);
    results.push({
      number: state.in_state_phone,
      createdAt: Date.now(),
      scraper,
      facility,
      error: error.toString()
    })
  }

  return results;
}

const processFacility = async (facility, agency, state, scraper, page) => {
    const results = [];

    page.on('response', async response => {
      const isXhr = ['xhr','fetch'].includes(response.request().resourceType())
      // wait until we receive a response with canonical number set in to.
      // Then unpause, wait one second for changes to propagate, read. 
    });
    // actually, why not capture the first, and use it to get second
    for (const phone of [state.in_state_phone, state.out_state_phone]) {
      try {

        await page.focus(selectors.phone_input);

        // arbitrary number of backspaces to make sure empty
        for (let j = 0; j < 150; j++) {
          await page.keyboard.press("Backspace");
        }

        await page.keyboard.type(phone);
        await page.select(selectors.facilities_dropdown, facility);
        await page.waitForFunction(() => `!document.querySelector('i[ng-if="calculating"]')`);

        const previous = await page.evaluate(sel => document.querySelector(sel).innerText, selectors.rate);

        if (!previous) {
          await page.waitFor(selectors.calculate_button);
          await page.click(selectors.calculate_button);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const date = await rateDetailSel('Date', page);
        const callType = await rateDetailSel('Call Type', page);
        const [firstPeriodTime, firstPeriodCost] = (await rateDetailSel('First Period', page)).split('\n');
        const [subsequentPeriodTime, subsequentPeriodCost] = (await rateDetailSel('Subsequent Periods', page)).split('\n');
        const tax = await rateDetailSel('Tax', page);
        const finalCost = await rateDetailSel('Final Cost', page);

        results.push(falseyToNull({
          number: state.in_state_phone,
          createdAt: Date.now(),
          date,
          callType,
          firstPeriodTime,
          firstPeriodCost,
          subsequentPeriodTime,
          subsequentPeriodCost,
          tax,
          finalCost,
          scraper,
          facility,
          agency
        }))
      } catch(error) {
        console.error(error);
        results.push({
          number: state.in_state_phone,
          createdAt: Date.now(),
          scraper,
          facility,
          agency,
          error: error.toString()
        })
      }
    }
    return results;
}

Apify.main(async () => {
  const requestList = await Apify.openRequestList("ics", [
    "https://icsonline.icsolutions.com/rates",
  ]);

  // "my-list", ["http://proxy.apify.com/?format=json"],

  // const proxyConfiguration = await Apify.createProxyConfiguration();

  const input = await Apify.getInput();
  const output = {};

  const crawler = new Apify.PuppeteerCrawler({
    requestList,
    // proxyConfiguration,
    handlePageFunction: async ({ page, request, proxyInfo }) => {
      console.log(await page.content());
    
      const states = [input.input.data["AZ"]];
      await page.waitFor(selectors.agency_name_input);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      for (let i = 0; i < states.length; i++) {
        const results = await processState(states[i], input.input.uuid, page);
        output[states[i].stusab] = [...results];
      }
    }
  });

  await crawler.run();
  await Apify.setValue("OUTPUT", output);
});
