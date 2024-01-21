export type Item = {
  id: string;
  title: string;
}

export type Column = {
  id: string;
  title: string;
  items: Item[];
}