document.getElementById("forecastForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const years = document.getElementById("years").value;
    forecastInflation(years);
});

function forecastInflation(years) {
    // Convert data to numerical format
    const periods = inflationData.map((item, index) => index + 1);
    const inflationRates = inflationData.map((item) => parseFloat(item["Data Inflasi"]));

    // Function to calculate linear regression
    function linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    }

    // Apply linear regression to the data
    const { slope, intercept } = linearRegression(periods, inflationRates);

    // Forecast the next periods' inflation
    const forecastedPeriods = [];
    const forecastedInflation = [];
    for (let i = 1; i <= years; i++) {
        const nextPeriod = periods.length + i;
        const forecast = slope * nextPeriod + intercept;
        forecastedPeriods.push(nextPeriod);
        forecastedInflation.push(forecast);
    }

    // Combine existing and forecasted data
    const allPeriods = [...periods, ...forecastedPeriods];
    const allInflationRates = [...inflationRates, ...forecastedInflation];

    // Plot the data using Chart.js
    const ctx = document.getElementById("inflationChart").getContext("2d");
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [...inflationData.map((item) => item.Periode), ...forecastedPeriods.map((p) => `Forecast ${p}`)],
            datasets: [
                {
                    label: "Data Inflasi (%)",
                    data: allInflationRates,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Periode",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Inflasi (%)",
                    },
                    beginAtZero: false,
                },
            },
        },
    });

    console.log(
        `Perkiraan inflasi untuk ${years} tahun ke depan:`,
        forecastedInflation.map((f) => f.toFixed(2))
    );
}

// Initial forecast for 1 year
forecastInflation(1);
