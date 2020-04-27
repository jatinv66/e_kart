$(document).ready(function(){
    $('.delete-product').on('click',function(e){
        $target =$(e.target);
        const id=($target.attr('data-id'));
        $.ajax({
            type:'DELETE',
            url:'/products/'+id,
            success: function(response){
                alert('Deleting Product');
                window.location.href='/admins/admin_index';

            },
            error: function(err){
                console.log(err);
            }
        });
    });
    $('.delete-cart-product').on('click',function(e){
        $target =$(e.target);
        const pid=($target.attr('data-cart-id'));
        const uid=($target.attr('user-id'));
        $.ajax({
            type:'DELETE',
            url:'/carts/'+pid,
            success: function(response){
                alert('Deleting Product');
                window.location.href='/carts/show/'+uid;

            },
            error: function(err){
                console.log(err);
            }
        });
    });
});

var showResults = debounce(function(arg){
    var value = arg.trim();
    if(value == "" || value.length <= o){
      $("#search-results").fadOut();
      return;
    }else{
      $("#search-results").fadeIn();
    };
    var jqhr = $.get('/products/search', function(data){
    })
    .done(function(data){
      if(data.length === 0){
        $("search-resuts").append('<p classs="lead text-center mt-2">No Results</p>');
    }else{
      data.forEach(x => {
        $("search-resuts").append('<a href="#"><p class="m-2 lead"><img style="width:60px;" src="images/supreme1.jpg">' + x.title +'</p></a>');
      });
    }
    })
    .fail(function(err){
      console.log(err);
    })
  },200);