// Object to store medicament transfer quantities
const medicamentTransfers = {};

// Save input changes immediately with available quantity control
document.addEventListener("input", (event) => {
  if (event.target.classList.contains("modal-batch-quantity-input")) {
    const input = event.target;
    const row = input.closest("tr");
    const modal = input.closest(".modal");
    const medicamentId = modal.id; // Extract medicament ID from modal ID

    // Ensure medicamentTransfers object has entry for the medicamentId
    if (!medicamentTransfers[medicamentId]) {
      medicamentTransfers[medicamentId] = {};
    }

    // Get batch number, expiry date, and serial number (if exists)
    const batchId = row.querySelector(".batchNumber").textContent.trim();
    const expiryDate = row.querySelector(".expiryDate")
      ? row.querySelector(".expiryDate").textContent.trim()
      : "";
    const serialNumber = row.querySelector(".serialNumber")
      ? row.querySelector(".serialNumber").textContent.trim()
      : "";

    // Combine batchId, expiryDate, and serialNumber to form a unique key
    const uniqueKey = `${batchId}_${expiryDate}_${serialNumber}`;

    const availableQuantity =
      parseInt(row.querySelector(".available-quantity").textContent) || 0; // Get available quantity
    let quantity = parseInt(input.value) || 0; // Ensure numeric value

    // Validate the input quantity does not exceed the available quantity
    if (quantity > availableQuantity) {
      alert(
        `The quantity to transfer cannot exceed the available quantity (${availableQuantity}).`
      );
      input.value = availableQuantity; // Reset to the maximum available
      quantity = availableQuantity; // Ensure the quantity is not higher than available
    }

    // Save the valid quantity for the specific batch, expiry date, and serial number
    medicamentTransfers[medicamentId][uniqueKey] = quantity;
  }
});

// Restore input values when modal opens
document.addEventListener("show.bs.modal", (event) => {
  const modal = event.target;
  const medicamentId = modal.id; // Extract medicament ID from modal ID

  if (medicamentTransfers[medicamentId]) {
    const rows = modal.querySelectorAll(
      ".modal-batch-selection-table tbody tr"
    );

    rows.forEach((row) => {
      const batchId = row.querySelector("td:nth-child(2)").textContent.trim(); // Batch number as unique key
      const input = row.querySelector(".modal-batch-quantity-input");

      if (medicamentTransfers[medicamentId][batchId] !== undefined) {
        input.value = medicamentTransfers[medicamentId][batchId]; // Restore value
      }
    });
  }
});

// Update demand table with total quantities
function updateDemandTable() {
  Object.keys(medicamentTransfers).forEach((medicamentId) => {
    const totalQuantity = Object.values(
      medicamentTransfers[medicamentId]
    ).reduce((sum, quantity) => sum + quantity, 0);

    const row = document.querySelector(
      `tr[data-medicament-id="${medicamentId}"]`
    );
    if (row) {
      const transferCell = row.querySelector(".quantity-to-transfer-cell");
      if (transferCell) {
        transferCell.textContent = totalQuantity; // Update transfer quantity
      }
    }
  });
}

// Event listener for saving and updating table on modal close
document.addEventListener("hide.bs.modal", (event) => {
  updateDemandTable(); // Update the demand table when the modal is closed
});

