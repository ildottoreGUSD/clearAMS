// School budget data — mirrors SCHOOLS in the main dashboard
export const SCHOOLS = {
  hoover:           { name:"Hoover HS",              fy2526:{allocation:267192.09,staffingBudget:213753.67,suppliesBudget:53438.42,totalExp:335135.21}, fy2425:{allocation:228198.61,staffingBudget:182558.89,suppliesBudget:45639.72,totalExp:46931.62},  fy2324:{allocation:217860.0,staffingBudget:174288.0,suppliesBudget:43572.0,totalExp:0} },
  crescenta:        { name:"CVHS",                   fy2526:{allocation:394550.64,staffingBudget:315640.51,suppliesBudget:78910.13,totalExp:372720.37}, fy2425:{allocation:315327.61,staffingBudget:252262.09,suppliesBudget:63065.52,totalExp:241069.79}, fy2324:{allocation:318306.0,staffingBudget:254644.8,suppliesBudget:63661.2,totalExp:0}  },
  glendale:         { name:"Glendale HS",            fy2526:{allocation:348507.72,staffingBudget:278806.18,suppliesBudget:69701.54,totalExp:346731.24}, fy2425:{allocation:314090.08,staffingBudget:251272.07,suppliesBudget:62818.02,totalExp:164693.34}, fy2324:{allocation:313314.0,staffingBudget:250651.2,suppliesBudget:62662.8,totalExp:0}  },
  clark:            { name:"Clark HS",               fy2526:{allocation:183837.06,staffingBudget:147069.65,suppliesBudget:36767.41,totalExp:66211.04},  fy2425:{allocation:165837.05,staffingBudget:132669.64,suppliesBudget:33167.41,totalExp:12448.15},  fy2324:{allocation:176969.0,staffingBudget:141575.2,suppliesBudget:35393.8,totalExp:0}  },
  roosevelt:        { name:"Roosevelt MS",           fy2526:{allocation:146697.21,staffingBudget:117357.77,suppliesBudget:29339.44,totalExp:162948.08}, fy2425:{allocation:134679.24,staffingBudget:107743.39,suppliesBudget:26935.85,totalExp:112778.71}, fy2324:{allocation:135974.0,staffingBudget:108779.2,suppliesBudget:27194.8,totalExp:0}  },
  rosemont:         { name:"Rosemont MS",            fy2526:{allocation:189708.75,staffingBudget:151767.0,suppliesBudget:37941.75,totalExp:49288.26},  fy2425:{allocation:151431.24,staffingBudget:121144.99,suppliesBudget:30286.25,totalExp:10556.2},  fy2324:{allocation:164029.0,staffingBudget:131223.2,suppliesBudget:32805.8,totalExp:0}  },
  muir:             { name:"Muir ES",                fy2526:{allocation:143845.02,staffingBudget:115076.02,suppliesBudget:28769.0,totalExp:182633.75},  fy2425:{allocation:128631.46,staffingBudget:102905.17,suppliesBudget:25726.29,totalExp:47548.44},  fy2324:{allocation:121619.0,staffingBudget:97295.2,suppliesBudget:24323.8,totalExp:0}   },
  rdwhite:          { name:"R.D. White ES",          fy2526:{allocation:165803.22,staffingBudget:132642.58,suppliesBudget:33160.64,totalExp:0},         fy2425:{allocation:150499.36,staffingBudget:120399.48,suppliesBudget:30099.87,totalExp:3505.14},   fy2324:{allocation:151474.0,staffingBudget:121179.2,suppliesBudget:30294.8,totalExp:0}   },
};

export const YEARS = [
  { key:"fy2526", label:"FY 2025–26", status:"current" },
  { key:"fy2425", label:"FY 2024–25", status:"final"   },
  { key:"fy2324", label:"FY 2023–24", status:"final"   },
];

export const STAFFING_COLOR = "#13315C";
export const SUPPLIES_COLOR = "#3E7BFA";

export const fmt$ = (n) => {
  const abs = Math.abs(Math.round(n)).toLocaleString("en-US", { style:"currency", currency:"USD", maximumFractionDigits:0 });
  return n < 0 ? "−" + abs : abs;
};
