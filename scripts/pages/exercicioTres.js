import { formatPrice, formatProductInfo } from "../utils/formatFunctions.js";
import {
  formRegistrationTemplate,
  handleFinishForms,
} from "../utils/formTemplate.js";

const renderProperties = [
  { htmlId: "rep-total", data: "total" },
  { htmlId: "rep-stock-std", data: (report) => report.stockByType.standard },
  { htmlId: "rep-stock-pre", data: (report) => report.stockByType.premium },
  { htmlId: "rep-stock-cus", data: (report) => report.stockByType.custom },
  { htmlId: "rep-avg", data: "mediumPerOrder", formatFunc: formatPrice },
  { htmlId: "rep-high-id", data: (report) => report.highestOrder.code },
  {
    htmlId: "rep-high-tot",
    data: (report) => report.highestOrder.total,
    formatFunc: formatPrice,
  },
  { htmlId: "rep-low-id", data: (report) => report.lowestOrder.code },
  {
    htmlId: "rep-low-tot",
    data: (report) => report.lowestOrder.total,
    formatFunc: formatPrice,
  },
  { htmlId: "rep-alert-high", data: "highAlert" },
  { htmlId: "rep-alert-crit", data: "critAlert" },
  {
    htmlId: "rep-prod-info",
    data: "productsStock",
    formatFunc: formatProductInfo,
  },
];

export function init() {
  const form = document.getElementById("stockForm");

  const sectionForms = document.getElementById("sectionForms");
  const sectionReports = document.getElementById("sectionReports");

  const message = document.getElementById("formMessage");

  const btnReport = document.getElementById("btnFinishForm");

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

  formRegistrationTemplate(registrationConfig, form, message, stockList);

  handleFinishForms(
    btnReport,
    stockList,
    message,
    sectionForms,
    sectionReports,
    generateReport,
    renderProperties,
  );
}

function calcOrder(p, t, q) {
  const numPrice = parseFloat(p);
  const numQtd = parseInt(q);

  let price = 0;

  switch (t) {
    case "opt1":
      price = numPrice;
      break;
    case "opt2":
      price = numPrice * 1.1;
      break;
    case "opt3":
      price = numPrice * 1.2;
      break;
  }

  return numQtd * price;
}

function calcStock(s, q) {
  const numStock = parseInt(s);
  const numQtd = parseInt(q);

  return numStock + numQtd;
}

function generateReport(list) {
  let finalStockProd = 0;
  let totalOrdersPrice = 0;
  const productsStock = [];
  const stockByType = {
    standard: 0,
    premium: 0,
    custom: 0,
  };

  let high = 0;
  let low = Infinity;
  let highestOrder = { code: "", total: 0 };
  let lowestOrder = { code: "", total: 0 };

  let highAlert = 0;
  let critAlert = 0;

  for (const item of list) {
    const itemTotal = Number(item.total) || 0;
    const finalStock = Number(item.finalStock) || 0;

    const existingProduct = productsStock.find(
      (prod) => prod.id === item.prodId,
    );

    if (existingProduct) {
      existingProduct.totalStock += finalStock;
      existingProduct.totalValue += itemTotal;
    } else {
      productsStock.push({
        id: item.prodId,
        totalStock: finalStock,
        totalValue: itemTotal,
      });
    }

    if (item.prodType === "opt1") stockByType.standard += finalStock;
    else if (item.prodType === "opt2") stockByType.premium += finalStock;
    else if (item.prodType === "opt3") stockByType.custom += finalStock;

    totalOrdersPrice += itemTotal;

    if (itemTotal > high) {
      high = itemTotal;
      highestOrder = { code: item.id, total: itemTotal };
    }

    if (itemTotal < low) {
      low = itemTotal;
      lowestOrder = { code: item.id, total: itemTotal };
    }

    if (item.finalStock > 5000) {
      highAlert += 1;
    }
    if (item.finalStock < 500) {
      critAlert += 1;
    }
  }

  const mediumPerOrder = totalOrdersPrice / list.length;

  return {
    total: list.length,
    stockByType,
    mediumPerOrder,
    highestOrder,
    lowestOrder,
    highAlert,
    critAlert,
    productsStock,
  };
}
