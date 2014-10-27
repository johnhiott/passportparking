/*
  Setup for jsTree
  Make sure jQuery is loaded first
*/

function customMenu(node) {

  var items = {
    createFactory: {
      label: "Create Factory",
      action: function () {
        $('#createFactory').modal('show');
      }
    },
    generateWorkers: {
      label: "Generate Workers",
      action: function () {
        $('#createWorkers').modal('show');
      }
    },
    deleteFactory: { // The "delete" menu item
      label: "Delete Factory",
      action: function () {
        $('#deleteFactory').modal('show');
      }
    }
  };

  tmpNode = $('#' + node.id);
  if (node.id == "rootnode") {
    delete items.generateWorkers;
    delete items.deleteFactory;
  }else if (tmpNode.hasClass("factory_node")) {
    delete items.createFactory;
  }else {
    delete items.generateWorkers;
    delete items.createFactory;
    delete items.deleteFactory;
  }

  return items;
}

/*
  Build Tree From Database and set options
*/
$( document ).ready(function(){
  $('#jstree').jstree({
    'core' : {
    'multiple' : false,
    'check_callback': true,
      'data' : {
        'url' : 'data',
        'dataType' : 'json'
      }
    },
    plugins: ["contextmenu", "sort"],
    contextmenu: {items: customMenu}
  });

  /*
    Handle a node click
  */
  $('#jstree').on('select_node.jstree', function (node, selected, event) {
    node = selected.node;
    if (node.data.type == "factory"){
    }
  }).jstree();

});
