let allData = [];

let cashFlowChart;
let categoryChart;
let monthChart;
let groupChart;
let topInflowChart;
let topExpenseChart;
let monthlyPercentageChart;



/* =========================
   FORMAT MONEY
========================= */

function formatIndianCurrency(num) {

  if (!num) return "0";

  if (Math.abs(num) >= 10000000) {

    return (
      (num / 10000000).toFixed(2)
      + " Cr"
    );

  }

  if (Math.abs(num) >= 100000) {

    return (
      (num / 100000).toFixed(2)
      + " L"
    );

  }

  return num.toLocaleString("en-IN");

}



/* =========================
   LAST UPDATED
========================= */

function updateLastUpdated() {

  const now = new Date();

  document.getElementById(
    "lastUpdated"
  ).innerText =
    now.toLocaleString("en-IN");

}



/* =========================
   CHART DEFAULTS
========================= */

Chart.defaults.color = "#cbd5e1";

Chart.defaults.font.family =
  "Arial";



/* =========================
   LOAD DASHBOARD
========================= */

async function loadDashboard() {

  updateLastUpdated();

  const response =
    await fetch(
      "data/dashboard-data.json"
    );

  allData = await response.json();

  populateMonthFilter();

  populateGroupFilter();

  populateCategoryFilter();

  applyFilters();

}



/* =========================
   MONTH FILTER
========================= */

function populateMonthFilter() {

  const monthFilter =
    document.getElementById(
      "monthFilter"
    );

  const months =
    [...new Set(
      allData.map(item => item.month)
    )];

  monthFilter.innerHTML =
    `<option value="All">
      All Months
    </option>`;

  months.forEach(month => {

    monthFilter.innerHTML +=
    `
    <option value="${month}">
      ${month}
    </option>
    `;

  });

}



/* =========================
   GROUP FILTER
========================= */

