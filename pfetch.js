;( function(){

  var container = 'main';

  var find = function( selector, context ){
    return ( context || document ).querySelector( selector );
  };
  
  var findAll = function( selector, context ){
    return ( context || document ).querySelectorAll( selector );
  };
  
  var findAllByTagName = function( selector, context ){
    return ( context || document ).getElementsByTagName( selector );
  };
  
  var removeScripts = function( doc ){
    var scripts = doc.getElementsByTagName( 'script' ),
        i = scripts.length,
        j = 0;
    for(; i > j; j++){
      scripts[j].parentNode.removeChild(scripts[j]);
    }
    return doc;
  };
  
  var appendAndRunScripts = function( new_scripts ){
    var i = new_scripts.length, j = 0;
    for( ; i > j; j++ )
    {
      var script_to_add = document.createElement( 'script' );
      if( new_scripts[j].type ){ script_to_add.type = new_scripts[j].type;}
      if( new_scripts[j].async ){ script_to_add.setAttribute('async','');}
      if( new_scripts[j].src ){ script_to_add.src = new_scripts[j].src;}
      else{ script_to_add.textContent = new_scripts[nso].textContent;}
      ( document.head || document.getElementsByTagName('head')[0] ).appendChild( script_to_add );
    }
  };

  var stripHash = function( location ){
    return location.href.replace(/#.*/, '');
  };

  var getLinkFromEventTarget = function( element ){
    if ( element.tagName.toLowerCase() === 'body' ){ return; } 
    if ( !!element.href && element.tagName.toLowerCase() === 'a' ){ processLink( element ); return; }
    getLinkFromEventTarget( element.parentNode );
  };

  var processLink = function( link ){
    if ( !link ){ return; }
    if ( window.location.protocol !== link.protocol || window.location.hostname !== link.hostname ){ return; }
    if ( link.href.indexOf( '#' ) > -1 && stripHash( link ) == stripHash( window.location ) ){ return; }
    
    loadPage( link.href );
    history.pushState( null, null, link.href );
  };
  
  var processNewHTML = function( ){
    var parser = new DOMParser(),
        doc = parser.parseFromString( resptxt, 'text/html' ),
        processed_doc = removeScripts( doc ),
        newPage = find( container, processed_doc ),
        newTitle = find( 'title', processed_doc ).textContent,
        currentPage = find( container ),
        new_scripts = findAllByTagName( 'script', doc );
            
    find( 'title' ).textContent = newTitle;
    currentPage.parentNode.replaceChild( newPage, currentPage );
    appendAndRunScripts( new_scripts );
    
    if( !hash ){ window.scrollTo( 0, 0 ); }
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
            processNewHTML( resptxt )
          }).catch( function(){ console.info( 'Error: failed to parse new HTML' ) });
        }
      }).catch( function( response ){ console.info( 'Error: ' + ( response.message || 'No data available' ) ) });
  
    } else {
      
      var xhr = new XMLHttpRequest();
      xhr.open( 'GET', url );
      xhr.onreadystatechange = function(){
        if ( this.readyState === 4 && this.status >= 200 && this.status < 300 ){
          processNewHTML( this.response );
        }
      };
      xhr.onabort = xhr.onerror = function(){
        console.info( 'There was an error with the request' );
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
