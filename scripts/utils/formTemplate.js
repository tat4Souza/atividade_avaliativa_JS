import {
  alterComponentVisibility,
  hideMessage,
  showMessage,
} from "./helpers.js";
import { renderReportTemplate } from "./reportTemplate.js";

export function formSettingTemplate(fieldsConfig, onSuccess) {
  const setContainer = document.getElementById("settingsFormContainer");
  const regContainer = document.getElementById("registrationFormContainer");
  const messageLabel = document.getElementById("formMessageSetting");

  setContainer.addEventListener("submit", (e) => {
    e.preventDefault();

    const collectedData = {};
    let hasEmptyField = false;

    for (const [key, config] of Object.entries(fieldsConfig)) {
      const field = document.getElementById(config.htmlId);
      if (!field) continue;

      const value =
        config.type === "checkbox" ? field.checked : field.value.trim();

      if (value === "") {
        hasEmptyField = true;
      }

      collectedData[key] = value;
    }

    if (hasEmptyField) {
      showMessage(messageLabel, "Por favor, preencha todos os campos!");
      return;
    }

    alterComponentVisibility(setContainer, regContainer);

    if (typeof onSuccess === "function") {
      onSuccess(collectedData);
    }
  });
}

export function formRegistrationTemplate(fieldsConfig, dataList) {
  const form = document.getElementById("registrationForm");
  const messageLabel = document.getElementById("formMessageRegistration");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const collectedData = {};

    for (const [key, config] of Object.entries(fieldsConfig.fields)) {
      const field = document.getElementById(config.htmlId);

      if (!field) continue;

      const value =
        config.type === "checkbox" ? field.checked : field.value.trim();

      if (config.required !== undefined && value === "") {
        showMessage(
          messageLabel,
          `Por favor, preencha o campo de ${config.required}`,
        );
        return;
      }

      collectedData[key] = value;
    }

    if (dataList.some((item) => item.id === collectedData.id)) {
      showMessage(messageLabel, "Um cadastro com esse id já existe!");
      return;
    }

    const listItem = fieldsConfig.calculate(collectedData);
    dataList.push(listItem);

    form.reset();
    hideMessage(messageLabel);
  });
}

export function handleFinishForms(dataList, genReport, renderProperties) {
  const btnFinish = document.getElementById("btnFinishForm");
  const sectionForms = document.getElementById("sectionForms");
  const sectionReports = document.getElementById("sectionReports");
  const messageLabel = document.getElementById("formMessageRegistration");

  if (btnFinish) {
    btnFinish.addEventListener("click", () => {
      if (dataList.length === 0) {
        showMessage(
          messageLabel,
          "Faça pelo menos um cadastro antes de gerar o relatório!",
        );
        return;
      }

      alterComponentVisibility(sectionForms, sectionReports);

      const report = typeof genReport === "function" ? genReport(dataList) : {};
      renderReportTemplate(report, renderProperties);
    });
  }
}
