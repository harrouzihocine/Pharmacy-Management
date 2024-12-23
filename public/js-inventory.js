
    function showFields() {
      const workflowType = document.querySelector('input[name="workflowType"]:checked').value;

      // Input field containers
      const serviceSelect = document.getElementById('serviceSelect');
      const storageSelect = document.getElementById('storageSelect');

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
      const storageOptions = document.querySelectorAll('#storage option');
      storageOptions.forEach(option => {
        if (!option.dataset.service || option.dataset.service === selectedService || option.value === "") {
          option.style.display = "block";
        } else {
          option.style.display = "none";
        }
      });
      document.getElementById('storage').value = ""; // Reset storage select
    }
    document.addEventListener('DOMContentLoaded', function () {
        // Initialize Choices.js on the select element
        const medicamentSelect = document.getElementById('medicament');
        const choices = new Choices(medicamentSelect, {
          searchEnabled: true,  // Enable search functionality
          itemSelectText: '',   // Prevent displaying 'Press to select' text
          noResultsText: 'No items found', // Custom message when no match is found
          placeholder: true,    // Enable placeholder
          placeholderValue: 'Select an Item', // Custom placeholder text
        });
      });
/*----------------------------------------------------delete item--------------------------------*/
      // Define the function for handling the delete action
function handleDelete(button) {
  const url = button.getAttribute('data-url');  // Get the URL from the button's data attribute
  console.log(url);
  Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
      if (result.isConfirmed) {
          // Send the DELETE request using fetch
          fetch(url, {
              method: 'POST',  // Use POST with the _method=DELETE query param
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
          })
          .then(response => response.json()) // Assuming the response is JSON
          .then(data => {
              if (data.success) {
                  // Optionally show a success message
                  Swal.fire('Deleted!', 'The item has been deleted.', 'success');

                  // Remove the row from the table
                  const row = button.closest('tr');  // Get the row of the clicked button
                  if (row) {
                      row.remove();  // Remove the row from the DOM
                  }
              } else {
                  Swal.fire('Error!', 'There was an issue deleting the item.', 'error');
              }
          })
          .catch(error => {
              Swal.fire('Error!', 'There was an issue with the request.', 'error');
          });
      }
  });
}

// Attach event listeners to all delete buttons
document.querySelectorAll('.delete-item-btn').forEach(button => {
  button.addEventListener('click', function() {
      handleDelete(this);  // Pass the clicked button to the function
  });
});
