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

    var done = false;

    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);

    xhr.responseType = 'document';
    
    // if document not available
    // or using fetch
    // var parser = new DOMParser();
    // var doc = parser.parseFromString(this.response, "text/html");
    // var newPage = find( container, doc );

    xhr.onreadystatechange = function (){

      if ( this.readyState === 4 && this.status >= 200 && this.status < 300 )
      {
        done = true;

        var newPage = find( container, this.response );

        var newTitle = find( 'title', this.response ).textContent;

        var currentPage = find( container );

        find( 'title' ).textContent = newTitle;

        currentPage.parentNode.replaceChild( newPage, currentPage );

        window.scrollTo(0, 0);
      }
    };

    xhr.onabort = xhr.onerror = function() {
      if ( !done )
      {
        done = true;
        console.info('There was an error with your request');
      }
    };

    xhr.send();
  };

  if (history && history.pushState)
  {
    find( 'body' ).addEventListener( 'click', function( e ) {

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
