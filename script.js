let allData = [];

let cashFlowChart;
let categoryChart;
let monthChart;
let groupChart;
let inflowContributionChart;
let outflowContributionChart;



// FORMAT MONEY

function formatIndianCurrency(num) {

  if (num >= 10000000) {
    return (num / 10000000).toFixed(2) + " Cr";
  }

  if (num >= 100000) {
    return (num / 100000).toFixed(2) + " L";
  }

  return num.toLocaleString("en-IN");

}



// LAST UPDATED

function updateLastUpdated() {

  const now = new Date();

  document.getElementById(
    "lastUpdated"
  ).innerText =
    now.toLocaleString("en-IN");

}



// LOAD DASHBOARD

async function loadDashboard() {

  updateLastUpdated();



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
    `
    <option value="All">
      All Months
    </option>
    `;



  months.forEach(month => {

    monthFilter.innerHTML +=
    `
    <option value="${month}">
      ${month}
    </option>
    `;

  });

}



// GROUP FILTER

function populateGroupFilter() {

  const groupFilter =
    document.getElementById("groupFilter");



  const groups =
    [...new Set(allData.map(item => item.group))];



  groupFilter.innerHTML =
    `
    <option value="All">
      All Financial Groups
    </option>
    `;



  groups.forEach(group => {

    groupFilter.innerHTML +=
    `
    <option value="${group}">
      ${group}
    </option>
    `;

  });

}



// CATEGORY FILTER

function populateCategoryFilter(
  selectedGroup = "All"
) {

  const categoryFilter =
    document.getElementById(
      "categoryFilter"
    );



  let filteredCategories = allData;



  if (selectedGroup !== "All") {

    filteredCategories =
      allData.filter(
        item => item.group === selectedGroup
      );

  }



  const categories =
    [...new Set(
      filteredCategories.map(
        item => item.category
      )
    )];



  categoryFilter.innerHTML =
    `
    <option value="All">
      All Categories
    </option>
    `;



  categories.forEach(category => {

    categoryFilter.innerHTML +=
    `
    <option value="${category}">
      ${category}
    </option>
    `;

  });

}



// UPDATE DASHBOARD

