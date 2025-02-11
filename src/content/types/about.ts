export interface AboutStats {
  key: string;
  value: string;
}

export interface AboutValue {
  title: string;
  content: string;
}

export interface TeamMember {
  name: string;
  image: string;
  designation: string;
}

export interface Button {
  enable: boolean;
  label: string;
  link: string;
}

export interface Story {
  title: string;
  content_1: string;
  content_2: string;
  stats: AboutStats[];
}

export interface Value {
  title: string;
  content: string;
  values: AboutValue[];
}

export interface Team {
  title: string;
  content: string;
  members: TeamMember[];
}

export interface Career {
  title: string;
  content: string;
}

export interface About {
  title: string;
  meta_title: string;
  description: string;
  image: string;
  button: Button;
  story: Story;
  value: Value;
  team: Team;
  career: Career;
  draft?: boolean;
}
