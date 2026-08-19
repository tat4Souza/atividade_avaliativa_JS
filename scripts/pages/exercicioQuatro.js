import {
  formatResSeason,
  formatPrice,
  formatResRoom,
  formatResExtreme,
} from "../utils/formatFunctions.js";
import {
  formRegistrationTemplate,
  formSettingTemplate,
  handleFinishForms,
} from "../utils/formTemplate.js";
import { avgBy, countBy, extremeBy, sumBy } from "../utils/helpers.js";

export function init() {
  let dailyValue = 0;
  let breakfastValue = 0;
  const resList = [];

  const setupConfig = {
    daily: { htmlId: "daily-rate" },
    breakfast: { htmlId: "breakfast" },
  };

  const registrationConfig = {
    fields: {
      id: { htmlId: "res-id" },
      roomType: { htmlId: "res-type" },
      season: { htmlId: "res-season" },
      daily: { htmlId: "res-daily" },
      guests: { htmlId: "res-guests" },
      hasBreakfast: { htmlId: "res-break", type: "checkbox" },
    },
    calculate: (data) => ({
      ...data,
      reservTotal: calcReserv(
        dailyValue,
        data.roomType,
        data.season,
        data.hasBreakfast,
        breakfastValue,
        data.guests,
        data.daily,
      ),
    }),
  };

  formSettingTemplate(setupConfig, (data) => {
    dailyValue = parseFloat(data.daily);
    breakfastValue = parseFloat(data.breakfast);
  });

  formRegistrationTemplate(registrationConfig, resList);

  handleFinishForms(resList, generateReport, renderProperties);
}

function calcReserv(b, rt, s, bf, bfv, g, d) {
  const numGuests = Number(g);
  const numDaily = Number(d);

  const roomPrice = { opt1: 1, opt2: 1.5, opt3: 2 };
  const ajustedBase = b * roomPrice[rt];

  const seasonPrice = {
    opt1: 0,
    opt2: ajustedBase * 0.25,
    opt3: ajustedBase * 0.4,
  };
  const dailyFinal = ajustedBase + seasonPrice[s];

  const breakPrice = bf ? bfv * numGuests * numDaily : 0;
  return dailyFinal * numDaily + breakPrice;
}

function generateReport(list) {
  function sumTypesBy(selector, option) {
    return sumBy(list, (r) => r[selector] === option && r.reservTotal);
  }

  const totalByRoom = {
    standard: sumTypesBy("roomType", "opt1"),
    luxury: sumTypesBy("roomType", "opt2"),
    premium: sumTypesBy("roomType", "opt3"),
  };

  const totalBySeason = {
    low: sumTypesBy("season", "opt1"),
    high: sumTypesBy("season", "opt2"),
    holiday: sumTypesBy("season", "opt3"),
  };

  const mediumPerRes = avgBy(list, "reservTotal");

  const hasBreakfast = countBy(list, "hasBreakfast");
  const noBreakfast = countBy(list, (r) => !r.hasBreakfast);

  const ocupation = sumBy(list, (r) => Number(r.daily) * Number(r.guests));
  const mediumPerGuest = avgBy(list, "reservTotal", sumBy(list, "guests"));

  const expensive = extremeBy(list, "reservTotal");
  const cheapest = extremeBy(list, "reservTotal", "min");

  return {
    total: list.length,
    mediumPerRes,
    totalByRoom,
    totalBySeason,
    expensive,
    cheapest,
    hasBreakfast,
    noBreakfast,
    ocupation,
    mediumPerGuest,
  };
}

const renderProperties = [
  { htmlId: "rep-total", data: "total" },
  { htmlId: "rep-avg", data: "mediumPerRes", formatFunc: formatPrice },
  {
    htmlId: "rep-total-type",
    data: (rep) => rep.totalByRoom,
    formatFunc: formatResRoom,
  },
  {
    htmlId: "rep-total-season",
    data: (rep) => rep.totalBySeason,
    formatFunc: formatResSeason,
  },
  {
    htmlId: "rep-expensive",
    data: (rep) => rep.expensive,
    formatFunc: formatResExtreme,
  },
  {
    htmlId: "rep-cheap",
    data: (rep) => rep.cheapest,
    formatFunc: formatResExtreme,
  },
  { htmlId: "rep-breakfast-w", data: "hasBreakfast" },
  { htmlId: "rep-breakfast-wo", data: "noBreakfast" },
  { htmlId: "rep-ocupation", data: "ocupation" },
  { htmlId: "rep-avg-guest", data: "mediumPerGuest", formatFunc: formatPrice },
];
