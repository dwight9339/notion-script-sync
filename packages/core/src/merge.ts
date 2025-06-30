import { getStoryboardDbId } from "./helpers";
import { queryDatabase, updatePage } from "./notion";
import * as fs from "fs";
import * as csvParse from "csv-parse/sync";
import { QueryDatabaseResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

interface CsvRow {
  [key: string]: string;
}

export async function mergeCsvToStoryboard(projectPageId: string, csvPath: string) {
  // 1. Parse CSV
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records: CsvRow[] = csvParse.parse(csvContent, { columns: true });
  const csvMap = new Map<string, CsvRow>();
  for (const row of records) {
    if (row["Beat ID"]) {
      csvMap.set(row["Beat ID"], row);
    }
  }

  // 2. Fetch all storyboard rows
  const storyboardDbId = await getStoryboardDbId(projectPageId);
  let hasMore = true;
  let startCursor: string | undefined = undefined;
  while (hasMore) {
    const resp = (await queryDatabase(
      storyboardDbId,
      [{ property: "Beat ID", direction: "ascending" }],
      100,
      startCursor
    )) as QueryDatabaseResponse;
    for (const page of resp.results.filter((r): r is PageObjectResponse => r.object === "page")) {
      const props = page.properties as any;
      const beatId = props["Beat ID"]?.title?.map((t: any) => t.plain_text).join("") ?? "";
      if (csvMap.has(beatId)) {
        const csvRow = csvMap.get(beatId)!;
        // Update Notion row with CSV data (customize as needed)
        await updatePage(page.id, {
          ...(csvRow["Visual Description"] && {
            "Visual Description": {
              rich_text: [{ text: { content: csvRow["Visual Description"] } }]
            }
          })
        });
      }
    }
    hasMore = resp.has_more;
    startCursor = resp.next_cursor ?? undefined;
  }
}