/*------------------------------------------------selected medicaments------------------------------------------------*/
document.querySelectorAll(".selectmedicament").forEach((button) => {
  button.addEventListener("click", () => {
    const medicamentId = button.getAttribute("data-medicament-id");
    const isSelected = button.getAttribute("data-selected") === "true";
    console.log(medicamentId, isSelected);
    // Determine action based on the current state
    const action = isSelected ? "unselect" : "select";

    // Send AJAX request to the backend
    fetch(`/pharmacy/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicamentId: medicamentId }),
    })
      .then((response) => {
        if (response.ok) {
          // Toggle button state and text
          button.setAttribute("data-selected", !isSelected);
          button.textContent = isSelected ? "Select" : "Unselect";
        } else {
          alert("Failed to update selection.");
        }
      })
      .catch((err) => console.error("Error:", err));
  });
});

/*------------------------------------get storages----------------------------------------------------*/
document.querySelectorAll('[id^="service-"]').forEach((serviceDropdown) => {
  serviceDropdown.addEventListener("change", async function () {
    const serviceId = this.value;
    const medicamentId = this.id.split("-")[1]; // Extract medicament ID
    const storageDropdown = document.getElementById(`storage-${medicamentId}`);

    if (!serviceId) {
      storageDropdown.innerHTML = '<option value="">Choose Storage...</option>';
      storageDropdown.disabled = true;
      return;
    }

    try {
      // Fetch storages for the selected service
      const response = await fetch(`/inStock/${serviceId}/storages`);
      if (!response.ok) throw new Error("Failed to fetch storages");

      const storages = await response.json();
      console.log(response);
      // Populate the storage dropdown
      storageDropdown.innerHTML = '<option value="">Choose Storage...</option>';
      storages.forEach((storage) => {
        storageDropdown.innerHTML += `<option value="${storage._id}">${storage.storageName}</option>`;
      });

      storageDropdown.disabled = false;
    } catch (error) {
      console.error("Error fetching storages:", error);
      storageDropdown.innerHTML =
        '<option value="">Error fetching storages</option>';
      storageDropdown.disabled = true;
    }
  });
});
/*----------------------------------------- print ticket code bar --------------------------------*/
function printTicket(stock) {
  // Function to format date as dd/mm/yyyy
  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
const SN = (stock.serialNumber)?`<div><span>S/N:</span><span>${stock.serialNumber}</span></div>`:``
  // Open a new window for printing
  const printWindow = window.open("", "_blank");

  // Write HTML content for the print layout
  printWindow.document.write(`
  <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pharmacy Label</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap');

    /* Reset default margins and padding */
    body,
    html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f0f0f0;
      /* Light background for better visibility */
    }

    .label {
      width: 40mm;
      /* Label width */
      height: 20mm;
      /* Label height */
      padding: 2mm;
      /* Minimal padding */
      font-family: Arial, sans-serif;
      font-size: 8px;
      /* Base font size */
      border: 1px solid #ccc;
      /* Border to visualize limits */
      box-sizing: border-box;
      /* Include padding and border in dimensions */
      display: flex;
      align-items: center;
      /* Center vertically */
      background-color: white;
      /* White background for the label */
    }

    .part2 {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    .pharmacy-name {
      font-size: 8px;
      /* Reduced font size */
      font-weight: bold;
      text-align: center;
      margin-bottom: 2mm;
    }

    .qrcode img {
      width: 20mm;
      /* Fixed size for QR code */
      height: 20mm;
    }

    .medication-name {
      font-size: 8px;
      /* Reduced font size */
      text-align: center;
      margin-top: 2mm;
    }

    .price {
      font-size: 15px;
      /* Larger font for price */
      font-weight: bold;
      text-align: center;
    }
  </style>
  <!-- Include qrcode.js library -->
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
</head>

<body>
  <div class="label">
    <!-- Part 2: Horizontal text and QR code -->
    <div class="part2">
      <div class="pharmacy-name">Clinique des Oasis</div>
      <div class="qrcode" id="qrcode">${stock.qrcode}</div>
      <div class="medication-name">${stock.designation}</div>
    </div>
  </div>

  
</body>

</html>
  `);

  // Finalize and trigger the print
  // printWindow.document.close();
  // printWindow.focus();
  // printWindow.print();
  // printWindow.close();
}

/*--------------------------------------this is for nav bar-----------------------------------------*/
const toggleButton = document.getElementById("sidebar-toggle");
const sidebar = document.getElementById("sidebar");
const body = document.body;
const arrowIcon = document.getElementById("sidebar-toggle-icon");

// Check if sidebar state is saved in localStorage and apply it
const savedSidebarState = localStorage.getItem("sidebarState");
if (savedSidebarState === "open") {
  // Apply the 'active' class to the sidebar to open it without animation
  sidebar.classList.add("active"); // Sidebar is open
  body.classList.add("shifted"); // Main content is shifted
  arrowIcon.classList.remove("fa-chevron-right");
  arrowIcon.classList.add("fa-chevron-left");

  // Disable the transition temporarily for the sidebar when it is open
  sidebar.style.transition = "none"; // Disable animation
  body.style.transition = "none"; // Disable body margin transition

  // Allow the sidebar to remain open without animation
  setTimeout(() => {
    // Re-enable the transition after a brief moment (let it settle)
    sidebar.style.transition = "";
    body.style.transition = "";
  }, 50); // Time delay to ensure no animation at the first load
}

// Event listener for sidebar toggle button
toggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("active"); // Toggle sidebar visibility
  body.classList.toggle("shifted"); // Shift content to the right when the sidebar is open

  // Toggle the arrow direction
  if (sidebar.classList.contains("active")) {
    arrowIcon.classList.remove("fa-chevron-right");
    arrowIcon.classList.add("fa-chevron-left");
    // Save the state as open in localStorage
    localStorage.setItem("sidebarState", "open");
  } else {
    arrowIcon.classList.remove("fa-chevron-left");
    arrowIcon.classList.add("fa-chevron-right");
    // Save the state as closed in localStorage
    localStorage.setItem("sidebarState", "closed");
  }
});

// Function to highlight the active link in the sidebar
// Function to highlight the active link in the sidebar
function setActiveLink() {
  const currentPage = window.location.pathname; // Get the current page URL path

  // Define a mapping of paths to their corresponding link classes
  const pathToLinkClass = {
    "/storage": ".storage-link",
    "/medicament/": ".medicament-link",
    "/pharmacy/": ".pharmacy-link",
    "/achat/demands": ".purchase-demands-link",
    "/inventory": ".inventory-link",
    "/achat": ".purchase-link",
    "/fournisseur": ".fournisseur-link",
    "/profile": ".profile-link",
    "/logout": ".logout-link",
  };

  // Remove 'active' class from all links first
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Add 'active' class to the matched link
  const linkSelector = pathToLinkClass[currentPage];
  if (linkSelector) {
    document.querySelector(linkSelector)?.classList.add("active");
  }
}


// Call the function on page load to set the active link
window.addEventListener("load", setActiveLink);

// Also update active link on route change (in case you're using something like single-page apps or client-side routing)
window.addEventListener("popstate", setActiveLink);
/*--------------------------------------Send service name-----------------------------------------*/
document.addEventListener("DOMContentLoaded", function () {
  const serviceSelect = document.getElementById("serviceSelect");
  const serviceNameInput = document.getElementById("serviceName");

  serviceSelect.addEventListener("change", function () {
    // Get selected option
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    const serviceName = selectedOption.getAttribute("data-service-name");

    // Set the hidden input field value
    serviceNameInput.value = serviceName;

    // Log the selected service name for debugging
    console.log("Selected Service:", serviceName);
  });
});
/*--------------------------------------closed ticket script-----------------------------------------*/

const outilRangement = document.getElementById("outilRangement");
const rayonnageDetails = document.getElementById("rayonnageDetails");

outilRangement.addEventListener("change", function () {
  if (outilRangement.value === "RY") {
    rayonnageDetails.style.display = "block";
  } else {
    rayonnageDetails.style.display = "none";
  }
});

/*--------------------------------------unassign sweetalert-----------------------------------------*/
function confirmUnassign(storageId, locationId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, unassign it!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Redirect to the unassign route
      window.location.href = `/storage/${storageId}/unassign/${locationId}`;
    }
  });
}
/*--------------------------------------assign add another location-----------------------------------------*/
document
  .getElementById("createLocationBtn")
  .addEventListener("click", function (event) {
    // Prevent the form from submitting immediately
    event.preventDefault();

    // SweetAlert2 confirmation dialog
    Swal.fire({
      title: "Do you want to add another location?",
      text: "If yes, the form will be ready to add another location.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, add another",
      cancelButtonText: "No, go to locations",
    }).then((result) => {
      if (result.isConfirmed) {
        // If user clicks "Yes, add another", submit the form
        document.querySelector("form").submit(); // Adjust the selector to match your form
      } else {
        // If user clicks "No, go back", redirect to the storage page
        const storageServiceAbv =
          document.getElementById("storageServiceAbv").value; // Replace with actual serviceABV
        const storageId = document.getElementById("storageId").value; // Replace with actual storageId
        window.location.href = `/storage/${storageServiceAbv}/${storageId}`;
      }
    });
  });
/*------------------------------------- demand interne creation --------------------------------      */
document
  .getElementById("demandsTable")
  .addEventListener("click", function (event) {
    // Check if the clicked element is a "View Medicaments" button
    if (event.target.classList.contains("view-medicaments")) {
      const demandRow = event.target.closest("tr"); // Get the clicked demand row
      const demandId = demandRow.getAttribute("data-demand-id"); // Get the demand ID

      // Find the medicaments row with the same demand ID
      const medicamentsRow = document.querySelector(
        `.medicaments-row[data-demand-id="${demandId}"]`
      );

      // Toggle visibility
      if (medicamentsRow.style.display === "none") {
        medicamentsRow.style.display = "table-row"; // Show medicaments
        event.target.textContent = "Hide Medicaments"; // Update button text
      } else {
        medicamentsRow.style.display = "none"; // Hide medicaments
        event.target.textContent = "View Medicaments"; // Update button text
      }
    }
  });
