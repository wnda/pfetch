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
  
  var matchScripts = function( new_scripts ){
    var existing_scripts = [].slice.call(document.querySelectorAll('script[src]'), 0);
    var idx;
    for(var i=0; i<existing_scripts.length; i++){
        idx = new_scripts.indexOf(existing_scripts[i]);
        if (idx > -1) {
            new_scripts.splice(idx, 1);
        }
    }
  };

  var appendAndRunScripts = function( new_scripts ){
    if( !scripts ) return;
    
    var new_scripts = matchScripts( new_scripts );
    
    var i = new_scripts.length, j = 0;
    for( ; i > j; j++ ){
      var script_to_add = document.createElement( 'script' );
      if( new_scripts[j].type ) script_to_add.type = new_scripts[j].type;
      if( new_scripts[j].async ) script_to_add.setAttribute( 'async','' );
      if( new_scripts[j].src ) script_to_add.src = new_scripts[j].src;
      if( new_scripts[j].textContent ) script_to_add.textContent = new_scripts[j].textContent;
      ( document.head || document.getElementsByTagName('head')[0] ).appendChild( script_to_add );
    }
  };

  var stripHash = function( location ){
    return location.href.replace(/#.*/, '');
  };

  var getLinkFromEventTarget = function( element ){
    if ( element.tagName.toLowerCase() === 'body' ){ throw new Error( 'Reached BODY element' ); }
    if ( !!element.href && element.tagName.toLowerCase() === 'a' ) { processLink( element ); return; }
    getLinkFromEventTarget( element.parentNode );
  };

  var processLink = function( link ){
    if ( !link ) return;
    if ( window.location.protocol !== link.protocol || window.location.hostname !== link.hostname ) return;
    if ( link.href.indexOf( '#' ) > -1 && stripHash( link ) == stripHash( window.location ) ) return;
    loadPage( link.href );
  };

  var processNewHTML = function( resp_txt, url ){
    var parser = new DOMParser(),
        doc = parser.parseFromString( resp_txt, 'text/html' ),
        new_page = find( container, doc ),
        new_title = find( 'title', doc ).textContent,
        current_page = find( container ),
        new_scripts = findAllByTagName( 'script', doc ),
        hash = ( url.indexOf( '#' ) > -1 );

    find( 'title' ).textContent = new_title;
    current_page.parentNode.replaceChild( new_page, current_page );
    appendAndRunScripts( [].slice.call( new_scripts, 0 ) );
    history.pushState( null, '', url );

  };
  
  var abortXHR = function(xhr) {
    if ( xhr && xhr.readyState < 4) {
      xhr.onreadystatechange = null;
      xhr.abort();
    }
  }

  var loadPage = function( url ){

    if ( "fetch" in window ){

      fetch( url, {
        method: 'GET',
        headers: { 'Content-Type' : 'text/html' },
        mode: 'same-origin'
      }).then( function( response ){
        var contentType = response.headers.get( 'Content-Type' );
        if ( response.ok && contentType && contentType.indexOf( 'text/html' ) !== -1 ){
          return response.text().then( function( resp_txt ){
            processNewHTML( resp_txt, url );
          }).catch( function(){ console.error( 'Error: failed to parse new HTML' ); });
        }
      }).catch( function( response ){ console.error( 'Error: ' + ( response.message || 'No data available' ) ); });

    } else {

      var xhr = new XMLHttpRequest();
      xhr.open( 'GET', url );
      xhr.setRequestHeader('X-PFETCH', 'true');
      xhr.setRequestHeader('X-PFETCH-Container', container);
      xhr.onreadystatechange = function(){
        if ( this.readyState === 4 && this.status >= 200 && this.status < 300 ){
          processNewHTML( this.response, url );
        }
      };
      xhr.onabort = xhr.onerror = function(){
        console.error( 'There was an error with the request' );
      };
      xhr.send();
    }
  };

  if ( history && history.pushState ){

    find( 'body' ).addEventListener( 'click', function( e ){
      if ( e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ) return;
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
