document.addEventListener("DOMContentLoaded", function () {
    fetch("/summaryData")
        .then((response) => response.json())
        .then((data) => {
            const tableBody = document.querySelector("#search-table tbody");

            tableBody.innerHTML = "";

            data.forEach((item) => {
                const ip = Object.keys(item)[0];
                const details = item[ip];
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${details.date || "N/A"}</td>
                    <td>${ip || "N/A"}</td>
                    <td>${details.notation || "N/A"}</td>
                    <td>${details.total|| "N/A"}</td>
                `;

                tableBody.appendChild(row);
            });
        })
    
});