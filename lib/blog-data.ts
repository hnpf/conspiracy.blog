export interface BlogPost {
  id: string;
  title: string;
  snippet: string;
  content: string;
  date: string;
  category: string;
  readTime: string;
  link: string;
  highlighted?: boolean;
}

export const BlogPosts: BlogPost[] = [
  {
    id: 'post_1',
    title: 'why i rewrote it in rust',
    snippet: 'this is the first post',
    content: `
    	blank content.
    `,
    date: 'Apr 26 2026',
    category: 'post cat',
    readTime: '1 min read',
    link: '/post_1',
    highlighted: true,
  },
  {
    id: 'post_2',
    title: 'the Dockerfile that ended my relationship',
    snippet: 'this should be post 2',
    content: `
	blank content.
    `,
    date: 'Apr 25 2026',
    category: 'samp cat',
    readTime: '2 min read',
    link: '/post_2',
    highlighted: true,
  },
  {
    id: 'post_3',
    title: 'lorem ipsum but make it ts',
    snippet: 'this should be post 3',
    content: `
    	blank content.
    `,
    date: 'Apr 24 2026',
    category: 'cat blank',
    readTime: '3 min read',
    link: '/post_3',
  },
  {
    id: 'post_4',
    title: 'how to segfault some personal choices.',
    snippet: 'post 4 gang',
    content: `
    	blank content.
    `,
    date: 'Apr 23 2026',
    category: 'post',
    readTime: '4 min read',
    link: '/post_4',
    highlighted: true,
  }
];
