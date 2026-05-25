let allData = [];

let cashFlowChart;
let categoryChart;
let monthChart;
let departmentChart;



// LOAD DASHBOARD

async function loadDashboard() {

  const response =
    await fetch("data/dashboard-data.json");

  allData = await response.json();



  populateMonthFilter();

  updateDashboard(allData);

}



// POPULATE MONTH FILTER

function populateMonthFilter() {

  const monthFilter =
    document.getElementById("monthFilter");



  const months =
    [...new Set(allData.map(item => item.month))];



  monthFilter.innerHTML =
    `<option value="All">
      All Months
    </option>`;



  months.forEach(month => {

    monthFilter.innerHTML +=
      `<option value="${month}">
        ${month}
      </option>`;

  });

}

function populateDepartmentFilter() {

  const departmentFilter =
    document.getElementById("departmentFilter");



  const departments =
    [...new Set(allData.map(item => item.category))];



  departmentFilter.innerHTML =
    `<option value="All">
      All Departments
    </option>`;



  departments.forEach(department => {

    departmentFilter.innerHTML +=
      `<option value="${department}">
        ${department}
      </option>`;

  });

}



// MAIN DASHBOARD UPDATE

function updateDashboard(filteredData) {

  // TOTAL INFLOW

  const totalInflow = filteredData
    .filter(item => item.flowType === "Inflow")
    .reduce((sum, item) => sum + item.amount, 0);



  // TOTAL OUTFLOW

  const totalOutflow = filteredData
    .filter(item => item.flowType === "Outflow")
    .reduce((sum, item) => sum + item.amount, 0);



  // NET CASH FLOW

  const netCashFlow =
    totalInflow - totalOutflow;



  // ENDING BALANCE

  const endingBalance =
    netCashFlow;



  // UPDATE KPI CARDS

  document.getElementById("totalInflow")
    .innerText =
    "₹" + totalInflow.toLocaleString("en-IN");



  document.getElementById("totalOutflow")
    .innerText =
    "₹" + totalOutflow.toLocaleString("en-IN");



  document.getElementById("netCashFlow")
    .innerText =
    "₹" + netCashFlow.toLocaleString("en-IN");



  document.getElementById("endingBalance")
    .innerText =
    "₹" + endingBalance.toLocaleString("en-IN");



  // DESTROY OLD CHARTS

  if (cashFlowChart) {
    cashFlowChart.destroy();
  }

  if (categoryChart) {
    categoryChart.destroy();
  }

  if (monthChart) {
    monthChart.destroy();
  }

  if (departmentChart) {
    departmentChart.destroy();
  }



  // CHART 1
  // INFLOW VS OUTFLOW

  cashFlowChart = new Chart(
    document.getElementById("cashFlowTypeChart"),
    {

      type: "bar",

      data: {

        labels: ["Inflow", "Outflow"],

        datasets: [{
          label: "Amount",

          data: [
            totalInflow,
            totalOutflow
          ]
        }]
      }

    }
  );



  // CHART 2
  // OUTFLOW BY CATEGORY

  const outflowData =
    filteredData.filter(
      item => item.flowType === "Outflow"
    );



  categoryChart = new Chart(
    document.getElementById("categoryChart"),
    {

      type: "doughnut",

      data: {

        labels:
          outflowData.map(item => item.category),

        datasets: [{
          data:
            outflowData.map(item => item.amount)
        }]
      }

    }
  );



  // CHART 3
  // NET CASH FLOW BY MONTH

  const monthTotals = {};



  filteredData.forEach(item => {

    if (!monthTotals[item.month]) {
      monthTotals[item.month] = 0;
    }



    if (item.flowType === "Inflow") {
      monthTotals[item.month] += item.amount;
    }

    else {
      monthTotals[item.month] -= item.amount;
    }

  });



  monthChart = new Chart(
    document.getElementById("monthChart"),
    {

      type: "line",

      data: {

        labels: Object.keys(monthTotals),

        datasets: [{
          label: "Net Cash Flow",

          data: Object.values(monthTotals)
        }]
      }

    }
  );



  // CHART 4
  // CATEGORY TOTALS

  const categoryTotals = {};



  filteredData.forEach(item => {

    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = 0;
    }

    categoryTotals[item.category] += item.amount;

  });



  departmentChart = new Chart(
    document.getElementById("departmentChart"),
    {

      type: "bar",

      data: {

        labels: Object.keys(categoryTotals),

        datasets: [{
          label: "Amount",

          data: Object.values(categoryTotals)
        }]
      },

      options: {
        indexAxis: "y"
      }

    }
  );

}



// APPLY FILTERS

function applyFilters() {

  const selectedMonth =
    document.getElementById("monthFilter").value;

  const selectedFlow =
    document.getElementById("cashFlowFilter").value;

  const selectedDepartment =
    document.getElementById("departmentFilter").value;



  let filteredData = allData;



  // MONTH FILTER

  if (selectedMonth !== "All") {

    filteredData =
      filteredData.filter(
        item => item.month === selectedMonth
      );

  }



  // CASH FLOW FILTER

  if (selectedFlow !== "All") {

    filteredData =
      filteredData.filter(
        item => item.flowType === selectedFlow
      );

  }


  if (selectedDepartment !== "All") {

    filteredData =
      filteredData.filter(
        item => item.category === selectedDepartment
      );

  }


  updateDashboard(filteredData);

}



// EVENT LISTENERS

document.getElementById("monthFilter")
  .addEventListener("change", applyFilters);



document.getElementById("cashFlowFilter")
  .addEventListener("change", applyFilters);


  document.getElementById("departmentFilter")
  .addEventListener("change", applyFilters);



// INITIAL LOAD

loadDashboard();