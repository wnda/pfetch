;( function(){

  var container = 'main';

  var find = function( selector, context ){
    return ( context || document ).querySelector( selector );
  };
  
  var findAll = function( selector, context ){
    return ( context || document ).querySelectorAll( selector );
  };
  
  var runScripts = function( new_scripts ){
    
    var i = new_scripts.length, j = 0;
    
    for( ; i > j; j++ )
    {
      var script_to_add = document.createElement( 'script' );

      if( new_scripts[j].type ) script_to_add.type = new_scripts[j].type;
      
      if( new_scripts[j].async ) script_to_add.setAttribute('async','');
      
      if( new_scripts[j].src ) script_to_add.src = new_scripts[j].src;
      else script_to_add.textContent = new_scripts[nso].textContent;

      ( document.head || document.getElementsByTagName('head')[0] ).appendChild( script_to_add );
    }
  };

  var stripHash = function( location ){
    return location.href.replace(/#.*/, '');
  };

  var getLinkFromEventTarget = function( element ){
    if ( element.tagName.toLowerCase() === 'body' ) return; 
    if ( !!element.href && element.tagName.toLowerCase() === 'a' ) processLink( element ); return;
    getLinkFromEventTarget( element.parentNode );
  };

  var processLink = function( link ){
    if ( !link ) return;
    if ( window.location.protocol !== link.protocol || window.location.hostname !== link.hostname ) return;
    if ( link.href.indexOf( '#' ) > -1 && stripHash( link ) == stripHash( window.location ) ) return;
    
    loadPage( link.href );
    history.pushState( null, null, link.href );
  };

  var loadPage = function( url ){
    
    var hash = !!( url.indexOf( '#' ) > -1 );
    
    if ( "fetch" in window ){
      
      fetch( url, { 
        method: 'GET',
        headers: { 'Content-Type' : 'text/html' },
        mode: 'same-origin'
      }).then( function( response ){
        
        var contentType = response.headers.get( 'Content-Type' );
        
        if ( response.ok && contentType && contentType.indexOf( 'text/html' ) !== -1 ){
          return response.text().then( function( resptxt ){
            
            var parser = new DOMParser(),
                doc = parser.parseFromString( resptxt, 'text/html' ),
                newPage = find( container, doc ),
                newTitle = find( 'title', doc ).textContent,
                currentPage = find( container ),
                new_scripts = findAll( 'script', doc );
            
            find( 'title' ).textContent = newTitle;
            currentPage.parentNode.replaceChild( newPage, currentPage );
            runScripts( new_scripts );
            
            if( !hash ) window.scrollTo( 0, 0 ); 
            
          }).catch( function(){ console.info( 'Error: failed to parse new HTML' ) });
        }
      }).catch( function( response ){ console.info( 'Error: ' + ( response.message || 'No data available' ) ) });
    
    } else {
      
      var done = false,
          xhr = new XMLHttpRequest();
          
      xhr.open( 'GET', url );
      xhr.responseType = 'document';
      
      xhr.onreadystatechange = function(){
        if ( this.readyState === 4 && this.status >= 200 && this.status < 300 ){
          done = true;
      
          var newPage = find( container, this.response ),
              newTitle = find( 'title', this.response ).textContent,
              currentPage = find( container );
      
          find( 'title' ).textContent = newTitle;
          currentPage.parentNode.replaceChild( newPage, currentPage );
      
          if( !hash ){ window.scrollTo( 0, 0 ); }
        }
      };
  
      xhr.onabort = xhr.onerror = function(){
        if ( !done ){ done = true; console.info( 'There was an error with the request' ); }
      };
  
      xhr.send();
      
    }
    
  };

  if ( history && history.pushState ){
    find( 'body' ).addEventListener( 'click', function( e ){
      if ( e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ){ return; }
      e.preventDefault();
      getLinkFromEventTarget( e.target );
    });

    setTimeout( function(){
      window.onpopstate = function(){
        loadPage( window.location.href );
      };
    }, 1e3);

  }

})();
