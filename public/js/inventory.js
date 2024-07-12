'use strict';

// Obtener el elemento de la lista desplegable de clasificaciones
let classificationList = document.querySelector("#classificationList");

// Agregar un evento para escuchar cambios en la lista desplegable
classificationList.addEventListener("change", function () {
  // Obtener el valor seleccionado (classification_id)
  let classification_id = classificationList.value;
  console.log(`classification_id is: ${classification_id}`);

  // Construir la URL para la solicitud fetch
  let classIdURL = "/inv/getInventory/" + classification_id;

  // Realizar la solicitud fetch
  fetch(classIdURL)
    .then(function (response) {
      // Verificar si la respuesta es exitosa
      if (response.ok) {
        return response.json(); // Convertir la respuesta a JSON
      }
      throw Error("Network response was not OK"); // Manejar errores de red
    })
    .then(function (data) {
      console.log(data); // Mostrar los datos recibidos en la consola (opcional)
      buildInventoryList(data); // Llamar a una función para construir la lista de inventario
    })
    .catch(function (error) {
      console.log('There was a problem: ', error.message); // Manejar errores
    });
});


// Build inventory items into HTML table components and inject into DOM 
function buildInventoryList(data) { 
    let inventoryDisplay = document.getElementById("inventoryDisplay"); 
    // Set up the table labels 
    let dataTable = '<thead>'; 
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
    dataTable += '</thead>'; 
    // Set up the table body 
    dataTable += '<tbody>'; 
    // Iterate over all vehicles in the array and put each in a row 
    data.forEach(function (element) { 
     console.log(element.inv_id + ", " + element.inv_model); 
     dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`; 
     dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
     dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; 
    }) 
    dataTable += '</tbody>'; 
    // Display the contents in the Inventory Management view 
    inventoryDisplay.innerHTML = dataTable; 
   }