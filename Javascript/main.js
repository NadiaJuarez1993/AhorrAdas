/* UTILITIES */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

//GENERA id DINAMICO EN CADA USO
const randomId = () => self.crypto.randomUUID();

//FUNCION DE MOSTRAR Y OCULTAR ELEMENTOS DEL DOM
const showElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.remove("hidden");
  }
};
const hideElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.add("hidden");
  }
};

//SETEA Y TRAE INFO DEL LOCAL STORAGE
const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

//categorias pre establecidas
const defaultCategories = [
  {
    id: randomId(), //genera id dinamico
    categoryName: "Comida",
  },
  {
    id: randomId(),
    categoryName: "Servicios",
  },
  {
    id: randomId(),
    categoryName: "Salidas",
  },
  {
    id: randomId(),
    categoryName: "Educacion",
  },
  {
    id: randomId(),
    categoryName: "Transporte",
  },
  {
    id: randomId(),
    categoryName: "Trabajo",
  }
];

//INICIALIZACION DE NUESTROS USUARIOS
const allOperations = getData("operations") || []; //logica para pintar tabla: PEDIMOS INFO AL LOCAL STORAGE, SI TRAE INFO SE GUARDA EN VARIABLE ALL USERS Y SI NO SE CUMPLE SE GUARDA EN EL ARRAY VACIO
const allCategories = getData("categories") || defaultCategories; //sino hay nuevas categorias , carga las categorias por defaoult

/*RENDERS*/
//SE ENCARGA DE RECIBIR LA OPERERACIONES COMO PARAMETROS PARA QE PODAMOS RECORRERER LA CANTIDAD DE OPERACIONES QUE HAYA CON ESTE BUCLE Y GENERAMOS LA TABLA
const renderOperations = (operations) => {
  // funcion para tabla de operaciones
  if (operations.length) {
    hideElement(["#without-operations"]);
    showElement(["#width-operations"]);
    for (const operation of operations) {
      const categorySelected = getData ("categories").find(category => category.id === operation.category)
      $("#operation-table-body").innerHTML += `
       <tr>
         <td class="py-4 font-semibold">${operation.description}</td>
         <td class="text-green-400 py-2">${categorySelected.categoryName}</td>
         <td class="py-4">${operation.date}</td>
         <td class="py-4"> <span class="text-green-500">+$</span><span class="text-red-700 ">-$</span> ${operation.amount}</td>
         <td class="py-4">
         <button class="rounded-none bg-inherit text-blue-600 hover:text-black" onclick="showFormEdit('${operation.id}')"><a>Editar</a></button>  
         <button class="rounded-none bg-inherit text-blue-600 hover:text-black" onclick="showDeleteModal('${operation.id}', '${operation.description}')"><a>Eliminar</a></button>
         </td>
       </tr>  
       `;
    }
  } else {
    showElement(["#without-operations"]);
    hideElement(["#width-operations"]);
  }
};

const renderCategoriesTable = (categories) => {
   for (const category of categories) {
     $("#table-category").innerHTML += `
       <tr>
         <td>${category.categoryName}</td>
         <td>
             <button class="rounded-none bg-inherit text-blue-600 hover:text-black"><a>Editar</a></button>  
             <button class="rounded-none bg-inherit text-blue-600 hover:text-black"><a>Eliminar</a></button>
          </td>
     </tr>
    `;
   }
 };

const renderCategoryOptions = (categories) => {
   for (const category of categories) {
     $("#category-input").innerHTML += `
     <option value="${category.id}">${category.categoryName}</option>
     `;
   }
};

/*DATA HANDLERS*/
//Agregar operaciones
const addOperation = () => {
  const currentData = getData("operations"); // pido la info
  currentData.push(saveOperationsInfo()); // modifico la info
  setData("operations", currentData); // mando la data
  renderOperations(currentData); // aca aparece la tabla pintada pero undifine
};

//GUARDAMOS LA INFO DEL FORMULARIO Y NOS RETORNA  UN OBJETO CON LA INFO
const saveOperationsInfo = (operationId) => {
  return {
    id: operationId ? operationId : randomId(), //tengo user id, entonces guardame ese id que paso por parametro y sino pasame un id nuevo
    description: $("#description-input").value,
    amount: $("#amount-input").value,
    type: $("#type-input").value,
    category: $("#category-input").value,
    date: $("#date-input").value,
  };
};
//en el boton de editar le paso el aide por parametro onclick="showFormEdit('${operation.id}')" a la funciom, el id lo recibo en la funcion const showFormEdit = (operationsId) y asi definimos parametro

