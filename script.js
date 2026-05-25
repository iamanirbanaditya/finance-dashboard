let allData = [];

let cashFlowChart;
let categoryChart;
let monthChart;
let groupChart;



// FORMAT MONEY

function formatIndianCurrency(num) {

  if (num >= 10000000) {
    return (num / 10000000).toFixed(3) + " Cr";
  }

  if (num >= 100000) {
    return (num / 100000).toFixed(2) + " L";
  }

  return num.toLocaleString("en-IN");

}



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
    `<option value="All">All Months</option>`;


  months.forEach(month => {

    monthFilter.innerHTML +=
      `<option value="${month}">
        ${month}
      </option>`;

  });

}



// GROUP FILTER

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

function populateCategoryFilter(selectedGroup = "All") {

  const categoryFilter =
    document.getElementById("categoryFilter");



  let filteredCategories = allData;



  if (selectedGroup !== "All") {

    filteredCategories =
      allData.filter(
        item => item.group === selectedGroup
      );

  }



  const categories =
    [...new Set(
      filteredCategories.map(item => item.category)
    )];



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



  const outflowPercent =
    totalInflow > 0
      ? ((totalOutflow / totalInflow) * 100)
          .toFixed(1)
      : 0;



  // KPI CARDS

  document.getElementById("totalInflow")
    .innerText =
    "₹" + formatIndianCurrency(totalInflow);



  document.getElementById("totalOutflow")
    .innerText =
    "₹" + formatIndianCurrency(totalOutflow);



  document.getElementById("netCashFlow")
    .innerText =
    "₹" + formatIndianCurrency(netCashFlow);



  document.getElementById("endingBalance")
    .innerText =
    "₹" + formatIndianCurrency(endingBalance);



  // OPTIONAL KPI

  const outflowCard =
    document.getElementById("outflowPercent");

  if (outflowCard) {
    outflowCard.innerText =
      outflowPercent + "%";
  }



  // DESTROY CHARTS

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

          borderRadius: 12

        }]
      },

      options: {

        responsive: true,

        plugins: {

          legend: {
            labels: {
              color: "white"
            }
          },

          tooltip: {

            callbacks: {

              label: function(context) {

                return (
                  "₹" +
                  formatIndianCurrency(context.raw)
                );

              }

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
            "#6366f1"

          ],

          borderWidth: 0

        }]
      },

      options: {

        plugins: {

          tooltip: {

            callbacks: {

              label: function(context) {

                return (
                  context.label +
                  ": ₹" +
                  formatIndianCurrency(context.raw)
                );

              }

            }

          },

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
          },

          tooltip: {

            callbacks: {

              label: function(context) {

                return (
                  "₹" +
                  formatIndianCurrency(context.raw)
                );

              }

            }

          }

        }

      }

    }
  );



  // CHART 4
  // GROUP ANALYSIS

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
          },

          tooltip: {

            callbacks: {

              label: function(context) {

                return (
                  "₹" +
                  formatIndianCurrency(context.raw)
                );

              }

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



  populateCategoryFilter(selectedGroup);



  let filteredData = allData;



  // MONTH

  if (selectedMonth !== "All") {

    filteredData =
      filteredData.filter(
        item => item.month === selectedMonth
      );

  }



  // FLOW

  if (selectedFlow !== "All") {

    filteredData =
      filteredData.filter(
        item => item.flowType === selectedFlow
      );

  }



  // GROUP

  if (selectedGroup !== "All") {

    filteredData =
      filteredData.filter(
        item => item.group === selectedGroup
      );

  }



  // CATEGORY

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