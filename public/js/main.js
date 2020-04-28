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
    $('.delete-image').on('click',function(e){
        $target =$(e.target);
        const id=($target.attr('image-id'));
        $.ajax({
            type:'DELETE',
            url:'/files/'+id,
            success: function(response){
                alert('Deleting image');
                window.location.href='/upload';

            },
            error: function(err){
                console.log(err);
            }
        });
    });
});