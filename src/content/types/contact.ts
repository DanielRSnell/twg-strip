export interface Office {
  title: string;
  address: string;
  email: string;
  phone: string;
}

export interface ContactForm {
  title: string;
  description: string;
  options: string[];
}

export interface ContactSupport {
  title: string;
  description: string;
  email: string;
  phone: string;
}

export interface ContactSales {
  title: string;
  description: string;
  email: string;
  phone: string;
}

export interface DemoButton {
  text: string;
  link: string;
}

export interface ContactDemo {
  title: string;
  description: string;
  button: DemoButton;
}

export interface ContactInfo {
  title: string;
  description: string;
  offices: Office[];
  form: ContactForm;
  support: ContactSupport;
  sales: ContactSales;
  demo: ContactDemo;
}

export interface Contact {
  title: string;
  meta_title?: string;
  description: string;
  draft: boolean;
  contact_info: ContactInfo;
}
