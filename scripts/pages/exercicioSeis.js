import {
  formRegistrationTemplate,
  formSettingTemplate,
  handleFinishForms,
} from "../utils/formTemplate";

const renderProperties = [];

export function init() {
  const setupConfig = {};

  const registrationConfig = {};

  formSettingTemplate();

  formRegistrationTemplate();

  handleFinishForms();
}

function calcReserv() {}

function generateReport(list) {}
