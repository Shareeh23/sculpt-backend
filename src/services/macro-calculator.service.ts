import type { MacroSplit } from "../types/nutrition.types.js";

type MacroRatio = {
  carbs: number;
  fat: number;
  protein: number;
};

const MACRO_SPLITS: Record<MacroSplit, MacroRatio> = {
  "40-30-30": {
    carbs: 0.4,
    fat: 0.3,
    protein: 0.3,
  },

  "50-25-25": {
    carbs: 0.5,
    fat: 0.25,
    protein: 0.25,
  },

  "60-20-20": {
    carbs: 0.6,
    fat: 0.2,
    protein: 0.2,
  },
};

class MacroCalculatorService {
  calculateMacros(calories: number, split: MacroSplit = "40-30-30") {
    const ratios = MACRO_SPLITS[split];

    return {
      carbs: Math.round((calories * ratios.carbs) / 4),

      fat: Math.round((calories * ratios.fat) / 9),

      protein: Math.round((calories * ratios.protein) / 4),
    };
  }

  getMacroSplitOptions(): MacroSplit[] {
    return Object.keys(MACRO_SPLITS) as MacroSplit[];
  }
}

export const macroCalculatorService = new MacroCalculatorService();
