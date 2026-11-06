export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author: string;
};

export type ReviewSummary = {
  count: number;
  average: number;
  items: Review[];
};