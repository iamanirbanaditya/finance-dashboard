async function loadDashboard() {

  // LOAD REAL DATA

  const response = await fetch("data/dashboard-data.json");

  const data = await response.json();



  // TOTAL INFLOW

  const totalInflow = data
    .filter(item => item.flowType === "Inflow")
    .reduce((sum, item) => sum + item.amount, 0);



  // TOTAL OUTFLOW

  const totalOutflow = data
    .filter(item => item.flowType === "Outflow")
    .reduce((sum, item) => sum + item.amount, 0);



  // NET CASH FLOW

  const netCashFlow = totalInflow - totalOutflow;



  // ENDING BALANCE

  const endingBalance = netCashFlow;



  // UPDATE KPI CARDS

  document.getElementById("totalInflow").innerText =
    "₹" + totalInflow.toLocaleString("en-IN");

  document.getElementById("totalOutflow").innerText =
    "₹" + totalOutflow.toLocaleString("en-IN");

  document.getElementById("netCashFlow").innerText =
    "₹" + netCashFlow.toLocaleString("en-IN");

  document.getElementById("endingBalance").innerText =
    "₹" + endingBalance.toLocaleString("en-IN");



  // CHART 1
  // INFLOW VS OUTFLOW

  new Chart(document.getElementById("cashFlowTypeChart"), {

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

  });



  // CHART 2
  // OUTFLOW BY CATEGORY

  const outflowData = data.filter(
    item => item.flowType === "Outflow"
  );



  new Chart(document.getElementById("categoryChart"), {

    type: "doughnut",

    data: {

      labels: outflowData.map(item => item.category),

      datasets: [{
        data: outflowData.map(item => item.amount)
      }]
    }

  });



  // CHART 3
  // NET CASH FLOW BY MONTH

  const monthTotals = {};



  data.forEach(item => {

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



  new Chart(document.getElementById("monthChart"), {

    type: "line",

    data: {

      labels: Object.keys(monthTotals),

      datasets: [{
        label: "Net Cash Flow",

        data: Object.values(monthTotals)
      }]
    }

  });



  // CHART 4
  // ENDING BALANCE BY CATEGORY

  const categoryTotals = {};



  data.forEach(item => {

    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = 0;
    }

    categoryTotals[item.category] += item.amount;

  });



  new Chart(document.getElementById("departmentChart"), {

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

  });

}



loadDashboard();