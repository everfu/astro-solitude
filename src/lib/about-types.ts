type DefaultSection = (typeof import('../data/about.json'))['sections'][number];
type Skills = NonNullable<DefaultSection['skills']>;
type Career = NonNullable<DefaultSection['career']>;
type Timeline = NonNullable<Career['timeline']>;
type Photo = NonNullable<DefaultSection['photo']>;
type Interest = NonNullable<DefaultSection['items']>[number];

/** Optional fields supported by the theme, including sections absent in the demo. */
export type AboutSection = Omit<
  DefaultSection,
  'skills' | 'career' | 'photo' | 'items'
> & {
  enabled?: boolean;
  skills?: Omit<Skills, 'items'> & {
    items?: (Skills['items'][number] & { image?: string })[];
  };
  career?: Omit<Career, 'timeline'> & {
    timeline?: Omit<Timeline, 'events'> & {
      events?: (Omit<Timeline['events'][number], 'to'> & {
        to?: number;
        period?: string;
      })[];
    };
  };
  photo?: Photo & { badge?: string };
  items?: (Interest & { color?: string })[];
  statistics?: {
    label?: string;
    title?: string;
    background?: string;
    metrics?: { label: string; field: string; fallback?: string | number }[];
    button?: { url: string; text: string };
    source?: { url?: string; response_path?: string };
  };
  location?: {
    label?: string;
    title?: string;
    map_light?: string;
    map_dark?: string;
  };
  profile?: {
    label?: string;
    title?: string;
    items?: { icon?: string; label: string; value: string }[];
  };
};
export interface AboutData {
  title?: string;
  sections: AboutSection[];
}
