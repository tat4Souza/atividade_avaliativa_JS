import { formatPrice } from "../utils/formatFunctions.js";
import {
  formRegistrationTemplate,
  formSettingTemplate,
  handleFinishForms,
} from "../utils/formTemplate.js";

const renderProperties = [
  { htmlId: "rep-total", data: "total" },
  { htmlId: "rep-order-avg", data: "mediumPerOrder", formatFunc: formatPrice },
  {
    htmlId: "rep-reg-se",
    data: (report) => report.totalPerRegion.southeast,
    formatFunc: formatPrice,
  },
  {
    htmlId: "rep-reg-s",
    data: (report) => report.totalPerRegion.south,
    formatFunc: formatPrice,
  },
  {
    htmlId: "rep-reg-m",
    data: (report) => report.totalPerRegion.midwest,
    formatFunc: formatPrice,
  },
  { htmlId: "rep-exp-id", data: (report) => report.expensiveOrder.code },
  {
    htmlId: "rep-exp-tot",
    data: (report) => report.expensiveOrder.total,
    formatFunc: formatPrice,
  },
  { htmlId: "rep-che-id", data: (report) => report.cheapestOrder.code },
  {
    htmlId: "rep-che-tot",
    data: (report) => report.cheapestOrder.total,
    formatFunc: formatPrice,
  },
];

export function init() {
  const setContainer = document.getElementById("settingsFormContainer");
  const ordContainer = document.getElementById("ordersFormContainer");
  const ordersForms = document.getElementById("ordersForm");

  const sectionReports = document.getElementById("sectionReports");
  const sectionForm = document.getElementById("sectionForms");

  const settingsMessage = document.getElementById("formMessageSetting");
  const ordersMessage = document.getElementById("formMessageOrder");

  const btnReport = document.getElementById("btnFinishForm");

  let gasPrice = 0;
  const ordersList = [];

  const setupConfig = {
    gas: { htmlId: "gas" },
  };

  const registrationConfig = {
    fields: {
      id: { htmlId: "ord-id" },
      region: { htmlId: "ord-region" },
      distance: { htmlId: "ord-distance" },
      quantity: { htmlId: "ord-qtd-parts" },
      hasTracking: { htmlId: "ord-tracking", type: "checkbox" },
    },
    calculate: (data) => ({
      ...data,
      orderTotal: calcOrderTotal(
        data.quantity,
        data.region,
        data.distance,
        data.hasTracking,
        gasPrice,
      ),
    }),
  };

  formSettingTemplate(
    setupConfig,
    setContainer,
    ordContainer,
    settingsMessage,
    (data) => {
      gasPrice = parseFloat(data.gas);
    },
  );

  formRegistrationTemplate(
    registrationConfig,
    ordersForms,
    ordersMessage,
    ordersList,
  );

  handleFinishForms(
    btnReport,
    ordersList,
    ordersMessage,
    sectionForm,
    sectionReports,
    generateReport,
    renderProperties,
  );
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
  let cheapestOrder = { code: "", total: 0 };

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
