export class CustomInput extends HTMLElement {
  connectedCallback() {
    const inputId = this.getAttribute("name") || "";
    const title = this.getAttribute("title") || "";
    const type = this.getAttribute("type") || "text";
    const options = this.getAttribute("options") || "";
    const optionsList = options
      ? options.split(",").map((opt) => opt.trim())
      : [];

    const renderInputField = () => {
      switch (type) {
        case "number":
          return `<input type="number" id="${inputId}" placeholder="${title}" />`;
        case "select":
          const optionsHTML = optionsList
            .map((opt, i) => `<option value="opt${i + 1}">${opt}</option>`)
            .join("");
          return `
            <select name="${inputId}" id="${inputId}">
              <option value="" disabled selected>Selecione uma opção</option>
              ${optionsHTML}
            </select>
          `;
        case "checkbox":
          return `<input type="checkbox" role="switch" id="${inputId}" />`;
        case "text":
        default:
          return `<input type="text" id="${inputId}" placeholder="${title}" />`;
      }
    };

    this.classList.add("form__input-label");
    if (type == "checkbox") {
      this.classList.add("form__input-label--switch");
    }
    this.innerHTML = `
      
          <label for="${inputId}">${title}:</label>
          ${renderInputField()}
     
    `;
  }
}

customElements.define("custom-input", CustomInput);
