import { get } from "http";
import {
    getProjectPageId,
    getPageBlockChildren,
    getCrucialIds
} from "./notion";
import { BlockObjectResponse, ToggleBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const exampleWebhookBody = {
  "attempt_number": 1,
  "authors": [
    {
      "id": "5ff924f1-7658-4f1c-b585-d1daa56b2927",
      "type": "person"
    }
  ],
  "data": {
    "parent": {
      "id": "21c1e783-2a2f-80d9-946c-c243585c9269",
      "type": "database"
    }
  },
  "updated_properties": ["jtOi"],
  "entity": {
    "id": "21d1e783-2a2f-8093-b66d-c528e8bf5ea4",
    "type": "page"
  },
  "id": "adad8f6b-72a9-440d-a5fb-657f715c3fb3",
  "integration_id": "21cd872b-594c-807b-8c4d-0037f0221395",
  "subscription_id": "21dd872b-594c-8142-855a-00990f6f0ffc",
  "timestamp": "2025-06-25T02:31:16.654Z",
  "type": "page.properties_updated",
  "workspace_id": "10b6d209-81f6-455d-94c5-1d14134df129",
  "workspace_name": "Hack / Build"
};

(async () => {
  try {
    // Check that the database ID matches the coordinator DB 
    const parentId = exampleWebhookBody.data.parent.id;
    if (parentId !== process.env.COORDINATOR_DB_ID) {
        console.log("Parent ID does not match the coordinator DB ID. Exiting.");
        return;
    }        

    // Get the ID for the video project page
    const projectPageId = await getProjectPageId(exampleWebhookBody.entity.id);
    console.log("Project Page ID:", projectPageId);

    // Retrieve crucial IDs
    const { scriptBlockId, storyboardDbId } = await getCrucialIds(projectPageId);
    console.log("Script Block ID:", scriptBlockId);
    console.log("Storyboard Database ID:", storyboardDbId);
  } catch (error) {
    console.error("Error:", error);
  }
})().catch(console.error);