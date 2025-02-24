document.addEventListener("DOMContentLoaded", function () {
    fetch("/data")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#data-table tbody");
            tableBody.innerHTML = ""; // Clear table before repopulating

            data.forEach(item => {
                const ip = Object.keys(item)[0];
                const details = item[ip] || {};

                // Ensure ports are properly formatted
                const portsOpen = Array.isArray(details.port_open) ? details.port_open.join(", ") : "N/A";
                const portsClosed = Array.isArray(details.port_closed) ? details.port_closed.join(", ") : "N/A";
                const portsFiltered = Array.isArray(details.port_filtered) ? details.port_filtered.join(", ") : "N/A";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${details.date || "N/A"}</td>
                    <td data-ip="${ip}">${ip || "N/A"}</td>
                    <td>${details.host_name || "N/A"}</td>
                    <td>${details.mac_address || "N/A"}</td>
                    <td>${details.mac_vendor || "N/A"}</td>
                    <td>${details.os_accuracy || "N/A"}</td>
                    <td>${details.os_cpe || "N/A"}</td>
                    <td>${details.os_name || "N/A"}</td>
                    <td>${portsClosed}</td>
                    <td>${portsFiltered}</td>
                    <td>${portsOpen}</td>
                `;

                tableBody.appendChild(row);
            });

            initializeDataTables(); // Ensure DataTable is initialized
        })
        .catch(error => console.error("Error fetching data:", error));
});
