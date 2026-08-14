import { formatPrice } from "../utils/helpers.js";

export function init() {
  const settingsFormContainer = document.getElementById(
    "settingsFormContainer",
  );
  const ordersFormContainer = document.getElementById("ordersFormContainer");
  const ordersForm = document.getElementById("ordersForm");
  const sectionReports = document.getElementById("sectionReports");
  const settingsMessage = document.getElementById("formMessageSetting");
  const ordersMessage = document.getElementById("formMessageOrder");

  let gasPrice = 0;
  let totalOrders = 0;
  let currentOrder = 1;
  const ordersList = [];

  settingsFormContainer.addEventListener("submit", (e) => {
    e.preventDefault();

    const gas = document.getElementById("gas").value;
    const orders = document.getElementById("orders").value;

    if (gas === "" || orders === "") {
      showMessage(
        settingsMessage,
        "Por favor, preencha as informações para prosseguir!",
      );
      return;
    }

    alterComponentVisibility(settingsFormContainer, ordersFormContainer);

    totalOrders = orders;
    gasPrice = gas;
  });

  ordersFormContainer.addEventListener("submit", (e) => {
    e.preventDefault();

    const orderData = {
      id: document.getElementById("ord_id").value.trim(),
      region: document.getElementById("ord_region").value,
      distance: document.getElementById("ord_distance").value,
      quantity: document.getElementById("ord_qtd_parts").value,
      hasTracking: document.getElementById("ord_tracking").checked,
      get orderTotal() {
        return calcOrderTotal(
          this.quantity,
          this.region,
          this.distance,
          this.hasTracking,
          gasPrice,
        );
      },
    };

    if (
      ordersList.length != 0 &&
      ordersList.find((order) => {
        return order.id == orderData.id;
      }) != undefined
    ) {
      showMessage(ordersMessage, "Um pedido com esse id já existe!");
      return;
    }

    ordersList.push(orderData);

    if (currentOrder < totalOrders) {
      currentOrder++;
      ordersForm.reset();
    } else {
      alterComponentVisibility(ordersFormContainer, sectionReports);
      const finalReport = generateReport(ordersList);
      renderReport(finalReport);
    }
  });
}

function showMessage(label, message) {
  label.classList.remove("hideComponent");
  label.classList.add("viewComponent");

  label.innerText = message;
}

function alterComponentVisibility(hiddenComponent, visibleComponent) {
  hiddenComponent.classList.remove("viewComponent");
  hiddenComponent.classList.add("hideComponent");

  visibleComponent.classList.remove("hideComponent");
  visibleComponent.classList.add("viewComponent");
}

function renderReport(report) {
  const total = document.getElementById("total");
  const mediumPerOrder = document.getElementById("mediumPerOrder");
  const totalPerRegion = document.getElementById("totalPerRegion");
  const expensiveOrder = document.getElementById("expensiveOrder");
  const cheapestOrder = document.getElementById("cheapestOrder");

  total.innerText = report.total;
  mediumPerOrder.innerText = report.mediumPerOrder;
  totalPerRegion.innerText = `Sudeste: ${report.totalPerRegion.southeast}, Sul: ${report.totalPerRegion.south}, Centro-Oeste: ${report.totalPerRegion.midwest}`;
  expensiveOrder.innerText = `Código: ${report.expensiveOrder.code}; Total gasto: ${report.expensiveOrder.total}`;
  cheapestOrder.innerText = `Código: ${report.cheapestOrder.code}; Total gasto: ${report.cheapestOrder.total}`;
}

function calcOrderTotal(qtd, reg, dist, track, gas) {
  let partsPrice = 0;

  const numQtd = Number(qtd);
  const numDist = Number(dist);

  let preDiscount = 0;
  let discount = 0;

  function calcPriceDisc(q, p) {
    if (q > 1000) {
      preDiscount = 1000 * p;
      discount = (q - 1000) * (p - p * 0.12);
    } else {
      preDiscount = numQtd * p;
      discount = 0;
    }

    partsPrice = preDiscount + discount;
  }

  switch (reg) {
    case "opt1":
      calcPriceDisc(numQtd, 1.2);
      break;
    case "opt2":
      calcPriceDisc(numQtd, 1.3);
      break;
    case "opt3":
      calcPriceDisc(numQtd, 1.5);
      break;
    default:
      partsPrice = numQtd;
  }

  let distPrice = numDist * gas;
  const trackingPrice = track ? 200 : 0;

  return partsPrice + distPrice + trackingPrice;
}

function generateReport(list) {
  let ordersPriceSum = 0;
  let totalRegion1 = 0;
  let totalRegion2 = 0;
  let totalRegion3 = 0;
  let expensiveOrder = { code: "", total: 0 };
  let cheapestOrder = { code: "", total: Infinity };

  let expensive = 0;
  let cheap = Infinity;

  for (let order of list) {
    ordersPriceSum += order.orderTotal;

    switch (order.region) {
      case "opt1":
        totalRegion1 += order.orderTotal;
        break;
      case "opt2":
        totalRegion2 += order.orderTotal;
        break;
      case "opt3":
        totalRegion3 += order.orderTotal;
        break;
    }

    if (order.orderTotal > expensive) {
      expensive = order.orderTotal;
      expensiveOrder = { code: order.id, total: formatPrice(order.orderTotal) };
    }

    if (order.orderTotal < cheap) {
      cheap = order.orderTotal;
      cheapestOrder = { code: order.id, total: formatPrice(order.orderTotal) };
    }
  }

  const mediumOrders = list.length > 0 ? ordersPriceSum / list.length : 0;

  return {
    total: list.length,
    mediumPerOrder: formatPrice(mediumOrders),
    totalPerRegion: {
      southeast: formatPrice(totalRegion1),
      south: formatPrice(totalRegion2),
      midwest: formatPrice(totalRegion3),
    },
    expensiveOrder,
    cheapestOrder,
  };
}
