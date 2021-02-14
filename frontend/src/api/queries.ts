import { useQuery, gql } from '@apollo/client';

export const FACILITIES_QUERY = gql`
  {
    allFacilities {
      nodes {
        name
        latitude
        longitude
        agencyByAgencyId {
          name
        }
        canonicalRatesByFacilityId {
          nodes {
            companyByCompanyId {
              name
            }
            ratesByCanonicalRateId(orderBy: UPDATED_AT_DESC) {
              nodes {
                initialAmount
                additionalAmount
                updatedAt
                seenAt
              }
            }
          }
        }
      }
    }
  }
`;
