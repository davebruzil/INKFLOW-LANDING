export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'cram-cortex',
    title: 'CramCortex',
    description: 'AI-powered study platform with advanced memory techniques and spaced repetition algorithms to optimize learning efficiency.',
    image: '/projects/cramCortex.png',
    techStack: ['React', 'Node.js', 'AI/ML', 'MongoDB'],
  },
  {
    id: 'inkflow',
    title: 'InkFlow',
    description: 'Creative writing and note-taking application with intuitive interface and collaborative features for seamless content creation.',
    image: '/projects/INKFLOW.png',
    techStack: ['Vue.js', 'Firebase', 'TypeScript', 'PWA'],
  },
  {
    id: 'rag-search',
    title: 'RAG Search',
    description: 'Retrieval-Augmented Generation search engine that combines vector search with large language models for intelligent information retrieval.',
    image: '/projects/RAG-search.png',
    techStack: ['Python', 'FastAPI', 'Vector DB', 'LLM'],
  },
];