function updateDashboard(filteredData) {

  // TOTALS

  const totalInflow =
    filteredData
    .filter(
      item => item.flowType === "Inflow"
    )
    .reduce(
      (sum, item) => sum + item.amount,
      0
    );



  const totalOutflow =
    filteredData
    .filter(
      item => item.flowType === "Outflow"
    )
    .reduce(
      (sum, item) => sum + item.amount,
      0
    );



  const netCashFlow =
    totalInflow - totalOutflow;



  const endingBalance =
    netCashFlow;



  const outflowPercent =
    totalInflow > 0
    ? (
        (totalOutflow / totalInflow) * 100
      ).toFixed(1)
    : 0;



  // KPI UPDATE

  document.getElementById(
    "totalInflow"
  ).innerText =
    "₹" +
    formatIndianCurrency(totalInflow);



  document.getElementById(
    "totalOutflow"
  ).innerText =
    "₹" +
    formatIndianCurrency(totalOutflow);



  document.getElementById(
    "netCashFlow"
  ).innerText =
    "₹" +
    formatIndianCurrency(netCashFlow);



  document.getElementById(
    "endingBalance"
  ).innerText =
    "₹" +
    formatIndianCurrency(endingBalance);



  document.getElementById(
    "outflowPercent"
  ).innerText =
    outflowPercent + "%";



  // EXPENSE DATA

  const outflowData =
    filteredData.filter(
      item => item.flowType === "Outflow"
    );



  // TOP EXPENSE

  const topExpense =
    [...outflowData]
    .sort((a,b) => b.amount - a.amount)[0];



  if (topExpense) {

    document.getElementById(
      "topExpense"
    ).innerText =
      topExpense.category;



    document.getElementById(
      "highestRiskArea"
    ).innerText =
      topExpense.category;



    document.getElementById(
      "highestExpenseGroup"
    ).innerText =
      topExpense.group;

  }



  // TOP INFLOW

  const topInflow =
    filteredData
    .filter(
      item => item.flowType === "Inflow"
    )
    .sort((a,b) => b.amount - a.amount)[0];



  if (topInflow) {

    document.getElementById(
      "highestInflowSource"
    ).innerText =
      topInflow.category;

  }



  // CASH HEALTH

  let health = "Healthy";



  if (outflowPercent > 80) {

    health = "Critical";

  }

  else if (outflowPercent > 60) {

    health = "Warning";

  }



  document.getElementById(
    "cashHealth"
  ).innerText =
    health;



  document.getElementById(
    "financialStatus"
  ).innerText =
    health;



  document.getElementById(
    "outflowRisk"
  ).innerText =
    outflowPercent + "%";



  // EXECUTIVE SUMMARY

  document.getElementById(
    "executiveSummary"
  ).innerText =
    `
    Total inflow is ₹${formatIndianCurrency(totalInflow)}
    while total outflow is ₹${formatIndianCurrency(totalOutflow)}.
    Net cash flow currently stands at
    ₹${formatIndianCurrency(netCashFlow)}.
    `;



  // DESTROY OLD CHARTS

  if (cashFlowChart)
    cashFlowChart.destroy();

  if (categoryChart)
    categoryChart.destroy();

  if (monthChart)
    monthChart.destroy();

  if (groupChart)
    groupChart.destroy();

  if (inflowContributionChart)
    inflowContributionChart.destroy();

  if (outflowContributionChart)
    outflowContributionChart.destroy();



  // CHART 1
  // INFLOW VS OUTFLOW

  cashFlowChart = new Chart(
    document.getElementById(
      "cashFlowTypeChart"
    ),
    {

      type: "bar",

      data: {

        labels: [
          "Inflow",
          "Outflow"
        ],

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

          borderRadius: 14

        }]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            display: false
          },

          tooltip: {

            callbacks: {

              label: function(context) {

                return (
                  "₹" +
                  formatIndianCurrency(
                    context.raw
                  )
                );

              }

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

              color: "white",

              callback: function(value) {

                return formatIndianCurrency(value);

              }

            },

            grid: {
              color: "#334155"
            }

          }

        }

      }

    }
  );



  // TOP 10 EXPENSES

  const expenseTotals = {};



  outflowData.forEach(item => {

    if (!expenseTotals[item.category]) {
      expenseTotals[item.category] = 0;
    }

    expenseTotals[item.category] += item.amount;

  });



  const sortedExpenses =
    Object.entries(expenseTotals)
    .sort((a,b) => b[1] - a[1])
    .slice(0,10);



  categoryChart = new Chart(
    document.getElementById(
      "categoryChart"
    ),
    {

      type: "bar",

      data: {

        labels:
          sortedExpenses.map(item => item[0]),

        datasets: [{

          label: "Expense",

          data:
            sortedExpenses.map(item => item[1]),

          backgroundColor:
            "#ef4444",

          borderRadius: 12

        }]

      },

      options: {

        indexAxis: "y",

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            display: false
          }

        },

        scales: {

          x: {

            ticks: {

              color: "white",

              callback: function(value) {

                return formatIndianCurrency(value);

              }

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
              display: false
            }

          }

        }

      }

    }
  );



  // MONTH TREND CHART

  const months =
    [...new Set(
      filteredData.map(item => item.month)
    )];



  const inflowTrend = [];
  const outflowTrend = [];
  const netTrend = [];



  months.forEach(month => {

    const monthData =
      filteredData.filter(
        item => item.month === month
      );



    const monthInflow =
      monthData
      .filter(
        item => item.flowType === "Inflow"
      )
      .reduce((a,b) => a+b.amount,0);



    const monthOutflow =
      monthData
      .filter(
        item => item.flowType === "Outflow"
      )
      .reduce((a,b) => a+b.amount,0);



    inflowTrend.push(monthInflow);

    outflowTrend.push(monthOutflow);

    netTrend.push(
      monthInflow - monthOutflow
    );

  });



  monthChart = new Chart(
    document.getElementById(
      "monthChart"
    ),
    {

      type: "line",

      data: {

        labels: months,

        datasets: [

          {

            label: "Inflow",

            data: inflowTrend,

            borderColor: "#22c55e",

            backgroundColor:
              "rgba(34,197,94,0.2)",

            tension: 0.4,

            fill: true

          },

          {

            label: "Outflow",

            data: outflowTrend,

            borderColor: "#ef4444",

            backgroundColor:
              "rgba(239,68,68,0.2)",

            tension: 0.4,

            fill: true

          },

          {

            label: "Net Flow",

            data: netTrend,

            borderColor: "#3b82f6",

            backgroundColor:
              "rgba(59,130,246,0.2)",

            tension: 0.4,

            fill: true

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

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

              color: "white",

              callback: function(value) {

                return formatIndianCurrency(value);

              }

            },

            grid: {
              color: "#334155"
            }

          }

        }

      }

    }
  );



  // GROUP ANALYSIS

  const groupTotals = {};



  filteredData.forEach(item => {

    if (!groupTotals[item.group]) {
      groupTotals[item.group] = 0;
    }

    groupTotals[item.group] += item.amount;

  });



  groupChart = new Chart(
    document.getElementById(
      "departmentChart"
    ),
    {

      type: "bar",

      data: {

        labels:
          Object.keys(groupTotals),

        datasets: [{

          label: "Amount",

          data:
            Object.values(groupTotals),

          backgroundColor:
            "#3b82f6",

          borderRadius: 12

        }]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            display: false
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
              display: false
            }

          }

        }

      }

    }
  );



  // INFLOW CONTRIBUTION

  const inflowItems =
    filteredData.filter(
      item => item.flowType === "Inflow"
    );



  inflowContributionChart =
    new Chart(
      document.getElementById(
        "inflowContributionChart"
      ),
      {

        type: "polarArea",

        data: {

          labels:
            inflowItems.map(
              item => item.category
            ),

          datasets: [{

            data:
              inflowItems.map(
                item => item.amount
              ),

            backgroundColor: [

              "#22c55e",
              "#06b6d4",
              "#8b5cf6",
              "#f59e0b",
              "#3b82f6"

            ]

          }]

        }

      }
    );



  // OUTFLOW CONTRIBUTION

  outflowContributionChart =
    new Chart(
      document.getElementById(
        "outflowContributionChart"
      ),
      {

        type: "polarArea",

        data: {

          labels:
            outflowData.map(
              item => item.category
            ),

          datasets: [{

            data:
              outflowData.map(
                item => item.amount
              ),

            backgroundColor: [

              "#ef4444",
              "#f97316",
              "#eab308",
              "#ec4899",
              "#8b5cf6"

            ]

          }]

        }

      }
    );



  // TABLE

  updateTable(filteredData);

}



