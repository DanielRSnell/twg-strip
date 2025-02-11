export interface SectionButton {
  enable: boolean;
  label: string;
  link: string;
}

export interface SectionHeader {
  title: string;
  content: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Section {
  enable?: boolean;
  title: string;
  description?: string;
  image?: string;
  button?: SectionButton;
  header?: SectionHeader;
  content?: string;
  faqs?: FAQ[];
}
