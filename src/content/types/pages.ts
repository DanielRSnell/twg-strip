export interface PageButton {
  enable: boolean;
  label: string;
  link: string;
}

export interface Page {
  title: string;
  meta_title?: string;
  description?: string;
  button?: PageButton;
  image?: string;
  draft?: boolean;
}
