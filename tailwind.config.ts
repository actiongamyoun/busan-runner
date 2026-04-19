import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:        '#1B3A5C',
        'navy-ink':  '#12263D',
        coral:       '#FF6B4A',
        'coral-soft':'#FFE9E3',
        paper:       '#FAFAF7',
        cream:       '#F4F1EA',
        line:        '#E8E5DE',
        mute:        '#8A8578',
        ink:         '#1A1A1A',
        success:     '#2E8B57',
      },
      fontFamily: {
        serif: ['Fraunces', 'Pretendard Variable', 'serif'],
        sans:  ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
