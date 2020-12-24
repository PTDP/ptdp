const axios = require("axios");
const csv = require("csv/lib/sync");

module.exports = async () => {
  const t = {};
  const result = await axios.get(
    `https://www2.census.gov/geo/docs/reference/state.txt`
  );

  if (result) {
    csv
      .parse(result.data, {
        delimiter: "|",
      })
      .forEach((e, i) => {
        if (i === 0) return;

        const [STATE, STUSAB] = e;
        t[STUSAB] = STATE;
      });
  }

  return t;
};
