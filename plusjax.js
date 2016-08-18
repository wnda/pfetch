;(function(){

  var container = 'main';

  var find = function( selector, context ){
    return (context || document).querySelector( selector );
  };

  var stripHash = function( location ){
    return location.href.replace(/#.*/, '');
  };

  var getAnchor = function( element ){
    if ( element.tagName.toLowerCase() === 'body' )
    {
      return false;
    }

    if ( !!element.href && element.tagName.toLowerCase() === 'a' )
    {
      asyncLoad( element );
      return false;
    }

    getAnchor( element.parentNode );

  };

  var asyncLoad = function( link ){

    if ( !link )
    {
      return false;
    }

    if ( window.location.protocol !== link.protocol || window.location.hostname !== link.hostname )
    {
      return false;
    }

    if ( link.href.indexOf( '#' ) > -1 && stripHash( link ) == stripHash( window.location ) )
    {
      return false;
    }

    loadPage( link.href );
    history.pushState( null, null, link.href );

  };

  var loadPage = function( url ){
    
    var hash = !!( url.indexOf( '#' ) > -1 );
    
    if ( "fetch" in window )
    {
      fetch( url )
      .then(function(resp)
      {
        if ( resp.ok || resp.status >= 200 && resp.status < 300 )
        {
          return resp.text().then(function(txt){
            var parser = new DOMParser(),
                doc = parser.parseFromString( txt, "text/html" ),
                newPage = find( container, doc ),
                newTitle = find( 'title', doc ).textContent,
                currentPage = find( container );
          
            find( 'title' ).textContent = newTitle;
            currentPage.parentNode.replaceChild( newPage, currentPage );
            
            if( !hash )
            {
              window.scrollTo(0, 0);
            }
          })
          .catch(function(){
            console.log( "No markup received" )
          });
        }
      })
      .catch(function(resp)
      {
        console.error( 'Error: ' + ( resp.message || 'No data available' ) );
      });
    }
    
    else
    {
      var done = false,
          xhr = new XMLHttpRequest();
  
      xhr.open( 'GET', url );
      xhr.responseType = 'document';
      
      xhr.onreadystatechange = function (){
        if ( this.readyState === 4 && this.status >= 200 && this.status < 300 )
        {
          done = true;
          
          var newPage = find( container, this.response ),
              newTitle = find( 'title', this.response ).textContent,
              currentPage = find( container );
          
          find( 'title' ).textContent = newTitle;
          currentPage.parentNode.replaceChild( newPage, currentPage );
          
          if( !hash )
          {
            window.scrollTo(0, 0);
          }
          
        }
        
      };
  
      xhr.onabort = xhr.onerror = function() {
        if ( !done )
        {
          done = true;
          console.info('There was an error with the request');
        }
      };
  
      xhr.send();
    }
    
  };

  if ( history && history.pushState )
  {
    find( 'body' ).addEventListener( 'click', function( e ){
      e.preventDefault();
      getAnchor( e.target );
    });

    setTimeout(function(){
      window.onpopstate = function(){
        loadPage( window.location.href );
      };
    }, 1e3);

  }

})();
