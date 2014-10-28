/*
  All the socket.io stuff/logic for the app
*/

$( document ).ready(function(){
  var socket = io();

  /*
    Create new factory node
  */

  $('#newfactory').click(function(){
    name = $('#factoryname').val();
    min = $('#factorymin').val();
    max = $('#factorymax').val();

    //TODO: do more with invalid input
    if (min < 1){  //min must be greater than one
      return;
    }
    if (max <= min ){  //max must be more than min
      return;
    }
    if (name.length < 2){  //name must be two chars long
      return;
    }

    $(this).prop("disabled", true);  //disable save button, enable again on success or fail of save
    socket.emit('createfactory', { name: name, min: min, max: max } );

    $('#factoryname').val('');
    $('#factorymin').val('');
    $('#factorymax').val('');

  });

  /*
    Delete a factory node from the database
  */
  $('#deletefactory').click(function(){
    instance = $('#jstree').jstree(true);
    id = instance.get_selected (false);
    socket.emit('deletefactory', id[0] );
  });

  $('#generateworkers').click(function(){
    quantity = $('#workerquantity').val();

    instance = $('#jstree').jstree(true);
    id = instance.get_selected (false);
    msg = {
      id : id[0],
      quantity : quantity
    };
    socket.emit('generateworkers', msg);
  });

  /*
    Add Node to the tree
  */
  socket.on('addnode', function(msg){
    instance = $('#jstree').jstree(true);
    root = $('#rootnode');
    instance.create_node (root, msg);
    $('#newfactory').prop('disabled', false);
    $('#createFactory').modal('hide');

  });

  /*
    Add worker to the tree
  */
  socket.on('addworker', function(msg){
    instance = $('#jstree').jstree(true);
    parent = instance.get_node(msg.parent);
    root = $('#' + msg.parent);
    instance.create_node (root, msg.node);
  });

  /*
    Delete node from tree
  */
  socket.on('deletenode', function(msg){
    instance = $('#jstree').jstree(true);
    instance.delete_node (msg);
  });

  socket.on('factorySaveError', function(msg){
    errorDiv = $('#factoryError');
    errorDiv.show();
    errorDiv.html(msg);
    $('#newFactory').prop('disabled', false);
  });

});
