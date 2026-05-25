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

  populateDepartmentFilter();

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



// DEPARTMENT FILTER

function populateDepartmentFilter() {

  const departmentFilter =
    document.getElementById("departmentFilter");



  const departments =
    [...new Set(allData.map(item => item.flowType))];



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

  if (departmentChart) departmentChart.destroy();



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
  // CATEGORY PIE

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
            "#84cc16"
          ],

          borderWidth: 0

        }]
      },

      options: {

        plugins: {
          legend: {
            labels: {
              color: "white"
            }
          }
        }

      }

    }
  );



  // CHART 3
  // MONTH TREND

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
            "rgba(200,16,46,0.2)",

          fill: true,

          tension: 0.4,

          pointBackgroundColor: "#ffffff",

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

          data: Object.values(categoryTotals),

          backgroundColor: "#3b82f6",

          borderRadius: 10

        }]
      },

      options: {

        indexAxis: "y",

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

  const selectedDepartment =
    document.getElementById("departmentFilter").value;

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



  // DEPARTMENT FILTER

  if (selectedDepartment !== "All") {

    filteredData =
      filteredData.filter(
        item => item.flowType === selectedDepartment
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

document.getElementById("departmentFilter")
  .addEventListener("change", applyFilters);

document.getElementById("categoryFilter")
  .addEventListener("change", applyFilters);



// INITIAL LOAD

loadDashboard();