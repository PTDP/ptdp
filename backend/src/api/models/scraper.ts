import { Model } from 'objection'
import { Scraper as ScraperData } from '@ptdp/lib/types';
import { Tables } from '../../db/constants';

interface Scraper extends ScraperData {};

// https://dev.to/tylerlwsmith/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
class Scraper extends Model {
  id!: number

  static get tableName() {
    return Tables.scrapers;
  }
}

export default Scraper;