function populateGroupFilter() {

  const groupFilter =
    document.getElementById(
      "groupFilter"
    );

  const groups =
    [...new Set(
      allData.map(item => item.group)
    )];

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



/* =========================
   CATEGORY FILTER
========================= */

function populateCategoryFilter(
  selectedGroup = "All"
) {

  const categoryFilter =
    document.getElementById(
      "categoryFilter"
    );

  let filteredCategories =
    allData;

  if (selectedGroup !== "All") {

    filteredCategories =
      allData.filter(
        item =>
          item.group === selectedGroup
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



/* =========================
   UPDATE DASHBOARD
========================= */

function updateDashboard(filteredData) {

  const totalInflow =
    filteredData
    .filter(
      item =>
        item.flowType === "Inflow"
    )
    .reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const totalOutflow =
    filteredData
    .filter(
      item =>
        item.flowType === "Outflow"
    )
    .reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const netCashFlow =
    totalInflow - totalOutflow;

  const outflowPercent =
    totalInflow > 0
      ? (
          (totalOutflow /
            totalInflow) * 100
        ).toFixed(1)
      : 0;



  /* =========================
     KPI UPDATE
  ========================= */

  document.getElementById(
    "totalInflow"
  ).innerText =
    "₹" +
    formatIndianCurrency(
      totalInflow
    );

  document.getElementById(
    "totalOutflow"
  ).innerText =
    "₹" +
    formatIndianCurrency(
      totalOutflow
    );

  document.getElementById(
    "netCashFlow"
  ).innerText =
    "₹" +
    formatIndianCurrency(
      netCashFlow
    );

  document.getElementById(
    "endingBalance"
  ).innerText =
    "₹" +
    formatIndianCurrency(
      netCashFlow
    );

  document.getElementById(
    "outflowPercent"
  ).innerText =
    outflowPercent + "%";



  const outflowData =
    filteredData.filter(
      item =>
        item.flowType === "Outflow"
    );

  const inflowData =
    filteredData.filter(
      item =>
        item.flowType === "Inflow"
    );



  /* =========================
     EXPENSE TOTALS
  ========================= */

  const expenseTotals = {};

  outflowData.forEach(item => {

    if (
      !expenseTotals[item.category]
    ) {

      expenseTotals[item.category] = 0;

    }

    expenseTotals[item.category] +=
      item.amount;

  });



  const sortedExpenses =
    Object.entries(
      expenseTotals
    ).sort((a, b) => b[1] - a[1]);



  if (sortedExpenses.length > 0) {

    document.getElementById(
      "topExpense"
    ).innerText =
      sortedExpenses[0][0];

    document.getElementById(
      "highestRiskArea"
    ).innerText =
      sortedExpenses[0][0];

  }



  document.getElementById(
    "highestExpenseGroup"
  ).innerText =
    filteredData[0]?.group || "-";



  const highestInflow =
    inflowData.sort(
      (a, b) =>
        b.amount - a.amount
    )[0];



  if (highestInflow) {

    document.getElementById(
      "highestInflowSource"
    ).innerText =
      highestInflow.category;

  }



  let health = "Healthy";

  if (outflowPercent > 80) {

    health = "Critical";

  }

  else if (outflowPercent > 60) {

    health = "Warning";

  }

  document.getElementById(
    "cashHealth"
  ).innerText = health;

  document.getElementById(
    "financialStatus"
  ).innerText = health;

  document.getElementById(
    "outflowRisk"
  ).innerText =
    outflowPercent + "%";



  document.getElementById(
    "executiveSummary"
  ).innerText =
    `
    Total inflow is ₹${formatIndianCurrency(totalInflow)}
    while outflow is ₹${formatIndianCurrency(totalOutflow)}.
    Current net cash flow stands at
    ₹${formatIndianCurrency(netCashFlow)}.
    `;



  /* =========================
     DESTROY OLD CHARTS
  ========================= */

  if (cashFlowChart)
    cashFlowChart.destroy();

  if (categoryChart)
    categoryChart.destroy();

  if (monthChart)
    monthChart.destroy();

  if (groupChart)
    groupChart.destroy();

  if (topInflowChart)
    topInflowChart.destroy();

  if (topExpenseChart)
    topExpenseChart.destroy();

  if (monthlyPercentageChart)
    monthlyPercentageChart.destroy();



  /* =========================
     CHART 1
     INFLOW VS OUTFLOW
  ========================= */

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
          }

        }

      }

    }
  );



  /* =========================
     CHART 2
     TOP EXPENSES
  ========================= */

  categoryChart = new Chart(
    document.getElementById(
      "categoryChart"
    ),
    {

      type: "bar",

      data: {

        labels:
          sortedExpenses
          .slice(0, 10)
          .map(item => item[0]),

        datasets: [{

          data:
            sortedExpenses
            .slice(0, 10)
            .map(item => item[1]),

          backgroundColor:
            "#ef4444",

          borderRadius: 10

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

        }

      }

    }
  );



  /* =========================
     MONTH TREND
  ========================= */

  const months =
    [...new Set(
      filteredData.map(
        item => item.month
      )
    )];

  const inflowTrend = [];
  const outflowTrend = [];
  const netTrend = [];



  months.forEach(month => {

    const monthData =
      filteredData.filter(
        item =>
          item.month === month
      );

    const inflow =
      monthData
      .filter(
        item =>
          item.flowType === "Inflow"
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );

    const outflow =
      monthData
      .filter(
        item =>
          item.flowType === "Outflow"
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );

    inflowTrend.push(inflow);

    outflowTrend.push(outflow);

    netTrend.push(
      inflow - outflow
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

            tension: 0.4

          },

          {

            label: "Outflow",

            data: outflowTrend,

            borderColor: "#ef4444",

            tension: 0.4

          },

          {

            label: "Net Flow",

            data: netTrend,

            borderColor: "#3b82f6",

            tension: 0.4

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false

      }

    }
  );



  /* =========================
     GROUP ANALYSIS
  ========================= */

  const groupTotals = {};

  filteredData.forEach(item => {

    if (!groupTotals[item.group]) {

      groupTotals[item.group] = 0;

    }

    groupTotals[item.group] +=
      item.amount;

  });



  groupChart = new Chart(
    document.getElementById(
      "departmentChart"
    ),
    {

      type: "doughnut",

      data: {

        labels:
          Object.keys(groupTotals),

        datasets: [{

          data:
            Object.values(
              groupTotals
            ),

          backgroundColor: [

            "#3b82f6",
            "#22c55e",
            "#ef4444",
            "#8b5cf6",
            "#f59e0b"

          ]

        }]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false

      }

    }
  );



  /* =========================
     TOP INFLOW SOURCES
  ========================= */

  const inflowTotals = {};

  inflowData.forEach(item => {

    if (!inflowTotals[item.category]) {

      inflowTotals[item.category] = 0;

    }

    inflowTotals[item.category] +=
      item.amount;

  });

  const sortedInflows =
    Object.entries(inflowTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);



  topInflowChart = new Chart(
    document.getElementById(
      "topInflowChart"
    ),
    {

      type: "bar",

      data: {

        labels:
          sortedInflows.map(
            item => item[0]
          ),

        datasets: [{

          data:
            sortedInflows.map(
              item => item[1]
            ),

          backgroundColor:
            "#22c55e",

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

        }

      }

    }
  );



  /* =========================
     TOP EXPENSE DRIVERS
  ========================= */

  topExpenseChart = new Chart(
    document.getElementById(
      "topExpenseChart"
    ),
    {

      type: "bar",

      data: {

        labels:
          sortedExpenses
          .slice(0, 5)
          .map(item => item[0]),

        datasets: [{

          data:
            sortedExpenses
            .slice(0, 5)
            .map(item => item[1]),

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

        }

      }

    }
  );



  /* =========================
     MONTHLY %
  ========================= */

  const inflowPercentages = [];
  const outflowPercentages = [];

  months.forEach((month, index) => {

    const inflow =
      inflowTrend[index];

    const outflow =
      outflowTrend[index];

    const total =
      inflow + outflow;

    inflowPercentages.push(
      total > 0
        ? (
            (inflow / total) * 100
          ).toFixed(1)
        : 0
    );

    outflowPercentages.push(
      total > 0
        ? (
            (outflow / total) * 100
          ).toFixed(1)
        : 0
    );

  });



  monthlyPercentageChart =
    new Chart(
      document.getElementById(
        "monthlyPercentageChart"
      ),
      {

        type: "line",

        data: {

          labels: months,

          datasets: [

            {

              label: "Inflow %",

              data: inflowPercentages,

              borderColor: "#22c55e",

              tension: 0.4

            },

            {

              label: "Outflow %",

              data: outflowPercentages,

              borderColor: "#ef4444",

              tension: 0.4

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false

        }

      }
    );



  /* =========================
     CATEGORY SUMMARY TABLE
  ========================= */

  const summaryTable =
    document.getElementById(
      "categorySummaryTable"
    );

  summaryTable.innerHTML = "";

  const categoryTotals = {};

  filteredData.forEach(item => {

    if (!categoryTotals[item.category]) {

      categoryTotals[item.category] = {

        inflow: 0,
        outflow: 0

      };

    }

    if (item.flowType === "Inflow") {

      categoryTotals[item.category]
      .inflow += item.amount;

    }

    else {

      categoryTotals[item.category]
      .outflow += item.amount;

    }

  });



  Object.entries(categoryTotals)
  .forEach(([category, values]) => {

    const net =
      values.inflow -
      values.outflow;

    summaryTable.innerHTML +=
    `
    <tr>

      <td>${category}</td>

      <td>
        ₹${formatIndianCurrency(values.inflow)}
      </td>

      <td>
        ₹${formatIndianCurrency(values.outflow)}
      </td>

      <td>
        ₹${formatIndianCurrency(net)}
      </td>

    </tr>
    `;

  });



  updateTable(filteredData);

}



/* =========================
   TABLE
========================= */

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



/* =========================
   APPLY FILTERS
========================= */

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
  ).value =
    selectedCategory;

  let filteredData = allData;

  if (selectedMonth !== "All") {

    filteredData =
      filteredData.filter(
        item =>
          item.month ===
          selectedMonth
      );

  }

  if (selectedFlow !== "All") {

    filteredData =
      filteredData.filter(
        item =>
          item.flowType ===
          selectedFlow
      );

  }

  if (selectedGroup !== "All") {

    filteredData =
      filteredData.filter(
        item =>
          item.group ===
          selectedGroup
      );

  }

  if (selectedCategory !== "All") {

    filteredData =
      filteredData.filter(
        item =>
          item.category ===
          selectedCategory
      );

  }

  updateDashboard(filteredData);

}



/* =========================
   SEARCH
========================= */

document.getElementById(
  "searchInput"
).addEventListener(
  "keyup",
  function () {

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



/* =========================
   EXPORT CSV
========================= */

document.getElementById(
  "exportBtn"
).addEventListener(
  "click",
  function () {

    let csv =
      "Month,Flow Type,Group,Category,Amount\n";

    allData.forEach(item => {

      csv +=
      `${item.month},
      ${item.flowType},
      ${item.group},
      ${item.category},
      ${item.amount}\n`;

    });

    const blob =
      new Blob([csv], {
        type: "text/csv"
      });

    const url =
      window.URL.createObjectURL(
        blob
      );

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "cash-flow-report.csv";

    a.click();

  }
);



/* =========================
   EVENTS
========================= */

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



/* =========================
   INITIAL LOAD
========================= */

loadDashboard();