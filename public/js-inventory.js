/*----------------------export to excel ------------------------------ */
function exportToExcel(inventoryId) {
  // Get the selected template element
  const templateSelector = document.getElementById("template-selector");

  if (!templateSelector) {
    alert(
      "Template selector not found. Please ensure it is included in the page."
    );
    return;
  }

  // Get the selected template value
  const selectedTemplate = templateSelector.value;

  if (!selectedTemplate) {
    alert("Please select a template before exporting.");
    return;
  }

  // Construct the export URL
  const exportUrl = `/inventory/export/${inventoryId}?template=${encodeURIComponent(
    selectedTemplate
  )}`;

  // Redirect to the backend endpoint for export
  window.location.href = exportUrl;
}

/*------------------------------ show feilds server and storage ------------------------------ */
function showFields() {
  const workflowType = document.querySelector(
    'input[name="workflowType"]:checked'
  ).value;

  // Input field containers
  const serviceSelect = document.getElementById("serviceSelect");
  const storageSelect = document.getElementById("storageSelect");

  // Hide all initially
  serviceSelect.style.display = "none";
  storageSelect.style.display = "none";

  // Show fields based on choice
  if (workflowType === "specificService") {
    serviceSelect.style.display = "block";
  } else if (workflowType === "serviceStorage") {
    serviceSelect.style.display = "block";
    storageSelect.style.display = "block";
  }
}
function filterStorages(selectedService) {
  const storageOptions = document.querySelectorAll("#storage option");
  storageOptions.forEach((option) => {
    if (
      !option.dataset.service ||
      option.dataset.service === selectedService ||
      option.value === ""
    ) {
      option.style.display = "block";
    } else {
      option.style.display = "none";
    }
  });
  document.getElementById("storage").value = ""; // Reset storage select
}
function filterStoragesEdit(selectedService) {
  const storageOptions = document.querySelectorAll("#storage-edit option");
  storageOptions.forEach((option) => {
    if (
      !option.dataset.service ||
      option.dataset.service === selectedService ||
      option.value === ""
    ) {
      option.style.display = "block";
    } else {
      option.style.display = "none";
    }
  });
}
/*------------------------------------select new medicament with choices.js-----------------------------------------*/
document.addEventListener("DOMContentLoaded", function () {
  const medicamentSelect = document.getElementById("medicament-new-select");

  // Convert the select options into an array of objects with explicit `label` and `value`
  const options = Array.from(medicamentSelect.options).map((option) => {
    return {
      value: option.value,
      label: option.text,
    };
  });

  // Clear the existing options
  medicamentSelect.innerHTML = "";

  // Initialize Choices.js with the custom options
  const choices = new Choices(medicamentSelect, {
    choices: options,
    searchEnabled: true,
    searchFields: ["label"],
    searchFilter: function (option, searchText) {
      const optionText = option.label.toLowerCase();
      const searchTextLower = searchText.toLowerCase();
      return optionText.includes(searchTextLower);
    },
    shouldSort: false,
    itemSelectText: "",
    placeholderValue: "Select an Item",
    noResultsText: "No results found",
    noChoicesText: "No items to choose from",
    renderChoiceLimit: -1, // Show all matching options
  });

  // Force re-render the dropdown
  choices.setChoices(options, "value", "label", true);
});
/*------------------------------------select edit medicament with choices.js-----------------------------------------*/
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Choices.js on the select element
  const medicamentSelect = document.getElementById("medicament-edit-select");

  // Initialize Choices.js with custom configurations
  const choices = new Choices(medicamentSelect, {
    searchEnabled: true,
    itemSelectText: "",
    noResultsText: "No items found",
    placeholder: true,
    placeholderValue: "Select an Item",
    searchFloor: 1,
    searchResultLimit: 0,
    shouldSort: false,
    position: "bottom",
    fuseOptions: {
      includeScore: true,
      threshold: 0.3,
      distance: 100,
      ignoreLocation: true,
      keys: ["label"],
    },
  });

  // Case-insensitive search functionality (Choices.js handles this internally)
  medicamentSelect.addEventListener("search", function (event) {
    const searchTerm = event.target.value.toLowerCase();
    const options = medicamentSelect.querySelectorAll("option");

    options.forEach((option) => {
      const optionText = option.textContent.toLowerCase();
      if (optionText.includes(searchTerm)) {
        option.style.display = "block"; // Show the matching options
      } else {
        option.style.display = "none"; // Hide the non-matching options
      }
    });
  });
});
/*----------------------------------------------------delete item--------------------------------*/
// Define the function for handling the delete action
function handleDelete(button) {
  const url = button.getAttribute("data-url"); // Get the URL from the button's data attribute
 
  Swal.fire({
    title: "Are you sure?",
    text: "You won’t be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Send the DELETE request using fetch
      fetch(url, {
        method: "POST", // Use POST with the _method=DELETE query param
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then((response) => response.json()) // Assuming the response is JSON
        .then((data) => {
          if (data.success) {
            // Optionally show a success message
            Swal.fire("Deleted!", "The item has been deleted.", "success");

            // Remove the row from the table
            const row = button.closest("tr"); // Get the row of the clicked button
            if (row) {
              row.remove(); // Remove the row from the DOM
            }
          } else {
            Swal.fire(
              "Error!",
              "There was an issue deleting the item.",
              "error"
            );
          }
        })
        .catch((error) => {
          Swal.fire("Error!", "There was an issue with the request.", "error");
        });
    }
  });
}

// Attach event listeners to all delete buttons
document.querySelectorAll(".delete-item-btn").forEach((button) => {
  button.addEventListener("click", function () {
    handleDelete(this); // Pass the clicked button to the function
  });
});
/*-----------------------toggleVisibility--------------------*/
function toggleVisibility(button) {
  const url = button.getAttribute("data-url");
  const visibility = button.getAttribute("data-visibility");
  const user = button.getAttribute("data-user");
  console.log("! oppo visibility: " + !visibility);
  let newVisibility;
  if (visibility === "true") {
    newVisibility = "false";
  } else {
    newVisibility = "true";
  }
  // Show SweetAlert2 confirmation dialog
  Swal.fire({
    title: "Are you sure?",
    html: `Do you want to ${
      visibility === "false" ? "unhide" : "hide"
    } this item? 
  ${
    visibility === "true"
      ? `<br><span style="color: red;">Note: If you refresh the page, you will need to go to ${user}'s inventory and unhide this item.</span>`
      : ""
  }`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, proceed!",
    cancelButtonText: "No, keep it visible",
  }).then((result) => {
    if (result.isConfirmed) {
      // Proceed with the visibility toggle request
      fetch(url, {
        method: "PATCH", // Use PATCH for partial updates
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visibility: newVisibility }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            // Update the button text dynamically based on the new visibility
            if (visibility === "false") {
              console.log("Update 1 to true");
              button.setAttribute("data-visibility", "true");
              button.innerHTML = '<i class="fa-regular fa-eye-slash"></i>'; // Icon for "Unhide"
            } else {
              console.log("Update 2 to false");
              button.setAttribute("data-visibility", "false");
              button.innerHTML = '<i class="fa-regular fa-eye"></i>'; // Icon for "Hide"
            }

            // Show success message
            Swal.fire({
              title: "Success!",
              text: "Visibility has been toggled.",
              icon: "success",
            });
          } else {
            // Show error message
            Swal.fire({
              title: "Error!",
              text: result.message,
              icon: "error",
            });
          }
        })
        .catch((error) => {
          console.error(error);
          // Show error message
          Swal.fire({
            title: "Error!",
            text: "An error occurred. Please try again.",
            icon: "error",
          });
        });
    }
  });
}
/*-----------------------purshase price in new-item--------------------*/
function getMinPurchasePrice(inventoryId, medicamentId) {
 
  $.ajax({
    url: "/inventory/new-item/getMinPurchasePrice",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      inventoryId: inventoryId,
      medicamentId: medicamentId,
    }),

    success: function (response) {
      const pricecheckbox = $("#byBox").prop("checked");

      if (response.minPurchasePrice !== null) {
        // Set the value of the purchasePrice input field
       
            if (pricecheckbox == true) {
              $("#purchasePrice").val(response.minPurchasePrice * response.boite_de);
             
            }else{
              $("#purchasePrice").val(response.minPurchasePrice);
            }
      
           } else  {
        // If no price is found, clear the input field
        $("#purchasePrice").val("");
      }
      if (response.boite_de != null) {
        $("#boite_de").html(response.boite_de);
        $("#boite_de_input").val(response.boite_de);
      } else {
        $("#boite_de_input").val("");
        $("#boite_de").html("");
      }
    },
    error: function (err) {
      console.error("Error:", err);
    },
  });
}

/*-----------------------new blanc page edit--------------------*/

function handleEditClick(event, button) {
  // Get the URL from the button's data-url attribute
  const url = button.getAttribute("data-url");

  // Check if Ctrl key is pressed
  if (event.ctrlKey) {
    // Open the URL in a new tab/window
    window.open(url, "_blank");
  } else {
    // Navigate to the URL in the same window
    window.location.href = url;
  }
}
