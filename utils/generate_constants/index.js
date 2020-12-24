const rimraf = require("rimraf");
const fs = require("fs");
const moment = require("moment");

const governorPhones = require("./governor_phones");
const stateFips = require("./state_fips");
const phoneAssignment = require("./phone_assignment");

const scraperInput = async () => {
  const result = {};
  const govPhones = await governorPhones();
  const sFips = await stateFips();
  const outStatePhones = phoneAssignment.outState(govPhones);

  Object.entries(govPhones).forEach(([state, govPhone]) => {
    result[state] = {
      state_fips: sFips[state],
      in_state_phone: govPhone,
      out_state_phone: outStatePhones[state],
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
