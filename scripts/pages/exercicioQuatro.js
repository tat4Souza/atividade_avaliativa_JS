import {
  formatRoomType,
  formatSeason,
  formatPrice,
} from "../utils/formatFunctions.js";
import {
  formRegistrationTemplate,
  formSettingTemplate,
  handleFinishForms,
} from "../utils/formTemplate.js";
import { avgBy, countBy, extremeBy, sumBy } from "../utils/helpers.js";

export function init() {
  const setContainer = document.getElementById("settingsFormContainer");
  const resContainer = document.getElementById("reservationFormContainer");
  const resForm = document.getElementById("reservationForm");

  const sectionForms = document.getElementById("sectionForms");
  const sectionReports = document.getElementById("sectionReports");

  const setMessage = document.getElementById("formMessageSetting");
  const resMessage = document.getElementById("formMessageReservation");

  const btnReport = document.getElementById("btnFinishForm");

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

  formSettingTemplate(
    setupConfig,
    setContainer,
    resContainer,
    setMessage,
    (data) => {
      dailyValue = parseFloat(data.daily);
      breakfastValue = parseFloat(data.breakfast);
    },
  );

  formRegistrationTemplate(registrationConfig, resForm, resMessage, resList);

  handleFinishForms(
    btnReport,
    resList,
    resMessage,
    sectionForms,
    sectionReports,
    generateReport,
    renderProperties,
  );
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
  const mediumPerRes = avgBy(list, "reservTotal");
  const standardTot = sumBy(
    list,
    (r) => r.roomType === "opt1" && r.reservTotal,
  );
  const luxuryTot = sumBy(list, (r) => r.roomType === "opt2" && r.reservTotal);
  const premiumTot = sumBy(list, (r) => r.roomType === "opt3" && r.reservTotal);
  const lowSeaTot = sumBy(list, (r) => r.season === "opt1" && r.reservTotal);
  const highSeaTot = sumBy(list, (r) => r.season === "opt2" && r.reservTotal);
  const holiSeaTot = sumBy(list, (r) => r.season === "opt3" && r.reservTotal);
  const hasBreakfast = countBy(list, "hasBreakfast");
  const noBreakfast = countBy(list, (r) => !r.hasBreakfast);

  const ocupation = sumBy(list, (r) => Number(r.daily) * Number(r.guests));
  const totalGuests = sumBy(list, "guests");
  const mediumPerGuest = avgBy(list, "reservTotal", totalGuests);

  const expensive = extremeBy(list, "reservTotal");
  const cheapest = extremeBy(list, "reservTotal", "min");

  return {
    total: list.length,
    mediumPerRes,
    standardTot,
    luxuryTot,
    premiumTot,
    lowSeaTot,
    highSeaTot,
    holiSeaTot,
    expensive: {
      code: expensive.id,
      type: expensive.roomType,
      season: expensive.season,
      guests: expensive.guests,
      total: expensive.reservTotal,
    },
    cheapest: {
      code: cheapest.id,
      type: cheapest.roomType,
      season: cheapest.season,
      guests: cheapest.guests,
      total: cheapest.reservTotal,
    },
    hasBreakfast,
    noBreakfast,
    ocupation,
    mediumPerGuest,
  };
}

const renderProperties = [
  { htmlId: "rep-total", data: "total" },
  { htmlId: "rep-avg", data: "mediumPerRes", formatFunc: formatPrice },
  { htmlId: "rep-total-s", data: "standardTot", formatFunc: formatPrice },
  { htmlId: "rep-total-l", data: "luxuryTot", formatFunc: formatPrice },
  { htmlId: "rep-total-p", data: "premiumTot", formatFunc: formatPrice },
  { htmlId: "rep-season-l", data: "lowSeaTot", formatFunc: formatPrice },
  { htmlId: "rep-season-h", data: "highSeaTot", formatFunc: formatPrice },
  { htmlId: "rep-season-hd", data: "holiSeaTot", formatFunc: formatPrice },
  { htmlId: "rep-exp-id", data: (report) => report.expensive.code },
  {
    htmlId: "rep-exp-type",
    data: (report) => report.expensive.type,
    formatFunc: formatRoomType,
  },
  {
    htmlId: "rep-exp-sea",
    data: (report) => report.expensive.season,
    formatFunc: formatSeason,
  },
  { htmlId: "rep-exp-gue", data: (report) => report.expensive.guests },
  {
    htmlId: "rep-exp-tot",
    data: (report) => report.expensive.total,
    formatFunc: formatPrice,
  },
  { htmlId: "rep-cheap-id", data: (report) => report.cheapest.code },
  {
    htmlId: "rep-cheap-type",
    data: (report) => report.cheapest.type,
    formatFunc: formatRoomType,
  },
  {
    htmlId: "rep-cheap-sea",
    data: (report) => report.cheapest.season,
    formatFunc: formatSeason,
  },
  { htmlId: "rep-cheap-gue", data: (report) => report.cheapest.guests },
  {
    htmlId: "rep-cheap-tot",
    data: (report) => report.cheapest.total,
    formatFunc: formatPrice,
  },
  { htmlId: "rep-breakfast-w", data: "hasBreakfast" },
  { htmlId: "rep-breakfast-wo", data: "noBreakfast" },
  { htmlId: "rep-ocupation", data: "ocupation" },
  { htmlId: "rep-avg-guest", data: "mediumPerGuest", formatFunc: formatPrice },
];
