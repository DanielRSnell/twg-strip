export interface BlogBase {
  title: string;
  meta_title: string;
  description: string;
  date: Date;
  image: string;
  categories: string[];
  author: string;
  author_image: string;
  draft?: boolean;
  featured?: boolean;
  tags?: string[];
  header_title?: string;
  homepage_title?: string;
  homepage_description?: string;
  cover_image?: string;
}

export interface BlogPost extends BlogBase {
  type: 'post';
}

export interface VideoPost extends BlogBase {
  type: 'video';
  video_url: string;
  duration: string;
  transcript?: string;
}

export interface AudioPost extends BlogBase {
  type: 'audio';
  audio_url: string;
  duration: string;
  transcript?: string;
}

export interface PressPost extends BlogBase {
  type: 'press';
  press_source: string;
  press_url: string;
}

export type BlogContent = BlogPost | VideoPost | AudioPost | PressPost;

export interface BlogIndex extends BlogBase {
  type: 'post';
  header_title: string;
  homepage_title: string;
  homepage_description: string;
}
