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

    errors = [];
    failed = false;

    //TODO: do more with invalid input
    if (name && name.length > 100){
      errors.push("Name is to long, must be less than < 100 chars");
      failed = true;
    }
    if (min < 1){  //min must be greater than one
      errors.push("Min must be greate than 1");
      failed = true;
    }
    if (max <= min ){  //max must be more than min
      errors.push("max must be more than min");
      failed = true;
    }
    if (name.length < 2){  //name must be two chars long
      errors.push("Name must be > than 2 characters");
      failed = true;
    }
    if (max > 100000){
      errors.push("Max must be less than 100,000")
      failed = true;
    }

    if (failed){
      errorsDiv =  $('#errors');
      errorsDiv.show();
      errorHtml = "";
      for (x=0; x<errors.length; x++){
        errorHtml += errors[x] + '<br/>';
      }

      errorsDiv.html(errorHtml);
      return;
    }

    $('#errors').hide();

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
    $('#factoryDetails').hide();

  });

  $('#generateworkers').click(function(){
    quantity = $('#workerquantity').val();

    if ( quantity < 1 || quantity >  15 ){
      $('#errors').show();
      $('#errors').html("Must be between 1 and 15");
      return;
    }

    $('#errors').hide();
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
