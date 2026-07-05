import React, { useState, useEffect } from 'react';
import { CalculatorInputs, Gender, UnitSystem, ActivityLevel, Goal } from '@/lib/calculator';
import { Ruler, Weight, User, ActivitySquare, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputScreenProps {
  initialData: CalculatorInputs;
  onCalculate: (inputs: CalculatorInputs) => void;
}

function convertToImperial(inputs: CalculatorInputs): CalculatorInputs {
  // weight: kg → lbs
  const lbs = parseFloat((inputs.weight * 2.2046).toFixed(1));
  // height: cm → ft + in
  const totalInches = inputs.heightMetric / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return {
    ...inputs,
    unitSystem: 'imperial',
    weight: lbs,
    heightImperialFeet: feet,
    heightImperialInches: inches,
  };
}

function convertToMetric(inputs: CalculatorInputs): CalculatorInputs {
  // weight: lbs → kg
  const kg = parseFloat((inputs.weight / 2.2046).toFixed(1));
  // height: ft + in → cm
  const cm = Math.round((inputs.heightImperialFeet * 12 + inputs.heightImperialInches) * 2.54);
  return {
    ...inputs,
    unitSystem: 'metric',
    weight: kg,
    heightMetric: cm,
  };
}

export function InputScreen({ initialData, onCalculate }: InputScreenProps) {
  const [inputs, setInputs] = useState<CalculatorInputs>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof CalculatorInputs, string>>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const validate = () => {
    const newErrors: Partial<Record<keyof CalculatorInputs, string>> = {};
    if (inputs.age < 13 || inputs.age > 100) newErrors.age = "Age must be between 13 and 100";

    if (inputs.unitSystem === 'metric') {
      if (inputs.heightMetric < 100 || inputs.heightMetric > 250) newErrors.heightMetric = "Valid height is 100–250 cm";
      if (inputs.weight < 20 || inputs.weight > 300) newErrors.weight = "Valid weight is 20–300 kg";
    } else {
      if (inputs.heightImperialFeet < 3 || inputs.heightImperialFeet > 8) newErrors.heightImperialFeet = "Valid feet is 3–8";
      if (inputs.heightImperialInches < 0 || inputs.heightImperialInches >= 12) newErrors.heightImperialInches = "Inches 0–11";
      if (inputs.weight < 45 || inputs.weight > 660) newErrors.weight = "Valid weight is 45–660 lbs";
    }

    if (inputs.bodyFat !== undefined && inputs.bodyFat !== null && !Number.isNaN(inputs.bodyFat)) {
      if (inputs.bodyFat < 2 || inputs.bodyFat > 70) {
        newErrors.bodyFat = "Body fat must be between 2% and 70%";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onCalculate(inputs);
    }
  };

  const handleUnitToggle = (next: UnitSystem) => {
    if (next === inputs.unitSystem) return;
    if (next === 'imperial') {
      setInputs(convertToImperial(inputs));
    } else {
      setInputs(convertToMetric(inputs));
    }
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">

      {/* Basics Section */}
      <section className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <User className="w-5 h-5" aria-hidden="true" />
          <h2 className="font-display font-semibold tracking-wide text-xl text-foreground uppercase">Basics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label id="gender-label" className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">Gender</label>
            <div
              role="radiogroup"
              aria-labelledby="gender-label"
              className="flex bg-background border border-border p-1 rounded-lg"
            >
              {(['male', 'female'] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={inputs.gender === g}
                  data-testid={`gender-${g}`}
                  onClick={() => setInputs({ ...inputs, gender: g })}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize",
                    inputs.gender === g ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="input-age" className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">Age</label>
            <input
              id="input-age"
              type="number"
              data-testid="input-age"
              value={inputs.age || ''}
              min={13}
              max={100}
              onChange={(e) => setInputs({ ...inputs, age: parseInt(e.target.value) || 0 })}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                errors.age && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.age && <p role="alert" className="text-destructive text-xs font-medium">{errors.age}</p>}
          </div>
        </div>
      </section>

      {/* Body Metrics Section */}
      <section className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-primary">
            <Ruler className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-display font-semibold tracking-wide text-xl text-foreground uppercase">Metrics</h2>
          </div>
          <div
            role="radiogroup"
            aria-label="Unit system"
            className="flex bg-background border border-border p-1 rounded-lg w-64"
          >
            {([
              { id: 'imperial' as UnitSystem, label: 'Feet / Lbs' },
              { id: 'metric' as UnitSystem, label: 'Centimetres / Kgs' },
            ]).map((u) => (
              <button
                key={u.id}
                type="button"
                role="radio"
                aria-checked={inputs.unitSystem === u.id}
                data-testid={`unit-${u.id}`}
                onClick={() => handleUnitToggle(u.id)}
                className={cn(
                  "flex-1 py-1 text-xs font-medium rounded-md transition-colors",
                  inputs.unitSystem === u.id ? "bg-secondary text-foreground shadow" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">Height</label>
            {inputs.unitSystem === 'metric' ? (
              <div>
                <div className="relative">
                  <input
                    id="input-height-metric"
                    type="number"
                    data-testid="input-height-metric"
                    aria-label="Height in centimetres"
                    value={inputs.heightMetric || ''}
                    min={100}
                    max={250}
                    onChange={(e) => setInputs({ ...inputs, heightMetric: parseInt(e.target.value) || 0 })}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      errors.heightMetric && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-medium text-muted-foreground" aria-hidden="true">cm</span>
                </div>
                {errors.heightMetric && <p role="alert" className="text-destructive text-xs font-medium mt-1.5">{errors.heightMetric}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <input
                      id="input-height-ft"
                      type="number"
                      data-testid="input-height-ft"
                      aria-label="Height feet"
                      value={inputs.heightImperialFeet || ''}
                      min={3}
                      max={8}
                      onChange={(e) => setInputs({ ...inputs, heightImperialFeet: parseInt(e.target.value) || 0 })}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        errors.heightImperialFeet && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-medium text-muted-foreground" aria-hidden="true">ft</span>
                  </div>
                  {errors.heightImperialFeet && <p role="alert" className="text-destructive text-xs font-medium mt-1.5">{errors.heightImperialFeet}</p>}
                </div>
                <div>
                  <div className="relative">
                    <input
                      id="input-height-in"
                      type="number"
                      data-testid="input-height-in"
                      aria-label="Height inches"
                      value={inputs.heightImperialInches || ''}
                      min={0}
                      max={11}
                      onChange={(e) => setInputs({ ...inputs, heightImperialInches: parseInt(e.target.value) || 0 })}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        errors.heightImperialInches && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-medium text-muted-foreground" aria-hidden="true">in</span>
                  </div>
                  {errors.heightImperialInches && <p role="alert" className="text-destructive text-xs font-medium mt-1.5">{errors.heightImperialInches}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="input-weight" className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">Weight</label>
            <div className="relative">
              <input
                id="input-weight"
                type="number"
                data-testid="input-weight"
                value={inputs.weight || ''}
                onChange={(e) => setInputs({ ...inputs, weight: parseFloat(e.target.value) || 0 })}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  errors.weight && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <span className="absolute right-3 top-2.5 text-xs font-medium text-muted-foreground" aria-hidden="true">
                {inputs.unitSystem === 'metric' ? 'kg' : 'lbs'}
              </span>
            </div>
            {errors.weight && <p role="alert" className="text-destructive text-xs font-medium">{errors.weight}</p>}
          </div>

          <div className="space-y-3">
            <label htmlFor="input-bodyfat" className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">Body Fat %</label>
            <div className="relative">
              <input
                id="input-bodyfat"
                type="number"
                data-testid="input-bodyfat"
                placeholder="Optional (e.g. 15)"
                value={inputs.bodyFat || ''}
                min={2}
                max={70}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputs({ ...inputs, bodyFat: val === '' ? undefined : parseFloat(val) });
                }}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  errors.bodyFat && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <span className="absolute right-3 top-2.5 text-xs font-medium text-muted-foreground" aria-hidden="true">%</span>
            </div>
            {errors.bodyFat && <p role="alert" className="text-destructive text-xs font-medium">{errors.bodyFat}</p>}
          </div>
        </div>
      </section>

      {/* Activity Section */}
      <section className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <ActivitySquare className="w-5 h-5" aria-hidden="true" />
          <h2 id="activity-label" className="font-display font-semibold tracking-wide text-xl text-foreground uppercase">Activity Level</h2>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="activity-label"
          className="grid grid-cols-1 gap-3"
        >
          {[
            { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little or no exercise' },
            { id: 'lightly_active', label: 'Lightly Active', desc: 'Light exercise 1–3 days/week' },
            { id: 'moderately_active', label: 'Moderately Active', desc: 'Moderate exercise 4–5 days/week' },
            { id: 'very_active', label: 'Very Active', desc: 'Intense exercise 6–7 days/week' },
          ].map((act) => (
            <button
              key={act.id}
              type="button"
              role="radio"
              aria-checked={inputs.activityLevel === act.id}
              data-testid={`activity-${act.id}`}
              onClick={() => setInputs({ ...inputs, activityLevel: act.id as ActivityLevel })}
              className={cn(
                "flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border text-left transition-all",
                inputs.activityLevel === act.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-background hover:border-muted-foreground/30 hover:bg-muted/30"
              )}
            >
              <span className={cn(
                "font-semibold text-sm md:text-base",
                inputs.activityLevel === act.id ? "text-primary" : "text-foreground"
              )}>{act.label}</span>
              <span className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-0">{act.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Goal Section */}
      <section className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <Target className="w-5 h-5" aria-hidden="true" />
          <h2 id="goal-label" className="font-display font-semibold tracking-wide text-xl text-foreground uppercase">Primary Goal</h2>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="goal-label"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3"
        >
          {[
            { id: 'maintain', label: 'Maintain', desc: 'TDEE baseline' },
            { id: 'mild_weight_loss', label: 'Mild Loss', desc: '−250 kcal/day' },
            { id: 'moderate_weight_loss', label: 'Moderate Loss', desc: '−500 kcal/day' },
            { id: 'weight_gain', label: 'Weight Gain', desc: '+250 kcal/day' },
            { id: 'aggressive_gain', label: 'Aggressive Gain', desc: '+500 kcal/day' },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={inputs.goal === g.id}
              data-testid={`goal-${g.id}`}
              onClick={() => setInputs({ ...inputs, goal: g.id as Goal })}
              className={cn(
                "flex flex-col p-4 rounded-lg border transition-all text-center h-full justify-between gap-1",
                inputs.goal === g.id
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-background hover:border-muted-foreground/30 hover:bg-muted/30"
              )}
            >
              <span className={cn(
                "font-semibold text-sm md:text-base",
                inputs.goal === g.id ? "text-primary" : "text-foreground"
              )}>{g.label}</span>
              <span className="text-xs text-muted-foreground">{g.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <button
        type="submit"
        data-testid="button-calculate"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-2xl uppercase tracking-wider py-5 rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        Calculate My Macros
      </button>

    </form>
  );
}
