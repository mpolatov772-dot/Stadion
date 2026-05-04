import { getCollection, insertOne, updateOne } from './baseModel.js';

const collectionName = 'reports';

export const listReports = async () => getCollection(collectionName);

export const findReportByOwner = async (ownerId) => {
  const reports = await getCollection(collectionName);
  return reports.find((report) => report.ownerId === ownerId) || null;
};

export const upsertOwnerReport = async (report) => {
  const existing = await findReportByOwner(report.ownerId);

  if (!existing) {
    return insertOne(collectionName, report);
  }

  return updateOne(collectionName, existing._id, report);
};
