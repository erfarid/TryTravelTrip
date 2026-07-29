import dataModels from "./models";
import { capitalize } from "../utils";
import { connectToDB } from "./utilsDB";

export async function deleteOneDoc(modelName, filter, options = {}) {
  await connectToDB();
  try {
    return await dataModels[modelName].deleteOne(filter, options);
  } catch (error) {
    throw error;
  }
}

export async function deleteManyDocs(modelName, filter = {}, options = {}) {
  await connectToDB();
  modelName = capitalize(modelName.trim());
  try {
    return await dataModels[modelName].bulkWrite(
      [
        {
          deleteMany: {
            filter: filter,
          },
        },
      ],
      options,
    );
  } catch (error) {
    throw error;
  }
}
