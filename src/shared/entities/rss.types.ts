export interface RssItem {
  title: string;
  creator?: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  guid: string;
  categories?: string[];
  isoDate: Date;
}

export interface RssSource {
  title: string;
  description: string;
  link: string;
  language: string;
  items: RssItem[];
}
