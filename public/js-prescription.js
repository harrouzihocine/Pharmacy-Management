/*---------------------------------find medicament in distock table-------------------------------*/
function getVisibleRows() {
    return Array.from(document.querySelectorAll('#tablebodyMED tr')).filter(
      (row) => row.style.display !== 'none'
    );
  }
  
  // Function to focus on the input field and increment its value
  function focusAndIncrementInput(input,quantity) {
    input.focus(); // Move cursor to the input field
    const currentValue = input.value || 0; // Get current value, default to 0 if empty
    input.value = parseFloat(currentValue)  + parseFloat(quantity) ; // Increment by 1
  }
  
  // Function to set up the Enter key handler for the input field
  function setupInputEnterHandler(input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission
        clearSearchBar(); // Clear the search bar and focus on it
      }
    });
  }
  
  // Function to clear the search bar and focus on it
  function clearSearchBar() {
    const searchBar = document.getElementById('searchMED');
    searchBar.value = ''; // Clear the search input
    searchBar.focus(); // Move cursor back to the search bar
  }
  
  // Attach event listeners to the search bar
  const searchBar = document.getElementById('searchMED');
  searchBar.addEventListener('keydown', handleSearchAction); // Handle Enter key press
  searchBar.addEventListener('click', handleSearchAction); // Handle click
  
  // Prevent form submission when pressing Enter in the search bar
  const searchForm = document.querySelector('.search-bar');
  searchForm.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
    }
  });
  /*---------------------------------save distocked medicament -------------------------------*/
  // Function to handle the Save button click
function saveBatchSelection(medicamentId,serviceABV) {
    const modal = document.getElementById(medicamentId); // Get the modal by its unique ID
    const visibleRows = modal.querySelectorAll('.distock-table-row'); // Get all rows in the modal
    const dataToSend = [];
  
    // Loop through visible rows and collect input values
    visibleRows.forEach((row) => {
      const barcode = row.querySelector('.barcode').textContent.trim(); // Get barcode
      const quantityInput = row.querySelector('.modal-batch-quantity-input'); // Get input field
      const quantity = parseFloat(quantityInput.value) || 0; // Get quantity value
  
      if (quantity > 0) {
        // Add data to the array if quantity is greater than 0
        dataToSend.push({
          barcode: barcode,
          quantity: quantity,
        });
      }
    });
  
    // Check if there is data to send
    if (dataToSend.length > 0) {
      // Include the medicamentId in the data
      const payload = {
        medicamentId: medicamentId,
        barcodes: dataToSend,
      };
  
      // Send data to the backend using AJAX
      sendDataToBackend(payload,serviceABV);
    } else {
      alert('No valid quantities to save.'); // Show alert if no valid quantities
    }
  }
  
  function sendDataToBackend(data, serviceABV) {
    const url = `/prescription/medicaments/${data.medicamentId}?serviceABV=${serviceABV}`;
  
    fetch(url, {
      method: 'POST', // Use POST method
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
      },
      body: JSON.stringify(data), // Convert data to JSON
    })
      .then((response) => response.json()) // Parse the JSON response
      .then((result) => {
        if (result.success) {
          // Close the modal
          const modal = bootstrap.Modal.getInstance(document.getElementById(data.medicamentId));
          if (modal) {
            modal.hide(); // Hide the modal
          }
  
          // Show success toast
          showToast('Data saved successfully!', 'success');
  
          // Optionally, refresh the page or update the UI
          window.location.reload(); // Reload the page to reflect changes
        } else {
          // Show error toast
          showToast('Failed to save data: ' + result.message, 'error');
        }
      })
      .catch((error) => {
        console.error('Error:', error); // Log any errors
        showToast('An error occurred while saving data.', 'error'); // Show error toast
      });
  }
  
  // Function to show toast notifications
  function showToast(message, type) {
    const toastContainer = document.querySelector('.toast-container');
  
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
  
    // Toast content
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
  
    // Append toast to container
    toastContainer.appendChild(toastEl);
  
    // Initialize and show toast
    const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 5000 });
    toast.show();
  
    // Remove toast after it hides
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  }
  /*---------------------------------assign medicament to patient -------------------------------*/
  document.addEventListener('DOMContentLoaded', function () {
    const signButtons = document.querySelectorAll('.signBtn');

    signButtons.forEach(button => {
      button.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default button behavior

        const medicamentName = button.getAttribute('data-medicament');
        const patientName = button.getAttribute('data-patient');
        const defaultQuantity = button.getAttribute('data-quantity');

        Swal.fire({
          title: 'Are you sure?',
          html: `Are you sure to sign <b>${medicamentName}</b> to <b>${patientName}</b>?<br><br>
                 Insert the quantity:`,
          input: 'number',
          inputValue: defaultQuantity,
          inputPlaceholder: defaultQuantity,
          showCancelButton: true,
          confirmButtonText: 'Sign',
          cancelButtonText: 'Cancel',
          preConfirm: (quantity) => {
            if (!quantity || quantity <= 0) {
              Swal.showValidationMessage('Please enter a valid quantity');
            }
            return quantity;
          }
        }).then((result) => {
          if (result.isConfirmed) {
            const quantity = result.value;
            // Perform your action here, e.g., send data to the server
            console.log(`Signed ${quantity} units of ${medicamentName} to ${patientName}`);
            Swal.fire('Signed!', `You have signed ${quantity} units of ${medicamentName} to ${patientName}.`, 'success');
          }
        });
      });
    });
  });