let allData = [];



async function loadDashboard() {

  const response =
    await fetch("data/dashboard-data.json");

  allData = await response.json();



  populateMonthFilter();

  updateDashboard(allData);

}



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

  Chart.helpers.each(Chart.instances, function(instance){
    instance.destroy();
  });



  // CHART 1

  new Chart(
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

  const outflowData =
    filteredData.filter(
      item => item.flowType === "Outflow"
    );



  new Chart(
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



  new Chart(
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

  const categoryTotals = {};



  filteredData.forEach(item => {

    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = 0;
    }

    categoryTotals[item.category] += item.amount;

  });



  new Chart(
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



document.getElementById("monthFilter")
  .addEventListener("change", function() {

    const selectedMonth =
      this.value;



    if (selectedMonth === "All") {

      updateDashboard(allData);

    }

    else {

      const filteredData =
        allData.filter(
          item => item.month === selectedMonth
        );

      updateDashboard(filteredData);

    }

});



loadDashboard();