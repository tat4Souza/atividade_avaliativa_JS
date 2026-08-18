import {
  formatMostComissionsSeller,
  formatMostSalesSeller,
  formatPerRegion,
  formatPrice,
  formatSalesPerClient,
} from "../utils/formatFunctions.js";
import {
  formRegistrationTemplate,
  formSettingTemplate,
  handleFinishForms,
} from "../utils/formTemplate.js";
import { sumBy, avgBy, countBy, extremeBy } from "../utils/helpers.js";

let monthlyGoalValue = 0;

export function init() {
  let baseComValue = 0;
  const salesList = [];

  const setupConfig = {
    monthlyGoal: { htmlId: "monthly-goal" },
    baseCom: { htmlId: "base-comission" },
  };

  const registrationConfig = {
    fields: {
      id: { htmlId: "sale-id" },
      sellerId: { htmlId: "sale-seller-id" },
      region: { htmlId: "sale-reg" },
      value: { htmlId: "sale-value" },
      clientType: { htmlId: "sale-client-type" },
    },
    calculate: (data) => ({
      ...data,
      comissionValue: calcComission(
        baseComValue,
        data.value,
        data.clientType,
        data.region,
      ),
    }),
  };

  formSettingTemplate(setupConfig, (data) => {
    monthlyGoalValue = Number(data.monthlyGoal);
    baseComValue = Number(data.baseCom);
  });

  formRegistrationTemplate(registrationConfig, salesList);

  handleFinishForms(salesList, generateReport, renderProperties);
}

function calcComission(baseComPer, v, ct, r) {
  const baseComission = Number(v) * (baseComPer / 100);

  const clientDict = { opt1: v * 0.02, opt2: v * 0.03 };
  const regionDict = {
    opt1: v * 0.01,
    opt2: v * 0.01,
    opt3: 0,
    opt4: v * 0.005,
  };

  return baseComission + clientDict[ct] + regionDict[r];
}

function generateReport(list) {
  function acumulateComissions() {
    const sellers = [];
    for (const sale of list) {
      const existingSale = sellers.find(
        (seller) => seller.sellerId.trim() == sale.sellerId.trim(),
      );

      if (existingSale) {
        existingSale.totalComission += sale.comissionValue;
        existingSale.totalValue += Number(sale.value);
        existingSale.sales += 1;
      } else {
        sellers.push({
          sellerId: sale.sellerId,
          totalComission: sale.comissionValue,
          totalValue: Number(sale.value),
          sales: 1,
        });
      }
    }

    return sellers;
  }

  const sellersList = acumulateComissions();

  function totalSumBy(selector, option) {
    return sumBy(list, (s) => s[selector] === option && s.value);
  }

  function avgComissionBy(option) {
    return avgBy(
      list.filter((s) => s.region === option),
      "comissionValue",
    );
  }

  const totalPerRegion = {
    north: totalSumBy("region", "opt1"),
    northeast: totalSumBy("region", "opt2"),
    southeast: totalSumBy("region", "opt3"),
    south: totalSumBy("region", "opt4"),
  };

  const totalPerClient = {
    pf: totalSumBy("clientType", "opt1"),
    pj: totalSumBy("clientType", "opt2"),
  };

  const mostSalesSeller = extremeBy(sellersList, "totalValue");
  const mostComissionSeller = extremeBy(sellersList, "totalComission");

  const sellersGoal = countBy(
    sellersList,
    (s) => s.totalValue > monthlyGoalValue,
  );

  const avgComission = avgBy(list, "comissionValue");

  const avgPerRegion = {
    north: avgComissionBy("opt1"),
    northeast: avgComissionBy("opt2"),
    southeast: avgComissionBy("opt3"),
    south: avgComissionBy("opt4"),
  };

  return {
    total: list.length,
    totalPerRegion,
    totalPerClient,
    mostSalesSeller,
    mostComissionSeller,
    sellersGoal,
    avgComission,
    avgPerRegion,
  };
}

const renderProperties = [
  { htmlId: "rep-total", data: "total" },
  {
    htmlId: "rep-total-region",
    data: (rep) => rep.totalPerRegion,
    formatFunc: formatPerRegion,
  },
  {
    htmlId: "rep-total-client",
    data: (rep) => rep.totalPerClient,
    formatFunc: formatSalesPerClient,
  },
  {
    htmlId: "rep-seller-value",
    data: (rep) => rep.mostSalesSeller,
    formatFunc: formatMostSalesSeller,
  },
  {
    htmlId: "rep-seller-comission",
    data: (rep) => rep.mostComissionSeller,
    formatFunc: formatMostComissionsSeller,
  },
  { htmlId: "rep-seller-goal", data: "sellersGoal" },
  {
    htmlId: "rep-comission-avg",
    data: "avgComission",
    formatFunc: formatPrice,
  },
  {
    htmlId: "rep-comission-avg-reg",
    data: (rep) => rep.avgPerRegion,
    formatFunc: formatPerRegion,
  },
];
