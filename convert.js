const XLSX = require("xlsx");

const fs = require("fs");

const path = require("path");



const excelFolder = "./excel-data";



const files =
  fs.readdirSync(excelFolder);



let finalData = [];



files.forEach(file => {

  const workbook =
    XLSX.readFile(
      path.join(excelFolder, file)
    );



  const sheetName =
    workbook.SheetNames[0];



  const sheet =
    workbook.Sheets[sheetName];



  const rawData =
    XLSX.utils.sheet_to_json(sheet, {
      header: 1
    });



  let currentFlow = "";



  // MONTH NAME

  const month =
    file.split("'")[0];



  rawData.forEach(row => {

    const col1 = row[0];

    const col2 = row[1];



    // INFLOW

    if (
      typeof col1 === "string" &&
      col1.includes("Inflow")
    ) {
      currentFlow = "Inflow";
    }



    // OUTFLOW

    if (
      typeof col1 === "string" &&
      col1.includes("Outflow")
    ) {
      currentFlow = "Outflow";
    }



    // CATEGORY + AMOUNT

    if (
      typeof col1 === "string" &&
      typeof col2 === "number"
    ) {

      finalData.push({

        month: month,

        flowType: currentFlow,

        category: col1,

        amount: col2

      });

    }

  });

});



// SAVE FINAL JSON

fs.writeFileSync(
  "./data/dashboard-data.json",
  JSON.stringify(finalData, null, 2)
);



console.log(
  "Multi-month dashboard-data.json created!"
);