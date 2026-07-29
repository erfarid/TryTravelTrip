import dataModels from "./models";
import { connectToDB } from "./utilsDB";

async function updateOneDoc(modelName, filter, updateDataObj, options = {}) {
  await connectToDB();
  try {
    const result = await dataModels[modelName].updateOne(
      filter,
      updateDataObj,
      options,
    );
    return result;
  } catch (error) {
    throw error;
  }
}

async function updateManyDocs(modelName, filter, updateDataObj, options = {}) {
  await connectToDB();
  try {
    const result = await dataModels[modelName].updateMany(
      filter,
      updateDataObj,
      options,
    );
    return result;
  } catch (error) {
    throw error;
  }
}

export { updateOneDoc, updateManyDocs };