//SE EJECUTA EN EL BOTON DE EDITAR (CAMBIO DE PANTALLA)
const showFormEdit = (operationId) => {
  //CAMBIO DE PANTALLA
  hideElement(["#main-view", "#btn-add-operation", "#new-opration-title"]);
  showElement([
    "#new-oparation-form",
    "#btn-edit-operation",
    "#edit-opration-title",
  ]);
  //LE PASAMOS EL ID AL BOTON EDITAR DEL FORM
  $("#btn-edit-operation").setAttribute("data-id", operationId);
  // PEDIMOS Y ENCONTRAMOS EL USUARIOJ
  const operationSelected = getData("operations").find(
    (operation) => operation.id === operationId
  ); //pido la  info al local storage y ejecuto la funcion find y pregunto si el user.id (editar) y pregunto si operation.id quiero quedarme con el que  estricamente igual a  operationsId
  $("#description-input").value = operationSelected.description; //precargo el formulario con esa info
  $("#amount-input").valueAsNumber = operationSelected.amount; //precargo el formulario con esa info
  $("#type-input").value = operationSelected.type;
  $("#category-input").value = operationSelected.category; //precargo el formulario con esa info
  $("#date-input").value = operationSelected.date; //precargo el formulario con esa info
};

//editar operaciones
const editOperation = () => {
  const operationId = $("#btn-edit-operation").getAttribute("data-id"); //TTOMAMOS EL ID DEL BOTON
  const currentData = getData("operations").map((operation) => {
    if (operation.id === operationId) {
      return saveOperationsInfo(operationId); //TAREMOS LA OERACION MODIFICADOS
    }
    return operation;
  });
  setData("operations", currentData);
};

//mostrar ventana modal
const showDeleteModal = (operationId, operationDescription) => {
  showElement(["#delete-modal"]);
  hideElement(["#main-view", "#btn-add-operation", "#new-opration-title"]);
  $("#btn-delete").setAttribute("data-id", operationId); //paso de id  en ambos eliminar
  $("#operation-name").innerText = `${operationDescription}`;
  $("#btn-delete").addEventListener("click", () => {
    const operationId = $("#btn-delete").getAttribute("data-id"); //tomo el id de la operacion
    deleteOperation(operationId); //eliminacion
    window.location.reload();
  });
};
//eliminar una operacion
const deleteOperation = (operationId) => {
  const currentData = getData("operations").filter(
    (operation) => operation.id != operationId
  );
  setData("operations", currentData);
  window.location.reload();
};

/*EVENTS*/
const initializeApp = () => {
  setData("operations", allOperations);
  setData("categories", allCategories);
  renderOperations(allOperations); 
  renderCategoriesTable(allCategories);
  renderCategoryOptions(allCategories);

  $("#new-operation-btn").addEventListener("click", () => {
    // cambio de pantalla para agregar nueva operacion
    showElement(["#new-oparation-form"]);
    hideElement(["#main-view"]);
  });

  $("#btn-add-operation").addEventListener("click", (e) => {
    e.preventDefault(); // no recargar el form
    addOperation();
    hideElement(["#new-oparation-form"]);
    showElement(["#main-view"]);
    window.location.reload();
  });

  $("#btn-cancel-operation").addEventListener("click", () => {
    hideElement(["#new-oparation-form"]);
    showElement(["#main-view"]);
  });

  //BOTON EDITAR OPERACION EN FORMULARIO
  $("#btn-edit-operation").addEventListener("click", (e) => {
    e.preventDefault();
    editOperation();
    window.location.reload(); // RECARGAMOS LA PAGINA
  });

  //boton de cerrar ventana modal
  $("#btn-close-modal").addEventListener("click", () => {
    hideElement(["#delete-modal"]);
    showElement(["#main-view"]);
  });

  $("#btn-cancel-modal").addEventListener("click", () => {
    hideElement(["#delete-modal"]);
    showElement(["#main-view"]);
  });

  $("#btn-category").addEventListener("click", () => {
    hideElement(["#main-view"]);
    showElement(["#category-view"]);
  });

  $("#btn-balance").addEventListener("click", () => {
    showElement(["#main-view"]);
  });

  $("#btn-hamburguer-menu").addEventListener("click", () => {
    showElement(["#nav-bar", "#btn-close-menu"]);
    hideElement(["#btn-hamburguer-menu"]);
  });

  $("#btn-close-menu").addEventListener("click", () => {
    showElement(["#btn-hamburguer-menu"]);
    hideElement(["#nav-bar", "#btn-close-menu"]);
  });
};

window.addEventListener("load", initializeApp);
