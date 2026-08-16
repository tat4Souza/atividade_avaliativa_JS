export function renderReportTemplate(dataObj, renderProperties) {
  for (const config of renderProperties) {
    const element = document.getElementById(config.htmlId);
    if (!element) continue;

    const value =
      typeof config.data === "function"
        ? config.data(dataObj)
        : dataObj[config.data];

    const finalValue =
      typeof config.formatFunc === "function"
        ? config.formatFunc(value)
        : (value ?? "Não definido");

    element.innerHTML = finalValue;
  }
}
