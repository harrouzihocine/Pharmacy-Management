
function makeSubmenu(value, id) {
    let elementId;
  
    if (id.length == 0) elementId = "#city";
    else elementId = "#city" + id;
  
    let communes = states
      .filter((state) => state.name === value)
      .map((state) => state.communes);
    // if (value == "") {
  
    $(elementId)
      .empty()
      .append("<option class='option' selected disabled value=''>Ville</option>");
    // } else {
    for (const ville of communes[0]) {
      $(elementId).append(new Option(ville, ville));
    }
    // }
  }
  /*--------------------- remove fournisseur-------------------------- */
        // Define the function for handling the delete action
        function removeFournisseur(button) {
            const url = button.getAttribute('data-url');
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
                    fetch(url, {
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire('Deleted!', 'The item has been deleted.', 'success');
                            const row = button.closest('tr');
                            if (row) {
                                row.remove();
                            }
                        } else {
                            Swal.fire('Error!', 'There was an issue deleting the item.', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error during delete request:', error);
                        Swal.fire('Error!', 'There was an issue with the request.', 'error');
                    });
                }
            });
          }
          
          document.querySelectorAll('.delete-fournisseur-btn').forEach(button => {
            button.addEventListener('click', function() {
                removeFournisseur(this);
            });
          });