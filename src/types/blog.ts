export interface BlogPost {
  title: string;
  meta_title: string;
  description: string;
  date: Date;
  image: string;
  categories: string[];
  author: string;
  author_image: string;
  type: 'post' | 'video' | 'audio' | 'press';
  draft?: boolean;
  video_url?: string;
  audio_url?: string;
  duration?: string;
  transcript?: string;
  press_source?: string;
  press_url?: string;
  featured?: boolean;
  tags?: string[];
  header_title?: string;
  homepage_title?: string;
  homepage_description?: string;
  cover_image?: string;
}

export interface BlogIndex extends BlogPost {
  header_title: string;
  homepage_title: string;
  homepage_description: string;
}

export interface VideoPost extends BlogPost {
  video_url: string;
  duration: string;
  transcript?: string;
}

export interface AudioPost extends BlogPost {
  audio_url: string;
  duration: string;
  transcript?: string;
}

export interface PressPost extends BlogPost {
  press_source: string;
  press_url: string;
}
