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

    if (min < 1){  //min must be greater than one
      return;
    }
    if (max <= min ){  //max must be more than min
      return;
    }
    if (name.length < 2){  //name must be two chars long
      return;
    }
    socket.emit('createfactory', { name: name, min: min, max: max } );
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
    alert('hi');
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
  });

  /*
    Delete node from tree
  */
  socket.on('deletenode', function(msg){
    instance = $('#jstree').jstree(true);
    instance.delete_node (msg);
  });

});
