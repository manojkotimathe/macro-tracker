import React, { useState, useMemo, useEffect } from 'react';
import { CalculatorInputs, calculateMacros, MacroProfile } from '@/lib/calculator';
import { Slider } from '@/components/ui/slider';
import { AnimatedNumber } from '@/components/animated-number';
import { Info, ArrowLeft, Flame, Beef, Wheat, Droplets, Leaf } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultsScreenProps {
  inputs: CalculatorInputs;
  onRecalculate: () => void;
}

export function ResultsScreen({ inputs, onRecalculate }: ResultsScreenProps) {
  const [proteinGperKg, setProteinGperKg] = useState(2.2);
  const [fatPct, setFatPct] = useState(0.25);
  const [macroProfile, setMacroProfile] = useState<MacroProfile>('athletic');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const results = useMemo(() => {
    return calculateMacros(inputs, proteinGperKg, fatPct, macroProfile);
  }, [inputs, proteinGperKg, fatPct, macroProfile]);

  const hasBodyFat = inputs.bodyFat !== undefined && inputs.bodyFat !== null && !Number.isNaN(inputs.bodyFat) && inputs.bodyFat > 0;
  
  let weight_kg = inputs.weight;
  if (inputs.unitSystem === 'imperial') {
    weight_kg = inputs.weight / 2.2046;
  }
  const baseWeight_kg = hasBodyFat ? weight_kg * (1 - inputs.bodyFat! / 100) : weight_kg;

  const lbm = hasBodyFat ? inputs.weight * (1 - inputs.bodyFat! / 100) : 0;
  const formulaName = hasBodyFat ? "Katch-McArdle" : "Mifflin-St Jeor";
  
  const weightUnit = inputs.unitSystem === 'metric' ? 'kg' : 'lbs';
  const heightStr = inputs.unitSystem === 'metric'
    ? `${inputs.heightMetric} cm`
    : `${inputs.heightImperialFeet}'${inputs.heightImperialInches}"`;

  const activeProteinGperKg = macroProfile === 'balanced'
    ? (results.proteinG / baseWeight_kg)
    : macroProfile === 'athletic'
      ? 2.2
      : proteinGperKg;

  const activeFatPct = macroProfile === 'balanced'
    ? 0.30
    : macroProfile === 'athletic'
      ? 0.25
      : fatPct;

  // Derived percentages for display
  const totalCals = results.calories;
  const pCals = results.proteinG * 4;
  const fCals = results.fatG * 9;
  const cCals = totalCals - pCals - fCals;
  
  const fiberCals = results.fiberG * 4;
  const netCarbCals = Math.max(0, cCals - fiberCals);

  const pPctDisplay = Math.round((pCals / totalCals) * 100);
  const fPctDisplay = Math.round((fCals / totalCals) * 100);
  const fiberPctDisplay = Math.round((fiberCals / totalCals) * 100);
  const cPctDisplay = 100 - pPctDisplay - fPctDisplay - fiberPctDisplay;

  const chartData = [
    { name: 'Protein', value: pCals, color: 'hsl(var(--chart-1))' },
    { name: 'Net Carbs', value: netCarbCals, color: 'hsl(var(--chart-2))' },
    { name: 'Fat', value: fCals, color: 'hsl(var(--chart-3))' },
    { name: 'Fiber', value: fiberCals, color: 'hsl(var(--chart-4))' },
  ];

  const macroCards = [
    {
      id: 'protein',
      label: 'Protein',
      value: results.proteinG,
      unit: 'g',
      icon: Beef,
      color: 'text-chart-1',
      tooltip: 'Supports muscle maintenance and satiety',
      pct: pPctDisplay
    },
    {
      id: 'carbs',
      label: 'Carbs',
      value: results.carbG,
      unit: 'g',
      icon: Wheat,
      color: 'text-chart-2',
      tooltip: 'Your primary fuel source; auto-calculated from remaining calories',
      pct: cPctDisplay
    },
    {
      id: 'fat',
      label: 'Fat',
      value: results.fatG,
      unit: 'g',
      icon: Droplets,
      color: 'text-chart-3',
      tooltip: 'Essential for hormones and nutrient absorption',
      pct: fPctDisplay
    },
    {
      id: 'fiber',
      label: 'Fiber',
      value: results.fiberG,
      unit: 'g',
      icon: Leaf,
      color: 'text-muted-foreground',
      tooltip: 'Daily target for gut health and satiety',
      pct: null
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground uppercase">Your Targets</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">Dialed in for {inputs.goal.replace(/_/g, ' ')}.</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-secondary-foreground border border-border uppercase tracking-wide">
              BMR Formula: {formulaName}
            </span>
          </div>
        </div>
        <button
          onClick={onRecalculate}
          data-testid="button-recalculate"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Data
        </button>
      </div>

      {/* Biometrics Summary Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-card border border-card-border/60 rounded-xl p-4 text-sm shadow-sm">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gender & Age</div>
          <div className="font-semibold text-foreground capitalize">{inputs.gender}, {inputs.age} yrs</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Weight</div>
          <div className="font-semibold text-foreground">{inputs.weight} {weightUnit}</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Height</div>
          <div className="font-semibold text-foreground">{heightStr}</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Body Fat</div>
          <div className="font-semibold text-accent">{hasBodyFat ? `${inputs.bodyFat}%` : 'N/A'}</div>
        </div>
        <div className="space-y-1 col-span-2 sm:col-span-1 bg-primary/5 p-2 rounded-lg border border-primary/20 sm:p-0 sm:bg-transparent sm:border-0">
          <div className="text-[10px] font-bold text-primary uppercase tracking-wider sm:text-muted-foreground">Lean Body Mass</div>
          <div className="font-bold text-primary">{hasBodyFat ? `${lbm.toFixed(1)} ${weightUnit}` : 'N/A'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          
          {/* Main Calorie Card */}
          <div className="col-span-2 bg-card border border-card-border rounded-xl p-6 shadow-md relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Flame className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center py-6">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Flame className="w-6 h-6" />
                <span className="font-semibold uppercase tracking-wider text-sm">Daily Calories</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-primary transition-colors ml-1">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Your total daily energy target based on your TDEE and goal</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-baseline gap-2">
                <AnimatedNumber value={results.calories} className="text-7xl font-display font-bold text-foreground tracking-tight" />
                <span className="text-xl font-medium text-muted-foreground">kcal</span>
              </div>
            </div>
          </div>

          {/* Macro Cards */}
          {macroCards.map((macro) => (
            <div key={macro.id} className="bg-card border border-card-border rounded-xl p-5 shadow-sm hover:border-border transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`flex items-center gap-2 ${macro.color}`}>
                  <macro.icon className="w-5 h-5" />
                  <span className="font-semibold uppercase tracking-wider text-xs text-foreground">{macro.label}</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{macro.tooltip}</TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                  <AnimatedNumber value={macro.value} className={`text-5xl font-display font-bold tracking-tight ${macro.color}`} />
                  <span className="text-sm font-medium text-muted-foreground">{macro.unit}</span>
                </div>
                {macro.pct !== null && (
                  <div className="text-xs font-medium text-muted-foreground mt-1 bg-secondary/50 inline-block px-2 py-1 rounded w-fit">
                    {macro.pct}% of total
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Chart & Sliders */}
        <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="font-display font-semibold tracking-wide text-lg text-foreground uppercase mb-6 flex items-center gap-2">
            Macro Split
          </h3>
          
          <div className="mb-6 space-y-2">
            <label htmlFor="select-macro-profile" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Profile</label>
            <select
              id="select-macro-profile"
              value={macroProfile}
              onChange={(e) => setMacroProfile(e.target.value as MacroProfile)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="athletic">Profile B (High Protein / Athletic)</option>
              <option value="balanced">Profile A (Balanced 40/30/30)</option>
              <option value="custom">Custom (Enable Sliders)</option>
            </select>
          </div>

          <div className="h-48 w-full mb-8 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend inside the chart */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <div className="text-xs font-medium text-muted-foreground">Ratio</div>
            </div>
          </div>

          <div className="space-y-6 mt-auto">
            {/* Protein Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-1" />
                  Protein Focus
                </label>
                <span className="text-xs font-bold text-chart-1">
                  {activeProteinGperKg.toFixed(1)} g/kg
                  {macroProfile === 'athletic' && ' LBM'}
                  {macroProfile === 'balanced' && ' (30%)'}
                </span>
              </div>
              <Slider
                data-testid="slider-protein"
                min={1.6}
                max={2.4}
                step={0.1}
                value={[activeProteinGperKg]}
                onValueChange={(val) => setProteinGperKg(val[0])}
                disabled={macroProfile !== 'custom'}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1.6g</span>
                <span>2.4g</span>
              </div>
            </div>

            {/* Fat Slider */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-3" />
                  Fat Focus
                </label>
                <span className="text-xs font-bold text-chart-3">{Math.round(activeFatPct * 100)}%</span>
              </div>
              <Slider
                data-testid="slider-fat"
                min={0.20}
                max={0.35}
                step={0.01}
                value={[activeFatPct]}
                onValueChange={(val) => setFatPct(val[0])}
                disabled={macroProfile !== 'custom'}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>20%</span>
                <span>35%</span>
              </div>
            </div>
            
            {macroProfile !== 'custom' && (
              <div className="text-[10px] text-muted-foreground/80 bg-secondary/20 p-2 rounded border border-border/30 text-center">
                Sliders are locked under preset profiles. Switch to <strong>Custom</strong> to adjust.
              </div>
            )}

            {/* Carbs & Fiber Info */}
            <div className="pt-2 border-t border-border/50 space-y-2">
              <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-2" />
                  Carbs (Auto)
                </label>
                <span className="text-xs font-bold text-chart-2">{cPctDisplay}%</span>
              </div>
              <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-4" />
                  Fiber
                </label>
                <span className="text-xs font-bold text-chart-4">{fiberPctDisplay}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 border-t border-border pt-8">
        <p className="text-xs text-muted-foreground/70 max-w-2xl mx-auto uppercase tracking-wider leading-relaxed">
          Disclaimer: These are estimates based on standard formulas. Track your intake and body weight for 2–3 weeks, then adjust calories and macros based on real-world results.
        </p>
      </div>
    </div>
  );
}
