import Link from 'next/link';
import { BookOpen, Sparkles, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-16 lg:px-12">
      <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-[rgba(215,167,79,0.18)] blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-[rgba(63,107,102,0.18)] blur-3xl" />

      <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <section className="space-y-8 animate-fade-up">
          <div className="chip w-fit">CareCircle Journal</div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl text-ink">
              A shared memory space for the tender details of care.
            </h1>
            <p className="text-lg text-ink-muted max-w-xl">
              Capture daily rhythms, uncover patterns, and keep everyone aligned with a warm, living record that
              feels human—not clinical.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary">
              Sign in
            </Link>
            <Link href="/signup" className="btn-outline">
              Create account
            </Link>
            <Link href="/demo" className="btn-secondary">
              Try the demo
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card-inset p-4">
              <BookOpen className="w-5 h-5 text-clay mb-3" />
              <p className="text-sm text-ink-muted">
                Structured entries that still feel like a journal.
              </p>
            </div>
            <div className="card-inset p-4">
              <Users className="w-5 h-5 text-sage mb-3" />
              <p className="text-sm text-ink-muted">
                Share context with caregivers, therapists, and family.
              </p>
            </div>
            <div className="card-inset p-4">
              <Sparkles className="w-5 h-5 text-clay mb-3" />
              <p className="text-sm text-ink-muted">
                AI highlights patterns and summaries you can act on.
              </p>
            </div>
          </div>
        </section>

        <section className="relative animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="absolute -top-10 right-0 h-20 w-20 rounded-full bg-[rgba(198,107,78,0.22)] blur-2xl" />
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[rgba(198,107,78,0.18)] flex items-center justify-center text-clay font-semibold">
                AJ
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-ink-faint">Today</p>
                <p className="text-xl text-ink">Alex • 7 entries</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Sleep', note: 'Rested 9 hours • calm wake-up' },
                { label: 'Meal', note: 'Oatmeal + berries, full appetite' },
                { label: 'Mood', note: 'Steady focus after afternoon walk' },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-mist bg-white/70 px-4 py-3 animate-fade-up"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">{item.label}</p>
                  <p className="text-sm text-ink-muted">{item.note}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-[rgba(63,107,102,0.12)] border border-[rgba(63,107,102,0.25)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sage">AI Summary</p>
              <p className="text-sm text-ink-muted">
                Calm morning, energized afternoon. Keep the outdoor routine—mood lifts within 30 minutes.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 card px-5 py-4 w-52 rotate-[-4deg] shadow-lg">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Shared note</p>
            <p className="text-sm text-ink-muted">
              OT asked to track sensory triggers after 3pm.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
