export function formatPrice(price) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
