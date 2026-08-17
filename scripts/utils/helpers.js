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

export function sumBy(list, selector) {
  if (!Array.isArray(list) || list.length === 0) return 0;

  const getValue =
    typeof selector === "function" ? selector : (item) => item[selector];

  return list.reduce((acc, cur) => acc + Number(getValue(cur)) || 0, 0);
}

export function avgBy(list, selector, div) {
  if (!Array.isArray(list) || list.length === 0) return 0;

  const sum = sumBy(list, selector);
  const divisor = !div ? list.length : div;

  return divisor > 0 ? sum / divisor : 0;
}

export function countBy(list, selector) {
  if (!Array.isArray(list)) return 0;

  const item =
    typeof selector === "function" ? selector : (item) => item[selector];

  return list.filter((cur) => item(cur)).length;
}

export function extremeBy(list, reference, mode = "max") {
  if (!Array.isArray(list) || list.length === 0) return null;

  let obj = {};

  if (mode === "max") {
    obj = list.reduce((max, item) =>
      item[reference] > max[reference] ? item : max,
    );
  } else {
    obj = list.reduce((min, item) =>
      item[reference] < min[reference] ? item : min,
    );
  }

  return obj;
}
