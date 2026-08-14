import { alterComponentVisibility, showMessage } from "../utils/helpers.js";

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
      performance: document.getElementById("emp_performance").value,
      hoursValue: document.getElementById("emp_hours_value").value,
      food: document.getElementById("emp_food").value,
      bonus: document.getElementById("emp_bonus").value,
      //   get totalWage() {
      //     return calcEmpWage(
      //       this.quantity,
      //       this.region,
      //       this.distance,
      //       this.hasTracking,
      //       gasPrice,
      //     );
      //   },
    };

    if (employeesList.some((employee) => employee.id === employeeData.id)) {
      showMessage(employeesMessage, "Um funcionário com esse id já existe!");
      return;
    }

    employeesList.push(employeeData);
    employeesForm.reset();
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
      console.log("Relatório gerado para a lista:", employeesList);

      // const finalReport = generateReport(employeesList, minWageValue);
      // renderReport(finalReport);
    });
  }
}
