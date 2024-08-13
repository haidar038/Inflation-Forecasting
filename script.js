function forecastInflation() {
    const periods = [];
    const inflationRates = [];
    for (let i = 0; i < inflationData.length; i++) {
        // Ubah string tahun menjadi objek Date
        periods.push(new Date(inflationData[i]["Period"]));
        inflationRates.push(parseFloat(inflationData[i]["Inflation Data"]));
    }

    function linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b.getFullYear(), 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi.getFullYear() * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi.getFullYear() * xi.getFullYear(), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    }

    const { slope, intercept } = linearRegression(periods, inflationRates);

    const forecastedInflation = [];
    const forecastPeriods = [];
    const currentYear = new Date().getFullYear();
    const lastYear = periods[periods.length - 1].getFullYear();

    for (let i = lastYear + 1; i <= currentYear + 5; i++) {
        forecastPeriods.push(new Date(i, 0, 1)); // 1 Januari tahun i
        forecastedInflation.push(slope * i + intercept);
    }

    const allPeriods = [...periods, ...forecastPeriods];
    const allInflationRates = [...inflationRates, ...forecastedInflation];

    const options = {
        chart: {
            type: "line",
            zoom: {
                enabled: true,
                type: "x",
            },
            toolbar: {
                autoSelected: "zoom",
            },
        },
        stroke: {
            width: 2.5,
            curve: "smooth",
        },
        series: [
            {
                name: "Data Inflasi (%)",
                data: allPeriods.map((period, index) => ({
                    x: period,
                    y: allInflationRates[index],
                })),
            },
        ],
        xaxis: {
            type: "datetime",
            labels: {
                format: "yyyy", // Ubah format sumbu X menjadi tahun
            },
            title: {
                text: "Tahun",
            },
            tooltip: {
                formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
                    const date = new Date(value);
                    return date.getFullYear();
                },
            },
        },
        yaxis: {
            title: {
                text: "Inflasi (%)",
            },
            labels: {
                formatter: function (value) {
                    return value.toFixed(2) + "%";
                },
            },
        },
    };

    const chart = new ApexCharts(document.querySelector("#inflationChart"), options);
    chart.render();

    const tableBody = document.querySelector("#tableBody");
    const pagination = document.querySelector("#pagination");

    let currentPage = 1;
    const rowsPerPage = 10;

    function displayTable(page) {
        tableBody.innerHTML = "";

        // Mengurutkan allPeriods secara descending (dari tahun terbaru ke terlama)
        const sortedPeriods = [...allPeriods].sort((a, b) => b.getFullYear() - a.getFullYear());
        const sortedInflationRates = sortedPeriods.map((period) => {
            const index = allPeriods.findIndex((p) => p.getTime() === period.getTime());
            return allInflationRates[index];
        });

        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const dataToDisplay = sortedPeriods.slice(start, end).map((period, index) => ({
            year: period.getFullYear(), // Tampilkan tahun saja
            inflation: sortedInflationRates.slice(start, end)[index].toFixed(2),
            isForecasting: start + index >= periods.length,
        }));

        dataToDisplay.forEach((row) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${row.year}</td><td>${row.inflation}%</td>`;
            if (row.isForecasting) {
                tr.classList.add("forecasting-row");
            }
            tableBody.appendChild(tr);
        });

        displayPagination();
    }

    function displayPagination() {
        pagination.innerHTML = "";
        const pageCount = Math.ceil(allPeriods.length / rowsPerPage);

        addPaginationButton("<i class='bi bi-chevron-double-left'></i>", 1);
        addPaginationButton("<i class='bi bi-chevron-left'></i>", currentPage - 1, currentPage > 1);

        if (pageCount <= 5) {
            for (let i = 1; i <= pageCount; i++) {
                addPaginationButton(i, i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 3; i++) {
                    addPaginationButton(i, i);
                }
                addPaginationButton("...", null, false);
                addPaginationButton(pageCount, pageCount);
            } else if (currentPage >= pageCount - 2) {
                addPaginationButton(1, 1);
                addPaginationButton("...", null, false);
                for (let i = pageCount - 2; i <= pageCount; i++) {
                    addPaginationButton(i, i);
                }
            } else {
                addPaginationButton(1, 1);
                addPaginationButton("...", null, false);
                addPaginationButton(currentPage - 1, currentPage - 1);
                addPaginationButton(currentPage, currentPage);
                addPaginationButton(currentPage + 1, currentPage + 1);
                addPaginationButton("...", null, false);
                addPaginationButton(pageCount, pageCount);
            }
        }

        addPaginationButton("<i class='bi bi-chevron-right'></i>", currentPage + 1, currentPage < pageCount);
        addPaginationButton("<i class='bi bi-chevron-double-right'></i>", pageCount);
    }

    function addPaginationButton(text, page, enabled = true) {
        const li = document.createElement("li");
        li.classList.add("page-item");
        if (!enabled) {
            li.classList.add("disabled");
        }
        li.innerHTML = `<a class="page-link" href="#">${text}</a>`;
        if (enabled) {
            li.addEventListener("click", () => {
                currentPage = page;
                displayTable(currentPage);
            });
        }
        if (page === currentPage) {
            li.classList.add("active");
        }
        pagination.appendChild(li);
    }

    displayTable(currentPage);
}

forecastInflation();
