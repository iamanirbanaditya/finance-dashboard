const data = {
  totalInflow: 1450000,
  totalOutflow: 980000,
  netCash: 470000
};


document.getElementById("inflow").innerText =
  "₹" + data.totalInflow.toLocaleString("en-IN");

document.getElementById("outflow").innerText =
  "₹" + data.totalOutflow.toLocaleString("en-IN");

document.getElementById("netcash").innerText =
  "₹" + data.netCash.toLocaleString("en-IN");


const ctx = document.getElementById("financeChart");


new Chart(ctx, {
  type: "bar",

  data: {
    labels: ["Inflow", "Outflow", "Net Cash"],

    datasets: [{
      label: "Financial Summary",

      data: [
        data.totalInflow,
        data.totalOutflow,
        data.netCash
      ],

      borderWidth: 1
    }]
  },

  options: {
    responsive: true
  }
});