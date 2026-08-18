import {
  formatAlerts,
  formatByStock,
  formatPrice,
  formatProductInfo,
  formatStockExtreme,
} from "../utils/formatFunctions.js";
import {
  formRegistrationTemplate,
  handleFinishForms,
} from "../utils/formTemplate.js";
import { avgBy, countBy, extremeBy, sumBy } from "../utils/helpers.js";

export function init() {
  const stockList = [];

  const registrationConfig = {
    fields: {
      id: { htmlId: "sto-ord-id" },
      prodId: { htmlId: "sto-prod-id" },
      prodType: { htmlId: "sto-prod-type" },
      quantity: { htmlId: "sto-qtd" },
      price: { htmlId: "sto-prod-price" },
      initialStock: { htmlId: "sto-initial" },
    },
    calculate: (data) => ({
      ...data,
      total: calcOrder(data.price, data.prodType, data.quantity),
      finalStock: calcStock(data.initialStock, data.quantity),
    }),
  };

  formRegistrationTemplate(registrationConfig, stockList);

  handleFinishForms(stockList, generateReport, renderProperties);
}

function calcOrder(p, t, q) {
  const numPrice = parseFloat(p);
  const numQtd = parseInt(q);

  const tpyeDict = { opt1: 1, opt2: 1.1, opt3: 1.2 };
  const price = numPrice * tpyeDict[t];

  return numQtd * price;
}

function calcStock(s, q) {
  const numStock = parseInt(s);
  const numQtd = parseInt(q);

  return numStock + numQtd;
}

function generateReport(list) {
  function acumulateStocks() {
    const products = [];
    for (const item of list) {
      const itemTotal = Number(item.total) || 0;
      const finalStock = Number(item.finalStock) || 0;
      const existingProduct = products.find((prod) => prod.id === item.prodId);

      if (existingProduct) {
        existingProduct.totalStock += finalStock;
        existingProduct.totalValue += itemTotal;
      } else {
        products.push({
          id: item.prodId,
          totalStock: finalStock,
          totalValue: itemTotal,
        });
      }
    }

    return products;
  }

  const productsList = acumulateStocks();

  const stockByType = {
    standard: sumBy(
      list.filter((p) => p.prodType === "opt1"),
      "finalStock",
    ),
    premiuim: sumBy(
      list.filter((p) => p.prodType === "opt2"),
      "finalStock",
    ),
    custom: sumBy(
      list.filter((p) => p.prodType === "opt3"),
      "finalStock",
    ),
  };

  const mediumPerOrder = avgBy(list, "finalStock");

  const highestOrder = extremeBy(list, "finalStock");
  const lowestOrder = extremeBy(list, "finalStock", "min");

  const alerts = {
    high: countBy(list, (o) => o.finalStock > 5000),
    critic: countBy(list, (o) => o.finalStock < 500),
  };

  const investedValue = sumBy(list, "total");

  return {
    total: list.length,
    stockByType,
    mediumPerOrder,
    highestOrder,
    lowestOrder,
    alerts,
    productsList,
    investedValue,
  };
}

const renderProperties = [
  { htmlId: "rep-total", data: "total" },
  {
    htmlId: "rep-final-stock",
    data: (rep) => rep.stockByType,
    formatFunc: formatByStock,
  },
  { htmlId: "rep-avg", data: "mediumPerOrder", formatFunc: formatPrice },
  {
    htmlId: "rep-high",
    data: (rep) => rep.highestOrder,
    formatFunc: formatStockExtreme,
  },
  {
    htmlId: "rep-low",
    data: (rep) => rep.lowestOrder,
    formatFunc: formatStockExtreme,
  },
  { htmlId: "rep-alerts", data: (rep) => rep.alerts, formatFunc: formatAlerts },
  {
    htmlId: "rep-prod-info",
    data: (rep) => rep.productsList,
    formatFunc: formatProductInfo,
  },
  { htmlId: "rep-invested", data: "investedValue", formatFunc: formatPrice },
];
