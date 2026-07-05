export type Gender = 'male' | 'female';
export type UnitSystem = 'metric' | 'imperial';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type Goal = 'maintain' | 'mild_weight_loss' | 'moderate_weight_loss' | 'weight_gain' | 'aggressive_gain';
export type MacroProfile = 'balanced' | 'athletic' | 'custom';

export interface CalculatorInputs {
  gender: Gender;
  age: number;
  unitSystem: UnitSystem;
  heightMetric: number; // cm
  heightImperialFeet: number;
  heightImperialInches: number;
  weight: number; // kg or lbs depending on unitSystem
  bodyFat?: number; // Optional body fat percentage (e.g. 15 for 15%)
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface MacroResults {
  calories: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  fiberG: number;
}

export const calculateMacros = (
  inputs: CalculatorInputs,
  proteinGperKg: number = 2.2,
  fatPct: number = 0.25,
  macroProfile: MacroProfile = 'athletic'
): MacroResults => {
  let weight_kg = inputs.weight;
  let height_cm = inputs.heightMetric;

  if (inputs.unitSystem === 'imperial') {
    weight_kg = inputs.weight / 2.2046;
    height_cm = (inputs.heightImperialFeet * 12 + inputs.heightImperialInches) * 2.54;
  }

  // Guard: ensure sane minimums before computing
  weight_kg = Math.max(1, weight_kg);
  height_cm = Math.max(50, height_cm);

  const hasBodyFat = inputs.bodyFat !== undefined && inputs.bodyFat !== null && !Number.isNaN(inputs.bodyFat) && inputs.bodyFat > 0;
  const lbm_kg = hasBodyFat ? weight_kg * (1 - (inputs.bodyFat! / 100)) : weight_kg;

  // 1. BMR Selection
  let bmr = 0;
  if (hasBodyFat) {
    // Katch-McArdle Formula
    bmr = 370 + 21.6 * lbm_kg;
  } else {
    // Mifflin-St Jeor Formula
    if (inputs.gender === 'male') {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * inputs.age + 5;
    } else {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * inputs.age - 161;
    }
  }

  // Guard BMR: physiologically ~500 kcal minimum
  const safeBmr = Math.max(500, bmr);

  // 2. Precision TDEE Multipliers
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  const multiplier = multipliers[inputs.activityLevel] || 1.2;
  const tdee = safeBmr * multiplier;

  // 3. Dynamic Goal Adjustments
  let targetCalories = tdee;
  if (inputs.goal === 'mild_weight_loss') {
    targetCalories = tdee - 250;
  } else if (inputs.goal === 'moderate_weight_loss') {
    targetCalories = tdee - 500;
  } else if (inputs.goal === 'weight_gain') {
    targetCalories = tdee + 250;
  } else if (inputs.goal === 'aggressive_gain') {
    targetCalories = tdee + 500;
  }

  // Guard: never below 1000 kcal (safe clinical minimum)
  targetCalories = Math.max(1000, targetCalories);

  // 4. Macro Profiles
  let proteinG = 0;
  let fatG = 0;
  let carbG = 0;

  if (macroProfile === 'balanced') {
    // Balanced (Profile A): 30% Protein, 30% Fat, 40% Carbs
    proteinG = (targetCalories * 0.30) / 4;
    fatG = (targetCalories * 0.30) / 9;
    carbG = (targetCalories * 0.40) / 4;
  } else if (macroProfile === 'athletic') {
    // High Protein / Athletic (Profile B): 2.2g per kg LBM (or total body weight if body fat missing), 25% fats, remaining carbs
    const baseWeight = hasBodyFat ? lbm_kg : weight_kg;
    proteinG = baseWeight * 2.2;
    fatG = (targetCalories * 0.25) / 9;
    carbG = (targetCalories - proteinG * 4 - fatG * 9) / 4;
  } else {
    // Custom: proteinGperKg and fatPct from user
    const baseWeight = hasBodyFat ? lbm_kg : weight_kg;
    proteinG = baseWeight * proteinGperKg;
    fatG = (targetCalories * fatPct) / 9;
    carbG = (targetCalories - proteinG * 4 - fatG * 9) / 4;
  }

  // Clamp macronutrient targets to positive numbers
  proteinG = Math.max(0, proteinG);
  fatG = Math.max(0, fatG);
  carbG = Math.max(0, carbG);

  // Fiber: higher of age/sex baseline or calorie-scaled target
  let baseTarget = 0;
  if (inputs.gender === 'male') {
    baseTarget = inputs.age < 50 ? 38 : 30;
  } else {
    baseTarget = inputs.age < 50 ? 25 : 21;
  }
  const scaledTarget = (targetCalories / 1000) * 14;
  const fiberG = Math.max(baseTarget, scaledTarget);

  return {
    calories: Math.round(targetCalories),
    proteinG: Math.round(proteinG),
    fatG: Math.round(fatG),
    carbG: Math.round(carbG),
    fiberG: Math.round(fiberG),
  };
};
