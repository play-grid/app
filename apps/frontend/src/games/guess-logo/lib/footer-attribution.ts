// src/lib/footer-attribution.ts
export type FooterLogoSet = 'companies' | 'movies';

export interface FooterAttribution {
  href: string;
  title: string;
  imgSrc: string;
  imgAlt: string;
  text: string;
}

export const footerAttribution: Record<FooterLogoSet, FooterAttribution> = {
  companies: {
    href: 'https://logo.dev',
    title: 'Logo API',
    imgSrc: 'https://img.logo.dev/logo.dev?theme=light&format=png',
    imgAlt: 'Logo.dev',
    text: 'Logos provided by Logo.dev',
  },
  movies: {
    href: 'https://www.themoviedb.org/',
    title: 'TMDB',
    imgSrc: '/assets/tmdb-logo.svg',
    imgAlt: 'TMDB',
    text: 'Movies Posters provided by TMDB',
  },
};
