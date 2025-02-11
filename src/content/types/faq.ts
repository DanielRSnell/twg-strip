export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQHeader {
  title: string;
  content: string;
}

export interface FAQContent {
  header: FAQHeader;
  title: string;
  content: string;
  faqs: FAQ[];
}
