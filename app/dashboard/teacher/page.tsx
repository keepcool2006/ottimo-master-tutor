"use client";

import { useState } from "react";
import QuizBuilder from "@/components/QuizBuilder";
import { PRE_INDEXED_BOOKS, BookMetadata } from "@/lib/books";
import {
  GraduationCap,
  LogOut,
  FileText,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedBook, setSelectedBook] = useState<BookMetadata>(PRE_INDEXED_BOOKS[0]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-[#080812] overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-white/10 bg-black/30 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Ottimo</span>
        </Link>

        <div className="h-4 w-px bg-white/20" />

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FileText className="w-4 h-4 text-teal-400" />
          <span className="font-medium text-white">Teacher Mode</span>
        </div>

        {/* Textbook Selector Dropdown */}
        <div className="relative ml-2">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-teal-500/50 rounded-xl px-3 py-1.5 transition-colors">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedBook.id}
              onChange={(e) => {
                const book = PRE_INDEXED_BOOKS.find((b) => b.id === e.target.value);
                if (book) setSelectedBook(book);
              }}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-4"
            >
              {PRE_INDEXED_BOOKS.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#0d0d1a] text-white">
                  {b.title} ({b.subject} · {b.gradeLevel})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/dashboard/student"
            className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Student Mode
          </Link>

          <button
            id="teacher-sign-out"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden p-6">
        <QuizBuilder selectedBook={selectedBook} />
      </div>
    </div>
  );
}
