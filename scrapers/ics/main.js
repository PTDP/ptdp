// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

const Apify = require('apify');

Apify.main(async () => {

    const requestList = await Apify.openRequestList(
        "ics", ["https://icsonline.icsolutions.com/rates"]
    );

            // "my-list", ["http://proxy.apify.com/?format=json"],

    // const proxyConfiguration = await Apify.createProxyConfiguration();

    const input = await Apify.getInput();
    // console.log('Input:');
    console.log(input.input.data);
    const output = {};

    const selectors = {
        agency_name_input: '[ng-model="asyncSelected"]',
        agency_name_dropdown: 'ul[class^="dropdown-menu"] li[id^="typeahead"]',
        rates: 'div[ng-show="rates"]',
        facilities_dropdown: '[ng-model="selectedFacility"] option',
        phone_input: 'input[name="phone"]',
        calculate_button: 'button[class*="btn-primary"]'
    }

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        // proxyConfiguration,
        handlePageFunction: async ({ page, request, proxyInfo }) => {
            console.log(await page.content());
            const states = [input.input.data['AL']];
            await page.waitFor(selectors.agency_name_input);
            await new Promise(resolve => setTimeout(resolve, 1000));

            const processEntry = async (state) => {
                await page.type(selectors.agency_name_input, state['state_name'].toLowerCase());
                // If no results in 5 seconds, move onto next state
                await Promise.race[page.waitFor(selectors.agency_name_dropdown), 
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        output['stusab'] = {
                            rates: [],
                            scraper_version: input.input.uuid,
                            createdAt: Date.now(),
                            error: 'No facilities found'
                        }
                        resolve();
                    }, 5000)
                })]

                const state_agencies = await page.$$eval(selectors.agency_name_dropdown, nodes => {
                    return nodes.map(node => node.innerText);
                });

                for (let i = 0; i < state_agencies.length; i++) {

                    await page.focus(selectors.agency_name_input);
                    for (let j = 0; j < 200; j++) {
                        await page.keyboard.press('Backspace');
                    }

                    await page.type(selectors.agency_name_input, state_agencies[i]);
                    await page.keyboard.press('Enter');
                    await page.waitFor(selectors.rates);


                    // document.querySelector('[ng-model="selectedFacility"] option')
                    const facilities = await page.$$eval(selectors.facilities_dropdown, nodes => {
                        return nodes.map(node => node.label);
                    });

                    for (let i = 0; i < facilities.length; i++) {
                        await page.focus(selectors.phone_input);
                        for (let j = 0; j < 20; j++) {
                            await page.keyboard.press('Backspace');
                        }
                        await page.keyboard.type(state.in_state_phone);
                        await page.waitFor(selectors.calculate_button);
                        await page.click(selectors.calculate_button);
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }

                }
                
                await new Promise(resolve => setTimeout(resolve, 5000000));
        }

            for (let i = 0; i < states.length; i++) {
                await processEntry(states[i]);
            }
            // for each state in data
                // type lower case state full name
                // store each result in a temporary array
                    // type each result
                        // get all facility names in temporary array
                            // iterate through these
                                // set Phone Number to in_state
                                // push rate
                                // set Phone Number to out_state
                                // push rate
        }
    });

    await crawler.run();
    await Apify.setValue('OUTPUT', output);
});
