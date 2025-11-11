export interface ListItem {
  id: string;
  text: string;
  bought: boolean;
  createdAt: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ListItem[];
}
