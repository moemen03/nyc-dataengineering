import Papa from 'papaparse';

export interface CollisionData {
  CRASH_DATE: string;
  CRASH_TIME: string;
  BOROUGH: string;
  ZIP_CODE: string;
  LATITUDE: number;
  LONGITUDE: number;
  LOCATION: string;
  ON_STREET_NAME: string;
  CROSS_STREET_NAME: string;
  NUMBER_OF_PERSONS_INJURED: number;
  NUMBER_OF_PERSONS_KILLED: number;
  NUMBER_OF_PEDESTRIANS_INJURED: number;
  NUMBER_OF_PEDESTRIANS_KILLED: number;
  NUMBER_OF_CYCLIST_INJURED: number;
  NUMBER_OF_CYCLIST_KILLED: number;
  NUMBER_OF_MOTORIST_INJURED: number;
  NUMBER_OF_MOTORIST_KILLED: number;
  CONTRIBUTING_FACTOR_VEHICLE_1: string;
  CONTRIBUTING_FACTOR_VEHICLE_2: string;
  COLLISION_ID: string;
  VEHICLE_TYPE_CODE_1: string;
  VEHICLE_TYPE_CODE_2: string;
  CRASH_DATETIME: string;
  YEAR: number;
  MONTH: number;
  DAY_OF_WEEK: number;
  HOUR: number;
  UNIQUE_ID: string;
  PERSON_ID: string;
  PERSON_TYPE: string;
  PERSON_INJURY: string;
  VEHICLE_ID: string;
  PERSON_AGE: number;
  EJECTION: string;
  EMOTIONAL_STATUS: string;
  BODILY_INJURY: string;
  POSITION_IN_VEHICLE: string;
  SAFETY_EQUIPMENT: string;
  PED_LOCATION: string;
  PED_ACTION: string;
  COMPLAINT: string;
  PED_ROLE: string;
  CONTRIBUTING_FACTOR_1: string;
  CONTRIBUTING_FACTOR_2: string;
  PERSON_SEX: string;
}

export const loadCollisionData = async (): Promise<CollisionData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse('/data/nyc_collisions_sample_30k.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          ...row,
          CRASH_DATE: row['CRASH DATE'],
          CRASH_TIME: row['CRASH TIME'],
          ZIP_CODE: row['ZIP CODE'],
          ON_STREET_NAME: row['ON STREET NAME'],
          CROSS_STREET_NAME: row['CROSS STREET NAME'],
          NUMBER_OF_PERSONS_INJURED: Number(row['NUMBER OF PERSONS INJURED']) || 0,
          NUMBER_OF_PERSONS_KILLED: Number(row['NUMBER OF PERSONS KILLED']) || 0,
          NUMBER_OF_PEDESTRIANS_INJURED: Number(row['NUMBER OF PEDESTRIANS INJURED']) || 0,
          NUMBER_OF_PEDESTRIANS_KILLED: Number(row['NUMBER OF PEDESTRIANS KILLED']) || 0,
          NUMBER_OF_CYCLIST_INJURED: Number(row['NUMBER OF CYCLIST INJURED']) || 0,
          NUMBER_OF_CYCLIST_KILLED: Number(row['NUMBER OF CYCLIST KILLED']) || 0,
          NUMBER_OF_MOTORIST_INJURED: Number(row['NUMBER OF MOTORIST INJURED']) || 0,
          NUMBER_OF_MOTORIST_KILLED: Number(row['NUMBER OF MOTORIST KILLED']) || 0,
          CONTRIBUTING_FACTOR_VEHICLE_1: row['CONTRIBUTING FACTOR VEHICLE 1'],
          CONTRIBUTING_FACTOR_VEHICLE_2: row['CONTRIBUTING FACTOR VEHICLE 2'],
          VEHICLE_TYPE_CODE_1: row['VEHICLE TYPE CODE 1'],
          VEHICLE_TYPE_CODE_2: row['VEHICLE TYPE CODE 2'],
          CRASH_DATETIME: row['CRASH_DATETIME'],
          LATITUDE: Number(row.LATITUDE),
          LONGITUDE: Number(row.LONGITUDE),
          YEAR: Number(row.YEAR),
          MONTH: Number(row.MONTH),
          DAY_OF_WEEK: Number(row.DAY_OF_WEEK),
          HOUR: Number(row.HOUR),
          PERSON_AGE: Number(row.PERSON_AGE),
        }));
        resolve(data as CollisionData[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
