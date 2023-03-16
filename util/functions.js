// -------------------------------------- //
// Funtion to read path and file type.
const { Console } = require("console");
const fs = require("fs");
const moment = require("moment");


function getFiles(path, ending) {
  return fs.readdirSync(path).filter((f) => f.endsWith(ending));
}
// -------------------------------------- //
// Function to get the day of the week
// Input (day): DD/MM/YYYY
function dayOfWeek(day) {
  let date = new Date();
  date = moment(date, "YYYY-MM-DD").format("DD/MM/YYYY")

  if (day == date) {
    return "Hoje";
  } else {
    let dayOfWeekNumber = moment(day,"DD/MM/YYYY").isoWeekday();
    let nameOfDay;
   
    switch (dayOfWeekNumber) {
      case 7:
        nameOfDay = "Domingo";
        break;
      case 1:
        nameOfDay = "Segunda";
        break;
      case 2:
        nameOfDay = "Terça";
        break;
      case 3:
        nameOfDay = "Quarta";
        break;
      case 4:
        nameOfDay = "Quinta";
        break;
      case 5:
        nameOfDay = "Sexta";
        break;
      case 6:
        nameOfDay = "Sábado";
        break;
    }

    return nameOfDay;
  }
}
// -------------------------------------- //
// Function to get the activity number of players

function numberOfPlayers(embedText) {
  let numberOfPlayers;
  switch (true) {
    case embedText.startsWith("Raid") === true:
      numberOfPlayers = 6;
      break;
    case embedText.startsWith("Anoitecer") === true:
      numberOfPlayers = 3;
      break;
    case embedText.startsWith("Artimanha") === true:
      numberOfPlayers = 4;
      break;
    case embedText.startsWith("Controle") === true:
      numberOfPlayers = 6;
      break;
    case embedText.startsWith("Bandeira") === true:
      numberOfPlayers = 6;
      break;
    case embedText.startsWith("Competitivo") === true:
      numberOfPlayers = 3;
      break;
    case embedText.startsWith("Osíris") === true:
      numberOfPlayers = 3;
      break;
    case embedText.startsWith("Privada") === true:
      numberOfPlayers = 12;
      break;
    case embedText.startsWith("Masmorra") === true:
      numberOfPlayers = 3;
      break;
  }
  return numberOfPlayers;
}

// -------------------------------------- //
// Validate time
function validateTime(time) {
  const timeReg = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

  if (time.match(timeReg)) {
    return true;
  } else {
    return false;
  }
}

// -------------------------------------- //
// Validate date
function validateDate(dateString) {
  // Validate date DD/MM/YYYY
  const dateformat1 = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/g;
  
  // Validate date DD/MM
  const dateformat2 = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))$/g;

  if (dateString.match(dateformat1) || dateString.match(dateformat2)) {
    return true;
  } else {
    return false;
  }
}
// -------------------------------------- //
// To Lower Case and Capitalize First Letter
function capitalizeFirstLetter(string) 
{
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// -------------------------------------- //
// Function to get the day of the week
function dayOfWeekDesc(dayDesc) {
  let date = new Date();

  if (dayDesc == "Hoj") {
    return date.getDay();
  } else {
    let dayOfWeekNumber = dayDesc;
    let numberOfDay;

    switch (dayOfWeekNumber) {
      case "Dom":
        numberOfDay = 7;
        break;
      case "Seg":
        numberOfDay = 1;
        break;
      case "Ter":
        numberOfDay = 2;
        break;
      case "Qua":
        numberOfDay = 3;
        break;
      case "Qui":
        numberOfDay = 4;
        break;
      case "Sex":
        numberOfDay = 5;
        break;
      case "Sáb":
        numberOfDay = 6;
        break;
    }

    return numberOfDay;
  }
}

// Exporting Functions:
module.exports = {
  getFiles,
  dayOfWeek,
  numberOfPlayers,
  validateTime,
  capitalizeFirstLetter,
  dayOfWeekDesc,
  validateDate
};
