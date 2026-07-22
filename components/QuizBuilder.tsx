"use client";

import { useState } from "react";
import { BookMetadata } from "@/lib/books";
import { QuestionItem } from "@/app/api/generate-test/route";
import {
  Wand2,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import jsPDF from "jspdf";

interface QuizBuilderProps {
  selectedBook: BookMetadata;
}

export default function QuizBuilder({ selectedBook }: QuizBuilderProps) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [questionTypes, setQuestionTypes] = useState<Array<"mcq" | "true_false" | "short_answer" | "long_answer">>([
    "mcq",
    "true_false",
    "short_answer",
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuestionItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const toggleType = (type: "mcq" | "true_false" | "short_answer" | "long_answer") => {
    setQuestionTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (questionTypes.length === 0) {
      setError("Please select at least one question type.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBook.id,
          subject: selectedBook.subject,
          gradeLevel: selectedBook.gradeLevel,
          topic: topic.trim() || undefined,
          questionTypes,
          difficulty,
          count,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate test paper");

      setQuestions(data.questions);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate test");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = () => {
    if (!questions?.length) return;

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`${selectedBook.title} — Practice Assessment`, 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Subject: ${selectedBook.subject} | Grade: ${selectedBook.gradeLevel} | Total Questions: ${questions.length}`, 20, 28);
    doc.line(20, 32, 190, 32);

    let y = 40;

    questions.forEach((q, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Q${i + 1}. (${q.marks} mark${q.marks > 1 ? "s" : ""}) ${q.question}`, 20, y);
      y += 8;

      if (q.options?.length) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        q.options.forEach((opt) => {
          doc.text(`   ${opt}`, 25, y);
          y += 6;
        });
      } else {
        y += 10; // leave blank lines for short/long answer
      }

      y += 4;
    });

    if (showAnswerKey) {
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("ANSWER KEY & EXPLANATIONS", 20, 20);
      doc.line(20, 24, 190, 24);
      y = 32;

      questions.forEach((q, i) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Q${i + 1} Answer: ${q.answer}`, 20, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const splitExplanation = doc.splitTextToSize(`Explanation: ${q.explanation}`, 170);
        doc.text(splitExplanation, 20, y);
        y += splitExplanation.length * 5 + 6;
      });
    }

    doc.save(`${selectedBook.id}-quiz.pdf`);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 overflow-hidden">
      {/* Quiz Config Controls Panel */}
      <div className="w-full md:w-80 bg-[#0d0d1a] border border-white/10 rounded-2xl p-5 flex flex-col gap-5 overflow-y-auto flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm mb-1">
            <Wand2 className="w-4 h-4" />
            Test Generator Studio
          </div>
          <p className="text-xs text-gray-400">
            Generate customized chapter test papers from pre-indexed textbook knowledge base.
          </p>
        </div>

        {/* Selected Book Banner */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-teal-400" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{selectedBook.title}</p>
            <p className="text-[10px] text-gray-400">{selectedBook.subject} · {selectedBook.gradeLevel}</p>
          </div>
        </div>

        {/* Topic Focus Input */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1.5 block">
            Topic Focus (Optional)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Parts of a Plant, Water Cycle"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        {/* Number of questions slider */}
        <div>
          <div className="flex justify-between text-xs text-gray-300 mb-1.5">
            <span>Number of Questions</span>
            <span className="font-mono text-teal-400 font-bold">{count}</span>
          </div>
          <input
            type="range"
            min={3}
            max={15}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-teal-400 cursor-pointer"
          />
        </div>

        {/* Difficulty Selector */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1.5 block">
            Difficulty Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["easy", "medium", "hard", "mixed"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-1.5 text-xs rounded-lg capitalize border transition-colors ${
                  difficulty === d
                    ? "bg-teal-500/20 border-teal-500/50 text-teal-300 font-semibold"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Question Types Checkboxes */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1.5 block">
            Question Types
          </label>
          <div className="flex flex-col gap-2">
            {[
              { id: "mcq", label: "Multiple Choice (MCQ)" },
              { id: "true_false", label: "True / False" },
              { id: "short_answer", label: "Short Answer" },
              { id: "long_answer", label: "Long Answer" },
            ].map(({ id, label }) => (
              <label
                key={id}
                className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={questionTypes.includes(id as any)}
                  onChange={() => toggleType(id as any)}
                  className="rounded bg-white/10 border-white/20 accent-teal-400"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="mt-auto py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Test...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Test Paper
            </>
          )}
        </button>
      </div>

      {/* Quiz Preview Area */}
      <div className="flex-1 bg-[#0d0d1a] border border-white/10 rounded-2xl p-6 flex flex-col overflow-hidden">
        {questions ? (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
              <div>
                <h3 className="font-bold text-white text-base">{selectedBook.title} — Quiz</h3>
                <p className="text-xs text-gray-400">
                  {questions.length} questions · {difficulty} difficulty
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAnswerKey}
                    onChange={(e) => setShowAnswerKey(e.target.checked)}
                    className="accent-teal-400"
                  />
                  <span>Include Answer Key</span>
                </label>

                <button
                  onClick={exportPDF}
                  className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Questions List Scroll View */}
            <div className="flex-1 overflow-y-auto pt-4 pr-2 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
              {questions.map((q, i) => (
                <div
                  key={q.id || i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-teal-400">
                      Q{i + 1} ({q.marks} mark{q.marks > 1 ? "s" : ""}) · {q.type.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 capitalize">
                      {q.difficulty}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-white">{q.question}</p>

                  {q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-1">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 border border-white/5"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {showAnswerKey && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Answer: {q.answer}
                      </div>
                      <p className="text-gray-400 text-[11px] pl-5">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">No Test Paper Generated Yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Select your topic preferences on the left panel and click &quot;Generate Test Paper&quot; to build a custom quiz.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
