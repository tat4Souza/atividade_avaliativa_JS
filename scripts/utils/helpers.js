export function formatPrice(price) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatCategory(category) {
  return category === "opt1" ? "Funcionário Operacional" : "Gerente";
}

export function formatShift(shift) {
  return shift === "opt1"
    ? "Matutino"
    : shift === "opt2"
      ? "Vespertino"
      : "Noturno";
}

export function alterComponentVisibility(hiddenComponent, visibleComponent) {
  hiddenComponent.classList.remove("viewComponent");
  hiddenComponent.classList.add("hideComponent");

  visibleComponent.classList.remove("hideComponent");
  visibleComponent.classList.add("viewComponent");
}

export function showMessage(label, message) {
  label.classList.remove("hideComponent");
  label.classList.add("viewComponent");

  label.innerText = message;
}

export function hideMessage(label) {
  label.classList.remove("viewComponent");
  label.classList.add("hideComponent");
}
