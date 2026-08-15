import {
  showMessage,
  alterComponentVisibility,
  formatPrice,
} from "../utils/helpers.js";

export function init() {
  const settingsFormContainer = document.getElementById(
    "settingsFormContainer",
  );
  const ordersFormContainer = document.getElementById("ordersFormContainer");
  const ordersForms = document.getElementById("ordersForm");
  const sectionReports = document.getElementById("sectionReports");
  const sectionForm = document.getElementById("sectionForms");
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

    if (ordersList.some((order) => order.id === orderData.id)) {
      showMessage(ordersMessage, "Um pedido com esse id já existe!");
      return;
    }

    ordersList.push(orderData);

    if (currentOrder < totalOrders) {
      currentOrder++;
      ordersForm.reset();
    } else {
      alterComponentVisibility(sectionForms, sectionReports);
      const finalReport = generateReport(ordersList);
      renderReport(finalReport);
    }
  });
}

function calcOrderTotal(qtd, reg, dist, track, gas) {
  const numQtd = Number(qtd);
  const numDist = Number(dist);

  const unitPrices = { opt1: 1.2, opt2: 1.3, opt3: 1.5 };
  const basePrice = unitPrices[reg] || 1.0;

  let partsPrice = 0;

  if (numQtd > 1000) {
    const normalUnits = 1000 * basePrice;
    const extraUnits = (numQtd - 1000) * (basePrice * 0.88);
    partsPrice = normalUnits + extraUnits;
  } else {
    partsPrice = numQtd * basePrice;
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
      expensiveOrder = { code: order.id, total: order.orderTotal };
    }

    if (order.orderTotal < cheap) {
      cheap = order.orderTotal;
      cheapestOrder = { code: order.id, total: order.orderTotal };
    }
  }

  const mediumOrders = list.length > 0 ? ordersPriceSum / list.length : 0;

  return {
    total: list.length,
    mediumPerOrder: mediumOrders,
    totalPerRegion: {
      southeast: totalRegion1,
      south: totalRegion2,
      midwest: totalRegion3,
    },
    expensiveOrder,
    cheapestOrder,
  };
}

function renderReport(report) {
  const total = document.getElementById("total");
  const mediumPerOrder = document.getElementById("mediumPerOrder");
  const totalPerRegion = document.getElementById("totalPerRegion");
  const expensiveOrder = document.getElementById("expensiveOrder");
  const cheapestOrder = document.getElementById("cheapestOrder");

  total.innerText = report.total;
  mediumPerOrder.innerText = formatPrice(report.mediumPerOrder);
  totalPerRegion.innerText = `Sudeste: ${formatPrice(report.totalPerRegion.southeast)}, Sul: ${formatPrice(report.totalPerRegion.south)}, Centro-Oeste: ${formatPrice(report.totalPerRegion.midwest)}`;
  expensiveOrder.innerText = `Código: ${report.expensiveOrder.code}; Total gasto: ${formatPrice(report.expensiveOrder.total)}`;
  cheapestOrder.innerText = `Código: ${report.cheapestOrder.code}; Total gasto: ${formatPrice(report.cheapestOrder.total)}`;
}
