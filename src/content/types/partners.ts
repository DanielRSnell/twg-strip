export interface Partner {
  name: string;
  logo: string;
  description: string;
  partnership_type: string;
  website: string;
  featured?: boolean;
}

export interface Partners {
  title: string;
  meta_title?: string;
  description: string;
  partners: Partner[];
  draft?: boolean;
}
