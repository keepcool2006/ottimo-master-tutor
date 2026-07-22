import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Brain,
  Sparkles,
  FileText,
  Zap,
  Shield,
  BarChart3,
  ChevronRight,
  Star,
  Check,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Socratic AI Tutor",
    description:
      "Never gives away answers. Guides students through discovery with leading questions and adaptive hints — 24/7, infinitely patient.",
    color: "from-indigo-500 to-purple-500",
    glow: "group-hover:shadow-indigo-500/20",
  },
  {
    icon: FileText,
    title: "Auto Test Generator",
    description:
      "Teachers get instant, curriculum-aligned test papers with MCQ, true/false, short and long answers — complete with answer keys.",
    color: "from-teal-500 to-cyan-500",
    glow: "group-hover:shadow-teal-500/20",
  },
  {
    icon: BookOpen,
    title: "RAG-Powered Knowledge",
    description:
      "Every answer is grounded in the actual textbook. Upload once, query forever — with semantic search across all chapters.",
    color: "from-amber-500 to-orange-500",
    glow: "group-hover:shadow-amber-500/20",
  },
  {
    icon: Zap,
    title: "Instant Streaming Responses",
    description:
      "Powered by Gemini 2.5 Flash. Responses start appearing within milliseconds, with full math rendering via KaTeX.",
    color: "from-rose-500 to-pink-500",
    glow: "group-hover:shadow-rose-500/20",
  },
  {
    icon: Shield,
    title: "Academic Integrity Built-In",
    description:
      "Student mode is engineered to never complete homework directly. It detects assignment intent and switches to guidance mode.",
    color: "from-violet-500 to-purple-600",
    glow: "group-hover:shadow-violet-500/20",
  },
  {
    icon: BarChart3,
    title: "Publisher-Ready Platform",
    description:
      "Multi-tenant, auth-protected, and designed for textbook publishers to deploy per-book learning companions at scale.",
    color: "from-sky-500 to-blue-500",
    glow: "group-hover:shadow-sky-500/20",
  },
];

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Head of Curriculum, Sunrise Publishers",
    quote:
      "Ottimo has transformed how our students engage with textbooks. The Socratic approach keeps them thinking rather than copying.",
    stars: 5,
    avatar: "PS",
  },
  {
    name: "Rajesh Kumar",
    role: "Mathematics Teacher, Delhi Public School",
    quote:
      "I generated a complete 25-question test paper in under 30 seconds. The answer key was perfect. This saves me hours every week.",
    stars: 5,
    avatar: "RK",
  },
  {
    name: "Ananya Mehta",
    role: "Class 10 Student",
    quote:
      "Ottimo doesn't just give me answers — it makes me figure things out. I actually understand my physics now!",
    stars: 5,
    avatar: "AM",
  },
];

const plans = [
  {
    name: "Starter",
    price: "₹2,999",
    period: "/month",
    description: "For individual teachers and small classrooms",
    features: ["5 textbook PDFs", "3 teacher accounts", "Unlimited student chats", "50 test papers/month", "Email support"],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Publisher",
    price: "₹14,999",
    period: "/month",
    description: "For textbook publishers and school chains",
    features: ["Unlimited textbooks", "25 teacher accounts", "Unlimited everything", "Priority Gemini 2.5 Pro", "Custom branding", "Dedicated support", "Analytics dashboard"],
    cta: "Get Publisher License",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For state boards, large publishers & EdTech",
    features: ["White-label deployment", "On-premise option", "Custom AI fine-tuning", "SLA guarantee", "API access"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080812] bg-grid overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Ottimo</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">Beta</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105 active:scale-100"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-float-delayed pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-sm text-indigo-300 mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Gemini 2.5 · Chroma RAG · Supabase Auth
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
            <span className="text-white">The AI Tutor That</span>
            <br />
            <span className="gradient-text">Makes Students Think</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ottimo is a Socratic AI learning companion for school textbook publishers.
            Guides students through discovery. Helps teachers generate perfect test papers in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/30 transition-all hover:scale-105 active:scale-100"
            >
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard/student"
              className="flex items-center gap-2 glass text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all hover:scale-105"
            >
              <BookOpen className="w-5 h-5 text-indigo-400" />
              See Demo
            </Link>
          </div>

          {/* Mock UI preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="glass rounded-2xl p-5 text-left hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <Brain className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Ottimo Tutor</span>
                <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Live
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                "Great question! Instead of telling you the answer, let&apos;s think about this together. If a plant is making food using sunlight, what do you think it needs besides light? 🌱"
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Socratic Mode Active</span>
                <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">RAG: Biology Ch.3</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 text-left hover:border-teal-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Test Generator</span>
                <span className="ml-auto text-xs text-emerald-400">✓ Generated</span>
              </div>
              <div className="space-y-1.5">
                {["Q1. Define osmosis and explain... [4 marks]", "Q2. Which of the following... [MCQ]", "Q3. True or False: Chlorophyll..."].map((q, i) => (
                  <div key={i} className="text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-1.5">{q}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything a Publisher Needs
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              One platform for students who want to learn and teachers who want to assess — all grounded in your textbooks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`group glass rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-xl ${f.glow}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">From textbook PDF to AI-powered classroom in three steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-indigo-500/50" />
            {[
              { step: "01", title: "Upload Textbook", desc: "Teachers upload the textbook PDF. Ottimo automatically chunks, embeds, and indexes it into Chroma Cloud.", icon: "📚" },
              { step: "02", title: "Students Learn", desc: "Students ask questions. Ottimo retrieves relevant textbook sections and guides them with Socratic questions.", icon: "🧠" },
              { step: "03", title: "Teachers Assess", desc: "Teachers configure a quiz, click generate, and download a PDF test paper with answer key in seconds.", icon: "✅" },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl glass flex items-center justify-center text-2xl mb-4 border border-white/10 shadow-xl animate-glow">
                  {item.icon}
                </div>
                <div className="absolute -top-2 -right-2 text-xs font-bold text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 rounded-full w-7 h-7 flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Loved by Educators</h2>
            <p className="text-gray-400">Real feedback from teachers, students, and publishers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass rounded-2xl p-6 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Start free. Scale as your publisher network grows.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 border transition-all hover:scale-[1.02] ${
                  plan.highlight
                    ? "bg-gradient-to-b from-indigo-950/80 to-purple-950/80 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 relative overflow-hidden"
                    : "glass border-white/10"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-4 right-4 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 ${
                    plan.highlight
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/20"
                      : "glass text-white hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Textbooks?
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Join hundreds of publishers giving their students a 24/7 AI tutor and their teachers the gift of time.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/30 transition-all hover:scale-105"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white">Ottimo Master Tutor</span>
          </div>
          <p className="text-sm text-gray-600">© 2025 Ottimo. Built with Gemini 2.5 · Chroma · Supabase.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
