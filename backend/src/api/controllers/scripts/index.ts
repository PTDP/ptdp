import Rate from "../../../api/models/rate";
import CanonicalRate from "../../../api/models/canonical_rate";
import Scraper from "../../../api/models/scraper";

import Faciility from "../../../api/models/facility";
import State from "../../../api/models/state";

export const canonical_rate_updates_20210215094529 = async () => {
  const canonicalRates = await CanonicalRate.query();

  for (let i = 0; i < canonicalRates.length; i++) {
    const cr = canonicalRates[i];
    try {
      console.log(`Updating ${i}/${canonicalRates.length}`);
      const rate = await Rate.query().findOne("canonical_rate_id", "=", cr.id);
      const s = await Scraper.query().findOne("id", "=", rate.scraper_id);
      const facility = await Faciility.query().findOne(
        "id",
        "=",
        cr.facility_id
      );

      const state = await State.query().findOne("id", "=", facility.state_id);
      const { in_state_phone } = (s.input as any).data[state.stusab];

      await cr.$query().patch({
        in_state: cr.phone_number === in_state_phone ? true : false,
        scraper_id: s.id,
      });
    } catch (err) {
      console.error(`Failed for ${i}, ${err.toString()}`);
    }
  }
};
