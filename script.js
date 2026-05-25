let allData = [];

let cashFlowChart;
let categoryChart;
let monthChart;
let groupChart;



// LOAD DASHBOARD

async function loadDashboard() {

  const response =
    await fetch("data/dashboard-data.json");

  allData = await response.json();



  populateMonthFilter();

  populateGroupFilter();

  populateCategoryFilter();



  updateDashboard(allData);

}



// MONTH FILTER

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



// FINANCIAL GROUP FILTER

function populateGroupFilter() {

  const groupFilter =
    document.getElementById("groupFilter");



  const groups =
    [...new Set(allData.map(item => item.group))];



  groupFilter.innerHTML =
    `<option value="All">
      All Financial Groups
    </option>`;



  groups.forEach(group => {

    groupFilter.innerHTML +=
      `<option value="${group}">
        ${group}
      </option>`;

  });

}



// CATEGORY FILTER

function populateCategoryFilter() {

  const categoryFilter =
    document.getElementById("categoryFilter");



  const categories =
    [...new Set(allData.map(item => item.category))];



  categoryFilter.innerHTML =
    `<option value="All">
      All Categories
    </option>`;



  categories.forEach(category => {

    categoryFilter.innerHTML +=
      `<option value="${category}">
        ${category}
      </option>`;

  });

}



// UPDATE DASHBOARD

function updateDashboard(filteredData) {

  // TOTALS

  const totalInflow = filteredData
    .filter(item => item.flowType === "Inflow")
    .reduce((sum, item) => sum + item.amount, 0);



  const totalOutflow = filteredData
    .filter(item => item.flowType === "Outflow")
    .reduce((sum, item) => sum + item.amount, 0);



  const netCashFlow =
    totalInflow - totalOutflow;



  const endingBalance =
    netCashFlow;



  // KPI CARDS

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

  if (cashFlowChart) cashFlowChart.destroy();

  if (categoryChart) categoryChart.destroy();

  if (monthChart) monthChart.destroy();

  if (groupChart) groupChart.destroy();



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
          ],

          backgroundColor: [
            "#22c55e",
            "#ef4444"
          ],

          borderRadius: 12,

          borderSkipped: false

        }]
      },

      options: {

        responsive: true,

        plugins: {

          legend: {
            labels: {
              color: "white"
            }
          }

        },

        scales: {

          x: {

            ticks: {
              color: "white"
            },

            grid: {
              color: "#334155"
            }

          },

          y: {

            ticks: {
              color: "white"
            },

            grid: {
              color: "#334155"
            }

          }

        }

      }

    }
  );



  // CHART 2
  // CATEGORY DONUT

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
            outflowData.map(item => item.amount),

          backgroundColor: [

            "#3b82f6",
            "#8b5cf6",
            "#f59e0b",
            "#ef4444",
            "#14b8a6",
            "#ec4899",
            "#22c55e",
            "#f97316",
            "#06b6d4",
            "#84cc16",
            "#6366f1",
            "#e11d48"

          ],

          borderWidth: 0

        }]
      },

      options: {

        plugins: {

          legend: {

            position: "bottom",

            labels: {
              color: "white"
            }

          }

        }

      }

    }
  );



  // CHART 3
  // NET CASH FLOW TREND

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

          data: Object.values(monthTotals),

          borderColor: "#C8102E",

          backgroundColor:
            "rgba(200,16,46,0.15)",

          fill: true,

          tension: 0.4,

          pointBackgroundColor: "#ffffff",

          pointBorderColor: "#C8102E",

          pointRadius: 5

        }]
      },

      options: {

        plugins: {

          legend: {
            labels: {
              color: "white"
            }
          }

        },

        scales: {

          x: {

            ticks: {
              color: "white"
            },

            grid: {
              color: "#334155"
            }

          },

          y: {

            ticks: {
              color: "white"
            },

            grid: {
              color: "#334155"
            }

          }

        }

      }

    }
  );



  // CHART 4
  // FINANCIAL GROUP ANALYSIS

  const groupTotals = {};



  filteredData.forEach(item => {

    if (!groupTotals[item.group]) {
      groupTotals[item.group] = 0;
    }

    groupTotals[item.group] += item.amount;

  });



  groupChart = new Chart(
    document.getElementById("departmentChart"),
    {

      type: "bar",

      data: {

        labels: Object.keys(groupTotals),

        datasets: [{

          label: "Amount",

          data: Object.values(groupTotals),

          backgroundColor: [
            "#06b6d4",
            "#3b82f6",
            "#8b5cf6",
            "#ec4899",
            "#f97316",
            "#22c55e",
            "#eab308"
          ],

          borderRadius: 10,

          borderSkipped: false

        }]
      },

      options: {

        responsive: true,

        plugins: {

          legend: {
            labels: {
              color: "white"
            }
          }

        },

        scales: {

          x: {

            ticks: {
              color: "white"
            },

            grid: {
              color: "#334155"
            }

          },

          y: {

            ticks: {
              color: "white"
            },

            grid: {
              color: "#334155"
            }

          }

        }

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

  const selectedGroup =
    document.getElementById("groupFilter").value;

  const selectedCategory =
    document.getElementById("categoryFilter").value;



  let filteredData = allData;



  // MONTH FILTER

  if (selectedMonth !== "All") {

    filteredData =
      filteredData.filter(
        item => item.month === selectedMonth
      );

  }



  // FLOW FILTER

  if (selectedFlow !== "All") {

    filteredData =
      filteredData.filter(
        item => item.flowType === selectedFlow
      );

  }



  // GROUP FILTER

  if (selectedGroup !== "All") {

    filteredData =
      filteredData.filter(
        item => item.group === selectedGroup
      );

  }



  // CATEGORY FILTER

  if (selectedCategory !== "All") {

    filteredData =
      filteredData.filter(
        item => item.category === selectedCategory
      );

  }



  updateDashboard(filteredData);

}



// EVENT LISTENERS

document.getElementById("monthFilter")
  .addEventListener("change", applyFilters);

document.getElementById("cashFlowFilter")
  .addEventListener("change", applyFilters);

document.getElementById("groupFilter")
  .addEventListener("change", applyFilters);

document.getElementById("categoryFilter")
  .addEventListener("change", applyFilters);



// INITIAL LOAD

loadDashboard();