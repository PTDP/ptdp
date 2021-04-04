import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';

export const fullConfig = resolveConfig(tailwindConfig);

enum ENVS {
  PROD,
  STAGING,
  DEV,
}

export const ENV = process.env.NODE_ENV === 'production' ? ENVS.PROD : ENVS.DEV;

export const API = {
  [ENVS.DEV]: 'http://localhost:5000/ptdp-staging/us-central1/api',
  [ENVS.PROD]: 'http://localhost:5000/ptdp-staging/us-central1/api',
}[ENV];
