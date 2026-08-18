import {
  formatLoadExtremes,
  formatPlayers,
  formatPosition,
  formatWorkoutType,
} from "../utils/formatFunctions.js";
import {
  formRegistrationTemplate,
  formSettingTemplate,
  handleFinishForms,
} from "../utils/formTemplate.js";
import { avgBy, countBy, extremeBy, sumBy } from "../utils/helpers.js";

let workMaxValue = 0;

export function init() {
  const setContainer = document.getElementById("settingsFormContainer");
  const regContainer = document.getElementById("registrationFormContainer");
  const regForm = document.getElementById("registrationForm");

  const sectionForms = document.getElementById("sectionForms");
  const sectionReports = document.getElementById("sectionReports");

  const setMessage = document.getElementById("formMessageSetting");
  const regMessage = document.getElementById("formMessageRegistration");

  const btnReport = document.getElementById("btnFinishForm");

  const workoutList = [];

  const setupConfig = {
    workMax: { htmlId: "max-workout" },
  };

  const registrationConfig = {
    fields: {
      id: { htmlId: "work-id" },
      name: { htmlId: "work-name" },
      position: { htmlId: "work-pos" },
      type: { htmlId: "work-type" },
      duration: { htmlId: "work-dur" },
      intensity: { htmlId: "work-inten" },
    },
    calculate: (data) => ({
      ...data,
      load: calcWorkOut(data.type, data.duration, data.intensity),
    }),
  };

  formSettingTemplate(
    setupConfig,
    setContainer,
    regContainer,
    setMessage,
    (data) => {
      workMaxValue = Number(data.workMax);
    },
  );

  formRegistrationTemplate(
    registrationConfig,
    regForm,
    regMessage,
    workoutList,
  );

  handleFinishForms(
    btnReport,
    workoutList,
    regMessage,
    sectionForms,
    sectionReports,
    generateReport,
    renderProperties,
  );
}

function calcWorkOut(t, d, i) {
  const typeMulti = { opt1: 1.5, opt2: 1.2, opt3: 1 };
  const multi = typeMulti[t];

  return (Number(d) / 10) * Number(i) * multi;
}

function generateReport(list) {
  function acumulateLoads() {
    const players = [];
    for (const workout of list) {
      const existingPlayer = players.find(
        (player) => player.name.trim() == workout.name.trim(),
      );

      if (existingPlayer) {
        existingPlayer.totalLoad += workout.load;
        existingPlayer.totalWorkouts += 1;
      } else {
        players.push({
          name: workout.name,
          totalLoad: workout.load,
          workType: workout.type,
          position: workout.position,
          totalWorkouts: 1,
        });
      }
    }

    return players;
  }

  const playersList = acumulateLoads();

  function getPositionStats(list, positionKey) {
    const filtered = list.filter((p) => p.position === positionKey);

    return {
      total: sumBy(filtered, "totalWorkouts"),
      avg: avgBy(filtered, "totalLoad", sumBy(filtered, "totalWorkouts")),
    };
  }

  const heaviestLoad = extremeBy(playersList, "totalLoad");
  const lowestLoad = extremeBy(playersList, "totalLoad", "min");

  const riskChance = countBy(playersList, (p) => p.totalLoad > workMaxValue);

  const statsByType = {
    phisic: avgBy(
      list.filter((p) => p.type === "opt1"),
      "load",
    ),
    technical: avgBy(
      list.filter((p) => p.type === "opt2"),
      "load",
    ),
    strategic: avgBy(
      list.filter((p) => p.type === "opt3"),
      "load",
    ),
  };

  const statsByPosition = {
    goalkeeper: getPositionStats(playersList, "opt1"),
    defender: getPositionStats(playersList, "opt2"),
    midfielder: getPositionStats(playersList, "opt3"),
    attacker: getPositionStats(playersList, "opt4"),
  };

  return {
    total: list.length,
    playersList,
    heaviestLoad,
    lowestLoad,
    riskChance,
    statsByType,
    statsByPosition,
  };
}

const renderProperties = [
  { htmlId: "rep-total", data: "total" },
  {
    htmlId: "rep-players",
    data: (rep) => rep.playersList,
    formatFunc: formatPlayers,
  },
  {
    htmlId: "rep-max-load",
    data: (rep) => rep.heaviestLoad,
    formatFunc: formatLoadExtremes,
  },
  {
    htmlId: "rep-min-load",
    data: (rep) => rep.lowestLoad,
    formatFunc: formatLoadExtremes,
  },
  { htmlId: "rep-risk", data: "riskChance" },
  {
    htmlId: "rep-work-type",
    data: (rep) => rep.statsByType,
    formatFunc: formatWorkoutType,
  },
  {
    htmlId: "rep-pos-info",
    data: (rep) => rep.statsByPosition,
    formatFunc: formatPosition,
  },
];
