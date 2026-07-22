export interface BookMetadata {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  pdfUrl: string;
  chunkCount?: number;
  coverColor: string;
}

export const PRE_INDEXED_BOOKS: BookMetadata[] = [
  {
    id: "science-g1",
    title: "Infinity Science - Book 1",
    subject: "Science",
    gradeLevel: "Grade 1",
    pdfUrl: "/textbooks/infinity-science-1.pdf",
    coverColor: "from-teal-500/20 to-cyan-600/20",
  },
  {
    id: "math-g1",
    title: "Mathematics Primer - Book 1",
    subject: "Mathematics",
    gradeLevel: "Grade 1",
    pdfUrl: "/textbooks/math-primer-1.pdf",
    coverColor: "from-indigo-500/20 to-purple-600/20",
  },
  {
    id: "english-g1",
    title: "English Reader Primer",
    subject: "English",
    gradeLevel: "Grade 1",
    pdfUrl: "/textbooks/english-reader-1.pdf",
    coverColor: "from-amber-500/20 to-orange-600/20",
  },
];

export function getBookById(id: string): BookMetadata | undefined {
  return PRE_INDEXED_BOOKS.find((b) => b.id === id);
}
