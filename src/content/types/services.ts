export interface ServiceButton {
  enable: boolean;
  label: string;
  link: string;
}

export interface Service {
  title: string;
  banner_title: string;
  meta_title?: string;
  description: string;
  button: ServiceButton;
  contact_1: string;
  contact_2: string;
  image: string;
}
