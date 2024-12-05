document.addEventListener("DOMContentLoaded", () => {
  fetchReport();

  function fetchReport() {
    fetch('/report')
      .then(response => response.json())
      .then(data => {
        const tableBody = document.querySelector("#report-table tbody");
        tableBody.innerHTML = ""; 
        if (data.length === 0) {
          tableBody.innerHTML = "<tr><td colspan='10'>No data available</td></tr>";
        }
        data.forEach(entry => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${entry.id}</td>
            <td>${entry.name}</td>
            <td>${entry.mobile_no}</td>
            <td>${entry.email_id}</td>
            <td>${entry.address}</td>
            <td>${entry.pan_no}</td>
            <td>${entry.aadhar_no}</td>
            <td><img src="${entry.photo_path}" width="50" height="50"></td>
            <td><a href="${entry.certificate_path}" download>Download</a></td>
            <td>${entry.uploaded_datetime}</td>
            <td><button onclick="updateStatus(${entry.id}, 'inactive')">Deactivate</button></td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch(error => console.error("Error fetching report data:", error));
  }

  window.searchReport = function() {
    const query = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#report-table tbody tr");
    rows.forEach(row => {
      const name = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
      row.style.display = name.includes(query) ? "" : "none";
    });
  };
});
