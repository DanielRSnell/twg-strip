export interface Button {
  enable: boolean;
  label: string;
  link: string;
}

export interface Banner {
  title: string;
  content: string;
  image: string;
  button: Button;
  brands: string[];
}

export interface Service {
  title: string;
  image: string;
  content: string;
  button: Button;
}

export interface Feature {
  title: string;
  description: string;
  card_content: string;
  icon: string;
  image: string;
}

export interface About {
  title: string;
  content: string;
  content_2: string;
  image: string;
  button: Button;
}

export interface Homepage {
  banner: Banner;
  service: {
    title: string;
    services: Service[];
  };
  feature: {
    title: string;
    content: string;
    features: Feature[];
  };
  about: About;
}
