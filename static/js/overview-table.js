document.addEventListener("DOMContentLoaded", function () {
    fetch("/data")
        .then((response) => response.json())
        .then((data) => {
            const tableBody = document.querySelector("#data-table tbody");

            tableBody.innerHTML = "";

            data.forEach((item) => {
                const ip = Object.keys(item)[0];
                const details = item[ip];

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${details.date || "N/A"}</td>
                    <td>${ip || "N/A"}</td>
                    <td>${details.host_name || "N/A"}</td>
                    <td>${details.mac_address || "N/A"}</td>
                    <td>${details.mac_vendor || "N/A"}</td>
                    <td>${details.os_accuracy || "N/A"}</td>
                    <td>${details.os_cpe || "N/A"}</td>
                    <td>${details.os_name || "N/A"}</td>
                    <td>${details.port_closed || "N/A"}</td>
                    <td>${details.port_filtered || "N/A"}</td>
                    <td>${details.port_open || "N/A"}</td>

                `;

                tableBody.appendChild(row);
            });
        })
    
});