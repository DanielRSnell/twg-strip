export interface AwardBase {
  title: string;
  meta_title: string;
  description: string;
  date: Date;
  image: string;
  categories: string[];
  organization: string;
  organization_logo: string;
  draft?: boolean;
  featured?: boolean;
  tags?: string[];
  header_title?: string;
  homepage_title?: string;
  homepage_description?: string;
  cover_image?: string;
}

export interface Award extends AwardBase {
  type: 'award';
  award_url?: string;
}

export type AwardContent = Award;

export interface AwardIndex extends AwardBase {
  type: 'award';
  header_title: string;
  homepage_title: string;
  homepage_description: string;
}
