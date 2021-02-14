export interface Facility {
  name: string;
  latitude: number;
  longitude: number;
  agencyByAgencyId: {
    name: string;
  };
}
