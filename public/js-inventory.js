
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