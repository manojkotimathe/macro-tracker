import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InputScreen } from './input-screen';
import { ResultsScreen } from './results-screen';
import { CalculatorInputs } from '@/lib/calculator';
import { Plus, Menu, X } from 'lucide-react';

const DEFAULT_INPUTS: CalculatorInputs = {
  gender: 'male',
  age: 30,
  unitSystem: 'imperial',
  heightMetric: 175,
  heightImperialFeet: 5,
  heightImperialInches: 10,
  weight: 180,
  bodyFat: undefined,
  activityLevel: 'moderately_active',
  goal: 'moderate_weight_loss',
};

const FAQ_ITEMS = [
  {
    q: 'Why does this calculator track fiber?',
    a: 'Hitting your carbohydrate goal using only simple sugars will leave you fatigued and hungry. Tracking fiber (targeting roughly 14 g per 1,000 kcal) ensures you are eating complex, nutrient-dense foods—like oats or vegetables. It also regulates digestion, which is crucial when consuming a high-protein diet.',
  },
  {
    q: 'How is my daily calorie target calculated?',
    a: 'We use the Mifflin-St Jeor equation to find your Basal Metabolic Rate (BMR)—the calories you burn just staying alive. We then multiply that by your specific activity level to calculate your Total Daily Energy Expenditure (TDEE).',
  },
  {
    q: 'Which activity level should I choose for resistance training or calisthenics?',
    a: 'If you are doing intense bodyweight training, lifting heavy, or training 4–6 days a week, select the "Heavy" activity multiplier. If your workouts are mostly light cardio or you work a desk job, stick to "Light" or "Moderate" to avoid overestimating your calorie burn.',
  },
  {
    q: 'Why is the protein target set at 2 g per kg of body weight?',
    a: 'For anyone actively training to build or maintain muscle, a higher protein intake is essential for recovery and hypertrophy. Whether your primary protein sources are eggs, paneer, or lean meats, hitting this threshold ensures your muscles have the building blocks they need after a hard workout.',
  },
  {
    q: 'Does it matter which foods I use to hit these numbers?',
    a: 'Yes. While hitting your total macros dictates weight loss or gain, food quality dictates your performance and health. Hitting your macros with high-quality proteins and complex carbohydrates will fuel your workouts and recovery far better than heavily processed alternatives.',
  },
  {
    q: 'What is the exact calorie breakdown for each macro?',
    a: 'Each macronutrient provides a specific amount of energy per gram. The calculator uses these exact values to distribute your remaining calories after your protein target is met: Protein — 4 kcal per gram. Carbohydrates — 4 kcal per gram. Fats — 9 kcal per gram.',
  },
  {
    q: 'How do "Cut," "Maintain," and "Bulk" affect my final numbers?',
    a: 'Choosing a goal automatically adjusts your Total Daily Energy Expenditure (TDEE). Maintain sets your target exactly at your TDEE to keep your current weight. Cut subtracts 500 kcal to create a steady deficit for fat loss while preserving muscle. Bulk adds 500 kcal to provide a controlled surplus for building strength and muscle mass.',
  },
  {
    q: 'How often should I recalculate my macros?',
    a: 'You should update your numbers whenever your body weight changes by 3–5 kg, or if your daily activity levels significantly shift—for example, moving from a desk job to a highly active routine. As your body mass changes, your BMR changes with it.',
  },
  {
    q: 'Does fiber count toward my daily carbohydrate total?',
    a: 'Yes. On food labels, fiber is listed under total carbohydrates. However, because your body cannot fully digest dietary fiber, it does not impact your blood sugar or energy levels the same way simple carbohydrates do. This is why hitting your specific fiber goal alongside your carb total is so important for clean energy.',
  },
  {
    q: 'What should I do if I miss my macro targets for the day?',
    a: 'Consistency beats perfection. If you overshoot your fats or miss your protein target one day, do not try to starve yourself or double your intake the next day. Simply return to your calculated targets with your next meal.',
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  const itemRefs = useState<(HTMLDivElement | null)[]>(() => [])[0];

  const toggle = (i: number) => {
    const next = open === i ? null : i;
    setOpen(next);
    if (next !== null) {
      setTimeout(() => {
        itemRefs[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  return (
    <div className="divide-y divide-border">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} ref={(el) => { itemRefs[i] = el; }}>
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-start justify-between gap-4 py-5 text-left cursor-pointer group"
            aria-expanded={open === i}
          >
            <span className="text-sm md:text-base font-semibold leading-snug group-hover:text-accent transition-colors duration-200">
              {item.q}
            </span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="answer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <motion.p
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -6, opacity: 0 }}
                  transition={{ duration: 0.32, delay: 0.06, ease: 'easeOut' }}
                  className="pb-5 text-sm md:text-base text-muted-foreground leading-relaxed"
                >
                  {item.a}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

type View = 'landing' | 'input' | 'results';

export default function CalculatorApp() {
  const [view, setView] = useState<View>('landing');
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCalculate = (newInputs: CalculatorInputs) => {
    setInputs(newInputs);
    setView('results');
  };

  const handleRecalculate = () => setView('input');

  const goToCalculator = () => {
    setMobileMenuOpen(false);
    setView('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFaq = () => {
    setMobileMenuOpen(false);
    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <AnimatePresence mode="wait">

        {/* ── LANDING PAGE ── */}
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
                <div className="font-display text-xl sm:text-2xl tracking-wide text-primary">MacroIQ</div>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                  <button onClick={goToCalculator} className="hover:text-foreground transition-colors cursor-pointer">The calculator</button>
                  <button onClick={scrollToFaq} className="hover:text-foreground transition-colors cursor-pointer">FAQ</button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={goToCalculator}
                    className="bg-primary text-primary-foreground px-4 sm:px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    data-testid="button-nav-start"
                  >
                    Start Calculating
                  </button>
                  {/* Mobile hamburger */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Mobile dropdown menu */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="md:hidden overflow-hidden border-t border-border bg-background"
                  >
                    <div className="flex flex-col px-4 py-4 gap-1">
                      <button onClick={goToCalculator} className="text-left px-3 py-3 rounded-lg text-sm font-medium hover:bg-secondary transition-colors cursor-pointer">The calculator</button>
                      <button onClick={scrollToFaq} className="text-left px-3 py-3 rounded-lg text-sm font-medium hover:bg-secondary transition-colors cursor-pointer">FAQ</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>

            <main>
              {/* Hero */}
              <section className="pt-20 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto text-center">
                <h1 className="font-display text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] leading-[0.85] tracking-tight mb-6 sm:mb-8">
                  <span className="block">STOP EATING BLIND</span>
                  <span className="block text-accent">START BUILDING</span>
                  <span className="block">PRECISELY</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground mb-8 sm:mb-10">
                  The numbers do not lie. Dial in your intake and watch the strength come.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button
                    onClick={goToCalculator}
                    className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-base font-semibold hover:opacity-90 transition-opacity cursor-pointer text-center"
                    data-testid="button-hero-calculate"
                  >
                    Start Calculating
                  </button>
                  <button
                    onClick={scrollToFaq}
                    className="w-full sm:w-auto border border-border text-foreground px-8 py-3.5 rounded-full text-base font-medium hover:bg-secondary transition-colors cursor-pointer text-center"
                    data-testid="button-hero-learn"
                  >
                    Read the FAQ
                  </button>
                </div>
              </section>

            {/* FAQ */}
            <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-border">
              <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                <div className="md:w-1/3 shrink-0">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-accent mb-3 sm:mb-4">FAQ</p>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                    COMMON<br />QUESTIONS
                  </h2>
                </div>
                <div className="flex-1">
                  <FaqAccordion />
                </div>
              </div>
            </section>

            {/* Newsletter */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-border">
              <div className="flex flex-col gap-6 sm:gap-8">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Join our newsletter</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Get precision nutrition insights delivered straight to your inbox</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-card border border-border rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    data-testid="input-newsletter-email"
                  />
                  <button
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    data-testid="button-newsletter-subscribe"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </section>
            </main>

            {/* Footer */}
            <footer className="pt-16 sm:pt-20 pb-10 px-4 sm:px-6 max-w-7xl mx-auto border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 mb-12">
                <div>
                  <div className="font-display text-2xl sm:text-3xl tracking-wide text-primary mb-3">MacroIQ</div>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    True performance nutrition calculated here. Stop guessing and start knowing.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-foreground">Calculator</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {[
                      { label: 'Home', desc: 'Start your macro calculation' },
                      { label: 'Input form', desc: 'Enter your biometrics and training specifics' },
                      { label: 'Results dashboard', desc: 'Your daily nutritional targets' },
                      { label: 'Fiber target', desc: 'The missing metric: your daily fiber' },
                      { label: 'TDEE explained', desc: 'How we calculated your energy needs' },
                    ].map((item) => (
                      <li key={item.label}>
                        <button
                          onClick={goToCalculator}
                          className="group text-left w-full py-2 cursor-pointer"
                        >
                          <span className="group-hover:text-foreground transition-colors">{item.label}</span>
                          <span className="block text-xs text-muted-foreground/60 mt-0.5">{item.desc}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-foreground">Learn</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {[
                      { label: 'FAQ section', desc: 'Common questions answered' },
                      { label: 'The formula', desc: 'The science of the Mifflin-St Jeor equation' },
                      { label: 'Fiber science', desc: 'Why complex carbs drive performance' },
                      { label: 'Protein guide', desc: 'Maximising muscle protein synthesis' },
                      { label: 'Training nutrition', desc: 'Fueling the work — pre and post-workout' },
                    ].map((item) => (
                      <li key={item.label}>
                        <button
                          onClick={scrollToFaq}
                          className="group text-left w-full py-2 cursor-pointer"
                        >
                          <span className="group-hover:text-foreground transition-colors">{item.label}</span>
                          <span className="block text-xs text-muted-foreground/60 mt-0.5">{item.desc}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-8 border-t border-border text-muted-foreground text-xs sm:text-sm gap-3 sm:gap-4">
                <div>© 2026 MacroIQ. All rights reserved.</div>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <a href="#" className="hover:text-foreground transition-colors">Privacy policy</a>
                  <span className="hidden sm:inline">·</span>
                  <a href="#" className="hover:text-foreground transition-colors">Terms of service</a>
                  <span className="hidden sm:inline">·</span>
                  <a href="#" className="hover:text-foreground transition-colors">Cookie settings</a>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {/* ── CALCULATOR (input + results) ── */}
        {(view === 'input' || view === 'results') && (
          <motion.div
            key="calculator"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28 }}
            className="min-h-screen flex flex-col"
          >
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full">
                <button
                  onClick={() => setView('landing')}
                  className="font-display text-xl sm:text-2xl tracking-wide text-primary cursor-pointer"
                  data-testid="button-logo-home"
                >
                  MacroIQ
                </button>
                <button
                  onClick={() => setView('landing')}
                  className="flex items-center gap-2 border border-border text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-secondary transition-colors cursor-pointer text-[#e2ddd4] bg-[#221c16]"
                  data-testid="button-back-home"
                >
                  ← Back to home
                </button>
              </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-start py-6 sm:py-8 px-3 sm:px-4 w-full">
              <div className="w-full max-w-4xl">
                <AnimatePresence mode="wait">
                  {view === 'input' ? (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.24 }}
                    >
                      <InputScreen initialData={inputs} onCalculate={handleCalculate} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.28 }}
                    >
                      <ResultsScreen inputs={inputs} onRecalculate={handleRecalculate} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