// UPDATE TABLE

function updateTable(data) {

  const tbody =
    document.querySelector(
      "#financeTable tbody"
    );



  tbody.innerHTML = "";



  data.forEach(item => {

    tbody.innerHTML +=
    `
    <tr>

      <td>${item.month}</td>

      <td>${item.flowType}</td>

      <td>${item.group}</td>

      <td>${item.category}</td>

      <td>
        ₹${formatIndianCurrency(item.amount)}
      </td>

    </tr>
    `;

  });

}



// APPLY FILTERS

function applyFilters() {

  const selectedMonth =
    document.getElementById(
      "monthFilter"
    ).value;



  const selectedFlow =
    document.getElementById(
      "cashFlowFilter"
    ).value;



  const selectedGroup =
    document.getElementById(
      "groupFilter"
    ).value;



  const selectedCategory =
    document.getElementById(
      "categoryFilter"
    ).value;



  populateCategoryFilter(
    selectedGroup
  );



  document.getElementById(
    "categoryFilter"
  ).value = selectedCategory;



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

document.getElementById(
  "monthFilter"
).addEventListener(
  "change",
  applyFilters
);



document.getElementById(
  "cashFlowFilter"
).addEventListener(
  "change",
  applyFilters
);



document.getElementById(
  "groupFilter"
).addEventListener(
  "change",
  applyFilters
);



document.getElementById(
  "categoryFilter"
).addEventListener(
  "change",
  applyFilters
);



// SEARCH

document.getElementById(
  "searchInput"
).addEventListener(
  "keyup",
  function() {

    const value =
      this.value.toLowerCase();



    const rows =
      document.querySelectorAll(
        "#financeTable tbody tr"
      );



    rows.forEach(row => {

      row.style.display =
        row.innerText
        .toLowerCase()
        .includes(value)
        ? ""
        : "none";

    });

  }
);



// EXPORT CSV

document.getElementById(
  "exportBtn"
).addEventListener(
  "click",
  function() {

    let csv =
      "Month,Flow Type,Group,Category,Amount\n";



    allData.forEach(item => {

      csv +=
      `
      ${item.month},
      ${item.flowType},
      ${item.group},
      ${item.category},
      ${item.amount}
      `;

    });



    const blob =
      new Blob(
        [csv],
        { type: "text/csv" }
      );



    const url =
      window.URL.createObjectURL(blob);



    const a =
      document.createElement("a");



    a.href = url;

    a.download =
      "cash-flow-report.csv";



    a.click();

  }
);



// INITIAL LOAD

loadDashboard();