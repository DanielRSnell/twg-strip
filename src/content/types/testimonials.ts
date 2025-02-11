export interface Testimonial {
  name: string;
  designation: string;
  avatar: string;
  content: string;
}

export interface TestimonialContent {
  enable: boolean;
  title: string;
  homepage_title: string;
  content: string;
  testimonials: Testimonial[];
}
