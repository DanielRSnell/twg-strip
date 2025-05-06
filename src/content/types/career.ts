export interface CareerButton {
  enable: boolean;
  link: string;
  label: string;
}

export interface CareerStats {
  key: string;
  value: string;
}

export interface CareerAbout {
  image: string;
  stats: CareerStats[];
}

export interface CareerPoint {
  title: string;
  content: string;
}

export interface CareerWhy {
  title: string;
  content: string;
  points: CareerPoint[];
}

export interface CareerInfo {
  title: string;
  content: string;
}

export interface Career {
  title: string;
  meta_title: string;
  description: string;
  location?: string;
  duration?: string;
  vacant?: string;
  salary?: string;
  apply?: string;
  content?: string;
  button?: CareerButton;
  about?: CareerAbout;
  why?: CareerWhy;
  career?: CareerInfo;
  draft?: boolean;
}
