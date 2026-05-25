const XLSX = require("xlsx");
const fs = require("fs");



// READ EXCEL FILE

const workbook = XLSX.readFile("January'26(1).xls");



// GET FIRST SHEET

const sheetName = workbook.SheetNames[0];

const sheet = workbook.Sheets[sheetName];



// CONVERT TO JSON

const rawData = XLSX.utils.sheet_to_json(sheet, {
  header: 1
});



const finalData = [];

let currentFlow = "";



rawData.forEach((row) => {

  const col1 = row[0];
  const col2 = row[1];
  const col3 = row[2];



  // DETECT INFLOW

  if (
    typeof col1 === "string" &&
    col1.includes("Inflow")
  ) {
    currentFlow = "Inflow";
  }



  // DETECT OUTFLOW

  if (
    typeof col1 === "string" &&
    col1.includes("Outflow")
  ) {
    currentFlow = "Outflow";
  }



  // EXTRACT CATEGORY + AMOUNT

  if (
    typeof col1 === "string" &&
    typeof col2 === "number"
  ) {

    finalData.push({

      month: "January",

      flowType: currentFlow,

      category: col1,

      amount: col2

    });

  }

});



// SAVE JSON

fs.writeFileSync(
  "dashboard-data.json",
  JSON.stringify(finalData, null, 2)
);



console.log("dashboard-data.json created successfully!");