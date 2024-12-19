function initiateTransfer(demandId) {
      // Collect the demand details from the page
      const sourceElement = document.querySelector('.source-info');
      const destinationElement = document.querySelector('.destination-info');
  
      // Check if source and destination elements exist
      if (!sourceElement || !destinationElement) {
          console.error('Source or destination information is missing.');
          return;
      }
  
      const source = sourceElement.textContent.trim();
      const destination = destinationElement.textContent.trim();
     
    
      // Prepare an array to hold the medicament transfer details
      const transferDetails = [];
  
      const medicamentRows = document.querySelectorAll(".medicaments-table tbody tr");
  
      medicamentRows.forEach(row => {
          const medicamentId = row.getAttribute('data-medicament-id');
          if (medicamentId) {
              const modal = document.getElementById(medicamentId);
  
              if (modal) {
                  const batchRows = modal.querySelectorAll('.modal-batch-selection-table tbody tr');
  
                  batchRows.forEach(batchRow => {
                      const rowstocktId = batchRow.getAttribute('data-stock-id');
                      const batchInput = batchRow.querySelector('.modal-batch-quantity-input');
                      const quantityToTransfer = batchInput ? parseInt(batchInput.value, 10) || 0 : 0;
  
                      if (quantityToTransfer > 0) {
                          const batchNumber = batchRow.querySelector('.batchNumber').textContent.trim();
                          const expiryDate = batchRow.querySelector('.expiryDate').textContent.trim();
  
                          const existingBatch = transferDetails.find(detail =>
                              detail.batchNumber === batchNumber && detail.expiryDate === expiryDate);
  
                          if (!existingBatch) {
                              transferDetails.push({
                                 stockId: rowstocktId,
                                  quantityToTransfer: quantityToTransfer,
                                  
                              });
                          }
                      }
                  });
              }
          }
      });
  
      if(transferDetails.length==0){
            alert('No medicaments to transfer found.');
            return;
      }else{
      // Sending the data to the backend
      fetch('/demand/initiateTransfer', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              demandId: demandId,
              transferDetails: transferDetails
          })
      })
      .then(response => response.json())
      .then(data => {
          console.log('Transfer initiated successfully:', data);
          window.location.reload();
      })
      .catch(error => {
          console.error('Error initiating transfer:', error);
      });
  }
}
function openRejectModal(demandId) {
       
      Swal.fire({
        title: 'Reject Demand for ',
        input: 'textarea',
        inputLabel: 'Reason for Rejection',
        inputPlaceholder: 'Enter your reason here...',
        inputAttributes: {
          'aria-label': 'Enter your reason for rejection'
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        background: '#1e313ef5', // Set modal background to dark mode
        color: '#ffffff', // Text color for dark mode
        inputStyle: {
          background: '#3a3b3cf5', // Input background for dark mode
          color: '#ffffff', // Input text color
          border: '1px solid #555' // Input border for better visibility
        },
        customClass: {
          popup: 'dark-mode-popup',
          input: 'dark-mode-input',
          confirmButton: 'dark-mode-confirm-btn',
          cancelButton: 'dark-mode-cancel-btn',
        },
        inputValidator: (value) => {
          if (!value.trim()) {
            return 'You need to write a reason!';
          }
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const rejectioncomment = result.value;
          submitRejection(demandId, rejectioncomment);
        }
      });
    }
  
    async function submitRejection(demandId, rejectioncomment) {
      
      try {
        const response = await fetch(`/demand/demand-details/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rejectioncomment, demandId}),
        });
  
        if (response.ok) {
          Swal.fire('Success', 'Demand rejected successfully!', 'success').then(() => {
            location.reload(); // Optionally reload or update the UI
          });
        } else {
          Swal.fire('Error', 'Failed to reject demand. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'An error occurred. Please try again.', 'error');
      }
    }