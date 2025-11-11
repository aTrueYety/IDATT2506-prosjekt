import { Directory, File, Paths } from 'expo-file-system';
import type { ShoppingList } from "../types";

const listsDir = new Directory(Paths.document, 'lists');

// Ensure directory exists
async function ensureDirectory() {
  try {
    if (!listsDir.exists) {
      await listsDir.create();
      console.log("storage: created lists directory");
    }
  } catch (err) {
    console.error("storage: failed to create directory:", err);
    throw err;
  }
}

export async function saveList(list: ShoppingList) {
  await ensureDirectory();
  const file = new File(listsDir, `${list.id}.json`);
  try {
    await file.write(JSON.stringify(list));
    console.log("storage: wrote file", file.uri);
  } catch (err) {
    console.error("storage: write failed:", err);
    throw err;
  }
}

export async function loadAllLists(): Promise<ShoppingList[]> {
  await ensureDirectory();
  try {
    const items = await listsDir.list();
    const lists: ShoppingList[] = [];
    
    for (const item of items) {
      if (item instanceof File && item.uri.endsWith('.json')) {
        try {
          const content = await item.text();
          const parsed = JSON.parse(content) as ShoppingList;
          lists.push(parsed);
        } catch (err) {
          console.warn("storage: failed to parse file", item.uri, err);
        }
      }
    }
    
    console.log("storage: loadAllLists parsed ids=", lists.map(l => l.id));
    return lists;
  } catch (err) {
    console.error("storage: readDirectory/read failed:", err);
    return [];
  }
}

export async function deleteList(id: string) {
  await ensureDirectory();
  const file = new File(listsDir, `${id}.json`);
  try {
    await file.delete();
    console.log("storage: deleted file", file.uri);
  } catch (err) {
    console.warn("storage: delete failed for", file.uri, err);
    throw err;
  }
}

export default { saveList, loadAllLists, deleteList };
