# plusjax
ajax plus.
pjax simplified.

## what is this?
This library started as an expansion of [this snippet](https://github.com/alexnormand/moby-dick-demo/blob/master/chapters/js/main.js) by Alex Normand.

Original source: https://github.com/alexnormand/moby-dick-demo/blob/master/chapters/js/main.js

This library left some basic problems:

1. clicking an anchor's child would not send a `href` up the event bubbling chain, resulting in normal unajax'd behaviour
2. fetch is not used
3. no graceful degradation is provided
4. no 'API' with which to govern how the snippet works (config/init object to pick container element, custom timeouts, etc).

## why not port pjax to vanilla js?

1. it has been [done](https://github.com/martndemus/pjax). [twice](https://github.com/cantlin/vanilla-pjax). both are solid. and big.
2. as IE8 gets shut down, we don't need as much crap in a pjax offshoot, as Alex Normand's original snippet already demonstrated.


## what has been added, and how?

1. in case the handy line `responseType = 'document'` isn't applicable (*cough* fetch) we use the HTML parser in JavaScript to polyfill it.
