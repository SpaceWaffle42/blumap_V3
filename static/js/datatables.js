function initializeDataTables() {
  if (!$.fn.DataTable.isDataTable("#data-table")) {
      $("#data-table").DataTable({
          responsive: true,
          scrollX: false,
          scrollY: "30rem",
          columnDefs: [
              { type: "ip-address", targets: 1 }, // Apply IP sorting to column 1 (IP address)
          ],
      });
  }
}

// Custom sorting function for IP addresses
jQuery.fn.dataTableExt.oSort["ip-address-asc"] = function (a, b) {
  return ipToNumber(a) - ipToNumber(b);
};
jQuery.fn.dataTableExt.oSort["ip-address-desc"] = function (a, b) {
  return ipToNumber(b) - ipToNumber(a);
};

// Convert IP addresses to numbers for correct sorting
function ipToNumber(ip) {
  if (!ip) return 0;
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}

// Detect table changes and reinitialize DataTables dynamically
function observeTableUpdates() {
  const config = { childList: true, subtree: true };
  const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
          if (mutation.addedNodes.length > 0) {
              initializeDataTables();
              observer.disconnect(); // Stop observing once initialized
          }
      }
  });
  observer.observe(document.getElementById("data-table"), config);
}

// Ensure initialization and observer setup
$(document).ready(function () {
  setTimeout(initializeDataTables, 1000);
  observeTableUpdates();
});
