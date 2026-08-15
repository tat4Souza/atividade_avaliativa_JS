import {
  alterComponentVisibility,
  formatPrice,
  showMessage,
} from "../utils/helpers.js";

export function init() {
  const settingsFormContainer = document.getElementById(
    "settingsFormContainer",
  );
  const employeeFormContainer = document.getElementById(
    "employeeFormContainer",
  );
  const employeesForm = document.getElementById("employeesForm");

  const sectionForms = document.getElementById("sectionForms");
  const sectionReports = document.getElementById("sectionReports");

  const settingsMessage = document.getElementById("formMessageSetting");
  const employeesMessage = document.getElementById("formMessageEmployee");

  const btnFinishForm = document.getElementById("btnFinishForm");

  let minWageValue = 0;
  let isFinished = false;
  const employeesList = [];

  settingsFormContainer.addEventListener("submit", (e) => {
    e.preventDefault();

    const minWage = document.getElementById("minWage").value;

    if (minWage === "") {
      showMessage(
        settingsMessage,
        "Por favor, digite um salário mínimo para prosseguir!",
      );
      return;
    }

    alterComponentVisibility(settingsFormContainer, employeeFormContainer);

    minWageValue = minWage;
  });

  if (btnFinishForm) {
    btnFinishForm.addEventListener("click", () => {
      alterComponentVisibility(sectionForms, sectionReports);
      isFinished = true;
    });
  }

  employeeFormContainer.addEventListener("submit", (e) => {
    e.preventDefault();

    const employeeData = {
      id: document.getElementById("emp_code").value.trim(),
      hours: document.getElementById("emp_hours").value,
      category: document.getElementById("emp_category").value,
      shift: document.getElementById("emp_shift").value,
      bonus: document.getElementById("emp_performance").value,
      food: document.getElementById("emp_food").value,
      get finalWage() {
        return calcWage(
          minWageValue,
          this.hours,
          this.category,
          this.shift,
          this.food,
          this.bonus,
        );
      },
    };

    if (employeesList.some((employee) => employee.id === employeeData.id)) {
      showMessage(employeesMessage, "Um funcionário com esse id já existe!");
      return;
    }

    if (employeeData.bonus === "") {
      showMessage(
        employeesMessage,
        "Por favor, preencha a avaliação de performance!",
      );
      return;
    }

    employeesList.push(employeeData);
    employeesForm.reset();
    employeesMessage.classList.remove("viewComponent");
    employeesMessage.classList.add("hideComponent");
  });

  if (btnFinishForm) {
    btnFinishForm.addEventListener("click", () => {
      if (employeesList.length === 0) {
        showMessage(
          employeesMessage,
          "Cadastre pelo menos um funcionário antes de gerar o relatório!",
        );
        return;
      }

      alterComponentVisibility(sectionForms, sectionReports);

      const finalReport = generateReport(employeesList);
      renderReport(finalReport);
    });
  }
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

function renderReport(report) {
  const total = document.getElementById("total");
  const mediumWage = document.getElementById("mediumWage");
  const mediumWageE = document.getElementById("mediumWageE");
  const mediumWageM = document.getElementById("mediumWageM");

  const highId = document.getElementById("highId");
  const highCategory = document.getElementById("highCategory");
  const highShift = document.getElementById("highShift");
  const highWage = document.getElementById("highWage");

  const lowId = document.getElementById("lowId");
  const lowCategory = document.getElementById("lowCategory");
  const lowShift = document.getElementById("lowShift");
  const lowWage = document.getElementById("lowWage");

  const bonus10 = document.getElementById("bonus10");
  const bonus5 = document.getElementById("bonus5");
  const bonus2 = document.getElementById("bonus2");
  const bonus0 = document.getElementById("bonus0");

  total.innerText = report.total;
  mediumWage.innerText = formatPrice(report.mediumWages);
  mediumWageE.innerText = formatPrice(report.mediumWagesE);
  mediumWageM.innerText = formatPrice(report.mediumWagesM);

  highId.innerText = report.highestWage.code;
  highCategory.innerText =
    report.highestWage.category === "opt1"
      ? "Funcionário Operacional"
      : "Gerente";
  highShift.innerText =
    report.highestWage.shift === "opt1"
      ? "Matutino"
      : report.highestWage.shift === "opt2"
        ? "Vespertino"
        : "Noturno";
  highWage.innerText = formatPrice(report.highestWage.wage);

  lowId.innerText = report.lowestWage.code;
  lowCategory.innerText =
    report.lowestWage.category === "opt1"
      ? "Funcionário Operacional"
      : "Gerente";
  lowShift.innerText =
    report.lowestWage.shift === "opt1"
      ? "Matutino"
      : report.lowestWage.shift === "opt2"
        ? "Vespertino"
        : "Noturno";
  lowWage.innerText = formatPrice(report.lowestWage.wage);

  bonus10.innerText = report.bonus10;
  bonus5.innerText = report.bonus5;
  bonus2.innerText = report.bonus2;
  bonus0.innerText = report.bonus0;
}
