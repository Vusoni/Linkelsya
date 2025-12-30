"use client";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    title: "AI Writing Partner",
    description: "An intelligent assistant that helps you write, edit, and refine your documents. Ask questions, get suggestions, or let it draft entire sections.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Knowledge Context",
    description: "Add reference materials, notes, and research directly to your document. The AI uses this context to give you informed, relevant suggestions.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Clean, Focused Editor",
    description: "A distraction-free writing environment with classic typography. Rich formatting when you need it, simplicity when you don't.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Everything you need to write better
          </h2>
          <p className="text-lg text-gray-600 font-serif max-w-2xl mx-auto">
            Combine the elegance of a traditional editor with the power of AI assistance.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 shadow-soft border border-border/50 hover:shadow-medium transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 font-serif leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Workflow section */}
        <div className="mt-24 bg-white rounded-lg shadow-soft border border-border/50 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-12 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                Your knowledge, your context
              </h3>
              <p className="text-gray-600 font-serif leading-relaxed mb-6">
                Add any reference material—research notes, documentation, past writing—and the AI will 
                use it to provide contextually relevant assistance. No more copy-pasting between tabs.
              </p>
              <ul className="space-y-3">
                {["Add unlimited knowledge items", "AI uses context automatically", "Keep everything organized"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-sans">
                    <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-muted p-8 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-white rounded-lg shadow-soft border border-border p-4 mb-3">
                  <div className="text-sm font-sans font-medium text-foreground mb-2">Research Notes</div>
                  <div className="h-2 bg-muted rounded w-full mb-1.5"></div>
                  <div className="h-2 bg-muted rounded w-4/5"></div>
                </div>
                <div className="bg-white rounded-lg shadow-soft border border-border p-4 mb-3 ml-4">
                  <div className="text-sm font-sans font-medium text-foreground mb-2">API Documentation</div>
                  <div className="h-2 bg-muted rounded w-full mb-1.5"></div>
                  <div className="h-2 bg-muted rounded w-3/4"></div>
                </div>
                <div className="bg-white rounded-lg shadow-soft border border-border p-4 ml-8">
                  <div className="text-sm font-sans font-medium text-foreground mb-2">Meeting Notes</div>
                  <div className="h-2 bg-muted rounded w-full mb-1.5"></div>
                  <div className="h-2 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
