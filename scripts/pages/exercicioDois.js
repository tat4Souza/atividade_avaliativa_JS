import { renderReportTemplate } from "../utils/reportTemplate.js";
import {
  formRegistrationTemplate,
  formSettingTemplate,
  handleFinishForms,
} from "../utils/formTemplate.js";
import {
  formatCategory,
  formatPrice,
  formatShift,
} from "../utils/formatFunctions.js";
import { alterComponentVisibility, showMessage } from "../utils/helpers.js";

const renderProperties = [
  { htmlId: "rep-total", data: "total" },
  { htmlId: "rep-wage-avg", data: "mediumWages", formatFunc: formatPrice },
  { htmlId: "rep-wage-e", data: "mediumWagesE", formatFunc: formatPrice },
  { htmlId: "rep-wage-m", data: "mediumWagesM", formatFunc: formatPrice },
  { htmlId: "rep-high-id", data: (report) => report.highestWage.code },
  {
    htmlId: "rep-high-cat",
    data: (report) => report.highestWage.category,
    formatFunc: formatCategory,
  },
  {
    htmlId: "rep-high-shift",
    data: (report) => report.highestWage.shift,
    formatFunc: formatShift,
  },
  {
    htmlId: "rep-high-wage",
    data: (report) => report.highestWage.wage,
    formatFunc: formatPrice,
  },
  { htmlId: "rep-low-id", data: (report) => report.lowestWage.code },
  {
    htmlId: "rep-low-cat",
    data: (report) => report.lowestWage.category,
    formatFunc: formatCategory,
  },
  {
    htmlId: "rep-low-shift",
    data: (report) => report.lowestWage.shift,
    formatFunc: formatShift,
  },
  {
    htmlId: "rep-low-wage",
    data: (report) => report.lowestWage.wage,
    formatFunc: formatPrice,
  },
  { htmlId: "rep-bonus-10", data: "bonus10" },
  { htmlId: "rep-bonus-5", data: "bonus5" },
  { htmlId: "rep-bonus-2", data: "bonus2" },
  { htmlId: "rep-bonus-0", data: "bonus0" },
];

export function init() {
  const setContainer = document.getElementById("settingsFormContainer");
  const empContainer = document.getElementById("employeeFormContainer");
  const empForm = document.getElementById("employeesForm");

  const sectionForms = document.getElementById("sectionForms");
  const sectionReports = document.getElementById("sectionReports");

  const setMessage = document.getElementById("formMessageSetting");
  const empMessage = document.getElementById("formMessageEmployee");

  const btnReport = document.getElementById("btnFinishForm");

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

  formSettingTemplate(
    setupConfig,
    setContainer,
    empContainer,
    setMessage,
    (data) => {
      minWageValue = parseFloat(data.minWage);
    },
  );

  formRegistrationTemplate(
    registrationConfig,
    empForm,
    empMessage,
    employeesList,
  );

  handleFinishForms(
    btnReport,
    employeesList,
    empMessage,
    sectionForms,
    sectionReports,
    generateReport,
    renderProperties,
  );
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
  let sumWages = 0;
  let sumWagesE = 0;
  let countE = 0;
  let sumWagesM = 0;
  let countM = 0;
  let bonus10 = 0;
  let bonus5 = 0;
  let bonus2 = 0;
  let bonus0 = 0;

  let highWage = 0;
  let lowWage = Infinity;
  let highestWage = { code: "", category: "", shift: "", wage: 0 };
  let lowestWage = { code: "", category: "", shift: "", wage: 0 };

  for (let employee of list) {
    sumWages += employee.finalWage;

    switch (employee.category) {
      case "opt1":
        sumWagesE += employee.finalWage;
        countE += 1;
        break;
      case "opt2":
        sumWagesM += employee.finalWage;
        countM += 1;
        break;
    }

    if (employee.bonus >= 9.0) {
      bonus10 += 1;
    } else if (employee.bonus >= 7.0) {
      bonus5 += 1;
    } else if (employee.bonus >= 5) {
      bonus2 += 1;
    } else {
      bonus0 += 1;
    }

    if (employee.finalWage > highWage) {
      highWage = employee.finalWage;
      highestWage = {
        code: employee.id,
        category: employee.category,
        shift: employee.shift,
        wage: employee.finalWage,
      };
    }

    if (employee.finalWage < lowWage) {
      lowWage = employee.finalWage;
      lowestWage = {
        code: employee.id,
        category: employee.category,
        shift: employee.shift,
        wage: employee.finalWage,
      };
    }
  }

  const mediumWages = list.length > 0 ? sumWages / list.length : 0;
  const mediumWagesE = list.length > 0 ? sumWagesE / countE : 0;
  const mediumWagesM = list.length > 0 ? sumWagesM / countM : 0;

  return {
    total: list.length,
    mediumWages,
    mediumWagesE,
    mediumWagesM,
    highestWage,
    lowestWage,
    bonus10,
    bonus5,
    bonus2,
    bonus0,
  };
}
