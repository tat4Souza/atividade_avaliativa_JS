import { renderReportTemplate } from "../utils/reportTemplate.js";
import {
  formRegistrationTemplate,
  formSettingTemplate,
  handleFinishForms,
} from "../utils/formTemplate.js";
import {
  formatCategory,
  formatEmployeesAvg,
  formatEmployeesBonus,
  formatEmployeesExtreme,
  formatPrice,
  formatShift,
} from "../utils/formatFunctions.js";
import {
  alterComponentVisibility,
  avgBy,
  countBy,
  extremeBy,
  showMessage,
} from "../utils/helpers.js";

export function init() {
  let minWageValue = 0;
  const employeesList = [];

  const setupConfig = {
    minWage: { htmlId: "minWage", type: "number" },
  };

  const registrationConfig = {
    fields: {
      id: { htmlId: "emp-id" },
      hours: { htmlId: "emp-hours" },
      category: { htmlId: "emp-cat" },
      shift: { htmlId: "emp-shift" },
      bonus: { htmlId: "emp-perf", required: "avaliação" },
      food: { htmlId: "emp-food" },
    },
    calculate: (data) => ({
      ...data,
      finalWage: calcWage(
        minWageValue,
        data.hours,
        data.category,
        data.shift,
        data.food,
        data.bonus,
      ),
    }),
  };

  formSettingTemplate(setupConfig, (data) => {
    minWageValue = parseFloat(data.minWage);
  });

  formRegistrationTemplate(registrationConfig, employeesList);

  handleFinishForms(employeesList, generateReport, renderProperties);
}

function calcWage(minWage, hours, selectedCatgory, selectedShift, food, bonus) {
  const categoryType = { opt1: "Funcionário", opt2: "Gerente" };
  const shift = { opt1: "Matutino", opt2: "Vespertino", opt3: "Noturno" };

  const shiftType = {
    Funcionário: { Matutino: 0.1, Vespertino: 0.15, Noturno: 0.2 },
    Gerente: { Matutino: 0.3, Vespertino: 0.35, Noturno: 0.4 },
  };

  const workPercentage =
    shiftType[categoryType[selectedCatgory]]?.[shift[selectedShift]] || 0;

  const hoursValue = minWage * workPercentage;
  const initialWage = parseFloat(hours) * hoursValue;

  const numFood = parseFloat(food);
  let foodAllowance = 0;

  if (numFood <= 800.0) {
    foodAllowance = initialWage * 0.25;
  } else if (numFood > 800.0 && food <= 1200) {
    foodAllowance = initialWage * 0.2;
  } else {
    foodAllowance = initialWage * 0.15;
  }

  const numBonus = parseFloat(bonus);
  let bonusValue = 0;

  if (numBonus >= 9.0) {
    bonusValue = initialWage * 0.1;
  } else if (numBonus >= 7.0) {
    bonusValue = initialWage * 0.05;
  } else if (numBonus >= 5) {
    bonusValue = initialWage * 0.02;
  } else {
    bonusValue = 0;
  }

  return initialWage + foodAllowance + bonusValue;
}

function generateReport(list) {
  const mediumWages = {
    avg: avgBy(list, "finalWage"),
    avgEmp: avgBy(
      list.filter((e) => e.category === "opt1"),
      "finalWage",
    ),
    avgMan: avgBy(
      list.filter((e) => e.category === "opt2"),
      "finalWage",
    ),
  };

  const highestWage = extremeBy(list, "finalWage");
  const lowestWage = extremeBy(list, "finalWage", "min");

  const bonus = {
    bonus10: countBy(list, (p) => p.bonus >= 9.0),
    bonus5: countBy(list, (p) => p.bonus >= 7.0 && p.bonus < 9.0),
    bonus2: countBy(list, (p) => p.bonus >= 5.0 && p.bonus < 7.0),
    bonus0: countBy(list, (p) => p.bonus < 5.0),
  };

  return {
    total: list.length,
    mediumWages,
    highestWage,
    lowestWage,
    bonus,
  };
}

const renderProperties = [
  { htmlId: "rep-total", data: "total" },
  {
    htmlId: "rep-avg",
    data: (rep) => rep.mediumWages,
    formatFunc: formatEmployeesAvg,
  },
  {
    htmlId: "rep-high",
    data: (rep) => rep.highestWage,
    formatFunc: formatEmployeesExtreme,
  },
  {
    htmlId: "rep-low",
    data: (rep) => rep.lowestWage,
    formatFunc: formatEmployeesExtreme,
  },
  {
    htmlId: "rep-bonus",
    data: (rep) => rep.bonus,
    formatFunc: formatEmployeesBonus,
  },
];
