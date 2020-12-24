const rimraf = require("rimraf");
const fs = require("fs");
const moment = require("moment");
const states = require("us-state-codes");
const { v4: uuidv4 } = require('uuid');

const governorPhones = require("./governor_phones");
const stateIdentifiers = require("./state_identifiers");
const phoneAssignment = require("./phone_assignment");

const scraperInput = async () => {
  const result = {
      uuid: uuidv4(),
      createdAt: Date.now(),
      data: {}
  };

  const govPhones = await governorPhones();
  const stateIdent = await stateIdentifiers();
  const outStatePhones = phoneAssignment.outState(govPhones);

  Object.entries(govPhones).forEach(([state, govPhone]) => {
    result.data[state] = {
      in_state_phone: govPhone,
      out_state_phone: outStatePhones[state],
      ...stateIdent[state]
    };
  });

  return result;
};

const logger = (err) => {
  fs.appendFileSync(
    "./error.log",
    moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a") +
      " " +
      err.toString() +
      "\n"
  );
  console.error(err.toString());
};

const main = async () => {
  try {
    rimraf.sync("./constants");
    fs.mkdirSync("./constants");

    fs.writeFileSync(
      "./constants/scraper_input.json",
      JSON.stringify(await scraperInput())
    );
  } catch (err) {
    logger(err);
  }
};

main();
