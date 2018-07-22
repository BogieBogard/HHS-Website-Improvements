(function ($) {

Drupal.jQueryUiFilter = Drupal.jQueryUiFilter || {}
Drupal.jQueryUiFilter.accordionOptions = Drupal.jQueryUiFilter.accordionOptions || {}

/**
 * Scroll to an accordion's active element.
 */
Drupal.jQueryUiFilter.accordionScrollTo = function(accordion) {
  var options = $(accordion).data('options') || {}
  if (!options['scrollTo'] || !$(accordion).find('.ui-state-active').length) {
    return;
  }

  var top = $(accordion).find('.ui-state-active').offset().top;
  if (options['scrollTo']['duration']) {
    $('html, body').animate({scrollTop: top}, options['scrollTo']['duration']);
  }
  else {
    $('html, body').scrollTop(top);
  }
}

/**
 * Accordion change event handler to bookmark active element in location.hash.
 */
Drupal.jQueryUiFilter.accordionChangeStart = function(event, ui) {
  var href = ui.newHeader.find('a').attr('href');
  if (href) {
    location.hash = href;
    return false; // Cancel event and let accordionHashChangeEvent handler activate the element.
  }
  else {
    return true;
  }
}

/**
 * On hash change activate and scroll to an accordion element.
 */
Drupal.jQueryUiFilter.accordionHashChangeEvent = function() {
  $accordionHeader = $('.ui-accordion > .ui-accordion-header:has(a[href="' + location.hash + '"])')
  $accordion = $accordionHeader.parent();
  var index = $accordionHeader.prevAll('.ui-accordion-header').length;

  if ($.ui.version == '1.8.7') {
    // NOTE: Accordion 'Active' property not change'ing http://bugs.jqueryui.com/ticket/4576
    $accordion.accordion('activate', index);
  }
  else {
    // NOTE: Accordion 'Active' property http://api.jqueryui.com/accordion/#option-active
    $accordion.accordion('option', 'active', index);
  }
}

/**
 * jQuery UI filter accordion behavior.
 */
Drupal.behaviors.jQueryUiFilterAccordion  = {attach: function(context) {
  if (Drupal.settings.jQueryUiFilter.disabled) {
    return;
  }

  var headerTag = Drupal.settings.jQueryUiFilter.accordionHeaderTag;

  $('div.jquery-ui-filter-accordion', context).once('jquery-ui-filter-accordion', function () {
    var options = Drupal.jQueryUiFilter.getOptions('accordion');

    // Look for jQuery UI filter header class.
    options['header'] = '.jquery-ui-filter-accordion-header';

    if ($(this).hasClass('jquery-ui-filter-accordion-collapsed')) { // Set collapsed options
      options['collapsible'] = true;
      options['active'] = false;
    }

    // Convert <h*> to div to remove tag and insure the accordion does not use the existing h3 style.
    // Sets active item based on location.hash.
    var index = 0;
    $(this).find(headerTag + '.jquery-ui-filter-accordion-header').each(function(){
      var id = this.id || $(this).text().toLowerCase().replace(/[^-a-z0-9]+/gm, '-');
      var hash = '#' + id;
      if (hash == location.hash) {
        options['active'] = index;
      }
      index++;

      $(this).replaceWith('<div class="jquery-ui-filter-header jquery-ui-filter-accordion-header"><a href="' + hash + '">' + $(this).html() + '</a></div>');
    });

    // DEBUG:
    // console.log(options);

    // Save options as data and init accordion
    $(this).data('options', options).accordion(options);

    // Scroll to active
    Drupal.jQueryUiFilter.accordionScrollTo(this);

    // Bind accordion change event to record history
    if (options['history']) {
      $(this).bind('accordionchangestart', Drupal.jQueryUiFilter.accordionChangeStart);
    }

    // Init hash change event handling once
    if (!Drupal.jQueryUiFilter.accordionInitialized) {
      Drupal.jQueryUiFilter.hashChange(Drupal.jQueryUiFilter.accordionHashChangeEvent);
    }
    Drupal.jQueryUiFilter.accordionInitialized = true;
  });

}}

})(jQuery);
;
(function ($) {

/**
 * Equal height plugin.
 *
 * From: http://www.problogdesign.com/coding/30-pro-jquery-tips-tricks-and-strategies/
 */
if (jQuery.fn.equalHeight == undefined) {
  jQuery.fn.equalHeight = function () {
    var tallest = 0;
    this.each(function() {
      tallest = ($(this).height() > tallest)? $(this).height() : tallest;
    });
    return this.height(tallest);
  }
}

Drupal.jQueryUiFilter = Drupal.jQueryUiFilter || {}
Drupal.jQueryUiFilter.tabsOptions = Drupal.jQueryUiFilter.tabsOptions || {}

/**
 * Tabs pagings
 *
 * Inspired by : http://css-tricks.com/2361-jquery-ui-tabs-with-nextprevious/
 */
Drupal.jQueryUiFilter.tabsPaging = function(selector, options) {
  options = jQuery.extend({paging: {'back': '&#171; Previous', 'next': 'Next &#187;'}}, options);

  var $tabs = $(selector);
  var numberOfTabs = $tabs.find(".ui-tabs-panel").size() - 1;

  // Add back and next buttons.
  // NOTE: Buttons are not 'themeable' since they should look like a themerolled jQuery UI button.
  $tabs.find('.ui-tabs-panel').each(function(i){
    var html = '';
    if (i != 0) {
      html += '<button type="button" class="ui-tabs-prev" rel="' + (i-1) + '" style="float:left">' + Drupal.t(options.paging.back) + '</button>';
    }
    if (i != numberOfTabs) {
      html += '<button type="button" href="#" class="ui-tabs-next" rel="' + (i+1) + '" style="float:right">' + Drupal.t(options.paging.next) + '</button>';
    }
    $(this).append('<div class="ui-tabs-paging clearfix clear-block">' +  html + '</div>');
  });

  // Init buttons
  $tabs.find('button.ui-tabs-prev, button.ui-tabs-next').button();

  // Add event handler
  $tabs.find('.ui-tabs-next, .ui-tabs-prev').click(function() {
    if ($.ui.version == '1.8.7') {
      $tabs.tabs('select', parseInt($(this).attr("rel")));
    }
    else {
      $tabs.tabs('option', 'active', parseInt($(this).attr("rel")));
    }
    return false;
  });
}

/**
 * Scroll to an accordion's active element.
 */
Drupal.jQueryUiFilter.tabsScrollTo = function(tabs) {
  var options = $(tabs).data('options') || {}
  if (!options['scrollTo']) {
    return;
  }

  var top = $(tabs).offset().top;
  if (options['scrollTo']['duration']) {
    $('html, body').animate({scrollTop: top}, options['scrollTo']['duration']);
  }
  else {
    $('html, body').scrollTop(top);
  }
}


/**
 * Tabs select event handler to bookmark selected tab in location.hash.
 */
Drupal.jQueryUiFilter.tabsSelect = function(event, ui) {
  location.hash = $(ui.tab).attr('href');
}

/**
 * On hash change select tab.
 *
 * Inspired by: http://benalman.com/code/projects/jquery-bbq/examples/fragment-jquery-ui-tabs/
 */
Drupal.jQueryUiFilter.tabsHashChangeEvent = function() {
  var $tab = $('.ui-tabs-nav > li:has(a[href="' + location.hash + '"])');
  $tabs = $tab.parent().parent();

  var selected = $tab.prevAll().length;

  if ($.ui.version == '1.8.7') {
    if ($tabs.tabs('option', 'selected') != selected) {
      $tabs.tabs('select', selected);
    }
  }
  else {
    if ($tabs.tabs('option', 'active') != selected) {
      $tabs.tabs('option', 'active', selected);
    }
  }
}

/**
 * jQuery UI filter tabs behavior
 */
Drupal.behaviors.jQueryUiFilterTabs = {attach: function(context) {
  if (Drupal.settings.jQueryUiFilter.disabled) {
    return;
  }

  var headerTag = Drupal.settings.jQueryUiFilter.tabsHeaderTag;

  // Tabs
  $('div.jquery-ui-filter-tabs', context).once('jquery-ui-filter-tabs', function () {
    var options = Drupal.jQueryUiFilter.getOptions('tabs');

    // Get <h*> text and add to tabs.
    // Sets selected tab based on location.hash.
    var scrollTo = false;
    var index = 0;
    var tabs = '<ul>';
    $(this).find(headerTag + '.jquery-ui-filter-tabs-header').each(function(){
      var id = this.id || $(this).text().toLowerCase().replace(/[^-a-z0-9]+/gm, '-');
      var hash = '#' + id;

      if (hash == location.hash) {
        scrollTo = true;
        options['selected'] = index;
      }
      index++;

      tabs += '<li><a href="' + hash + '">' + $(this).html() + '</a></li>';
      $(this).next('div.jquery-ui-filter-tabs-container').attr('id', id);
      $(this).remove();
    });
    tabs += '</ul>';
    $(this).prepend(tabs);

    // DEBUG:
    // console.log(options);

    // Save options as data and init tabs
    $(this).data('options', options).tabs(options);

    // Equal height tab
    $(this).find('.ui-tabs-nav li').equalHeight();

    // Add paging.
    if (options['paging']) {
      Drupal.jQueryUiFilter.tabsPaging(this, options);
    }

    // Bind tabs select event to record history
    if (options['history']) {
      $(this).bind('tabsselect', Drupal.jQueryUiFilter.tabsSelect);
    }

    // Scroll to selected tabs widget
    if (scrollTo) {
      Drupal.jQueryUiFilter.tabsScrollTo(this);
    }

    // Init hash change event handling once
    if (!Drupal.jQueryUiFilter.hashChangeInit) {
      Drupal.jQueryUiFilter.hashChange(Drupal.jQueryUiFilter.tabsHashChangeEvent);
    }
    Drupal.jQueryUiFilter.hashChangeInit = true;
  });
}}

})(jQuery);
;
/**
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 * 
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * @version 1.1.1 (9th December 2010) - fix bug (older IE's had problems)
 * @version 1.1 (1st September 2010) - support wipe up and wipe down
 * @version 1.0 (15th July 2010)
 */
(function ($) {
    $.fn.touchwipe = function (settings) {
        var config = {
            min_move_x: 20,
            min_move_y: 20,
            wipeLeft: function () {},
            wipeRight: function () {},
            wipeUp: function () {},
            wipeDown: function () {},
            preventDefaultEvents: true
        };
        if (settings) $.extend(config, settings);
        this.each(function () {
            var startX;
            var startY;
            var isMoving = false;

            function cancelTouch() {
                this.removeEventListener('touchmove', onTouchMove);
                startX = null;
                isMoving = false
            }
            function onTouchMove(e) {
                if (config.preventDefaultEvents) {
                    e.preventDefault()
                }
                if (isMoving) {
                    var x = e.touches[0].pageX;
                    var y = e.touches[0].pageY;
                    var dx = startX - x;
                    var dy = startY - y;
                    if (Math.abs(dx) >= config.min_move_x) {
                        cancelTouch();
                        if (dx > 0) {
                            config.wipeLeft()
                        } else {
                            config.wipeRight()
                        }
                    } else if (Math.abs(dy) >= config.min_move_y) {
                        cancelTouch();
                        if (dy > 0) {
                            config.wipeDown()
                        } else {
                            config.wipeUp()
                        }
                    }
                }
            }
            function onTouchStart(e) {
                if (e.touches.length == 1) {
                    startX = e.touches[0].pageX;
                    startY = e.touches[0].pageY;
                    isMoving = true;
                    this.addEventListener('touchmove', onTouchMove, false)
                }
            }
            if ('ontouchstart' in document.documentElement) {
                this.addEventListener('touchstart', onTouchStart, false)
            }
        });
        return this
    }
})(jQuery);;
/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransforms3d-csstransitions-touch-shiv-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a){var e=a[d];if(!C(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e}),q.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:w(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},q.csstransforms3d=function(){var a=!!F("perspective");return a&&"webkitPerspective"in g.style&&w("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},q.csstransitions=function(){return F("transition")};for(var G in q)y(q,G)&&(v=G.toLowerCase(),e[v]=q[G](),t.push((e[v]?"":"no-")+v));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)y(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},z(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,e.prefixed=function(a,b,c){return b?F(a,b,c):F(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};;
/*! jQuery Migrate v1.2.1 | (c) 2005, 2013 jQuery Foundation, Inc. and other contributors | jquery.org/license */
jQuery.migrateMute===void 0&&(jQuery.migrateMute=!0),function(e,t,n){function r(n){var r=t.console;i[n]||(i[n]=!0,e.migrateWarnings.push(n),r&&r.warn&&!e.migrateMute&&(r.warn("JQMIGRATE: "+n),e.migrateTrace&&r.trace&&r.trace()))}function a(t,a,i,o){if(Object.defineProperty)try{return Object.defineProperty(t,a,{configurable:!0,enumerable:!0,get:function(){return r(o),i},set:function(e){r(o),i=e}}),n}catch(s){}e._definePropertyBroken=!0,t[a]=i}var i={};e.migrateWarnings=[],!e.migrateMute&&t.console&&t.console.log&&t.console.log("JQMIGRATE: Logging is active"),e.migrateTrace===n&&(e.migrateTrace=!0),e.migrateReset=function(){i={},e.migrateWarnings.length=0},"BackCompat"===document.compatMode&&r("jQuery is not compatible with Quirks Mode");var o=e("<input/>",{size:1}).attr("size")&&e.attrFn,s=e.attr,u=e.attrHooks.value&&e.attrHooks.value.get||function(){return null},c=e.attrHooks.value&&e.attrHooks.value.set||function(){return n},l=/^(?:input|button)$/i,d=/^[238]$/,p=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,f=/^(?:checked|selected)$/i;a(e,"attrFn",o||{},"jQuery.attrFn is deprecated"),e.attr=function(t,a,i,u){var c=a.toLowerCase(),g=t&&t.nodeType;return u&&(4>s.length&&r("jQuery.fn.attr( props, pass ) is deprecated"),t&&!d.test(g)&&(o?a in o:e.isFunction(e.fn[a])))?e(t)[a](i):("type"===a&&i!==n&&l.test(t.nodeName)&&t.parentNode&&r("Can't change the 'type' of an input or button in IE 6/7/8"),!e.attrHooks[c]&&p.test(c)&&(e.attrHooks[c]={get:function(t,r){var a,i=e.prop(t,r);return i===!0||"boolean"!=typeof i&&(a=t.getAttributeNode(r))&&a.nodeValue!==!1?r.toLowerCase():n},set:function(t,n,r){var a;return n===!1?e.removeAttr(t,r):(a=e.propFix[r]||r,a in t&&(t[a]=!0),t.setAttribute(r,r.toLowerCase())),r}},f.test(c)&&r("jQuery.fn.attr('"+c+"') may use property instead of attribute")),s.call(e,t,a,i))},e.attrHooks.value={get:function(e,t){var n=(e.nodeName||"").toLowerCase();return"button"===n?u.apply(this,arguments):("input"!==n&&"option"!==n&&r("jQuery.fn.attr('value') no longer gets properties"),t in e?e.value:null)},set:function(e,t){var a=(e.nodeName||"").toLowerCase();return"button"===a?c.apply(this,arguments):("input"!==a&&"option"!==a&&r("jQuery.fn.attr('value', val) no longer sets properties"),e.value=t,n)}};var g,h,v=e.fn.init,m=e.parseJSON,y=/^([^<]*)(<[\w\W]+>)([^>]*)$/;e.fn.init=function(t,n,a){var i;return t&&"string"==typeof t&&!e.isPlainObject(n)&&(i=y.exec(e.trim(t)))&&i[0]&&("<"!==t.charAt(0)&&r("$(html) HTML strings must start with '<' character"),i[3]&&r("$(html) HTML text after last tag is ignored"),"#"===i[0].charAt(0)&&(r("HTML string cannot start with a '#' character"),e.error("JQMIGRATE: Invalid selector string (XSS)")),n&&n.context&&(n=n.context),e.parseHTML)?v.call(this,e.parseHTML(i[2],n,!0),n,a):v.apply(this,arguments)},e.fn.init.prototype=e.fn,e.parseJSON=function(e){return e||null===e?m.apply(this,arguments):(r("jQuery.parseJSON requires a valid JSON string"),null)},e.uaMatch=function(e){e=e.toLowerCase();var t=/(chrome)[ \/]([\w.]+)/.exec(e)||/(webkit)[ \/]([\w.]+)/.exec(e)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e)||/(msie) ([\w.]+)/.exec(e)||0>e.indexOf("compatible")&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e)||[];return{browser:t[1]||"",version:t[2]||"0"}},e.browser||(g=e.uaMatch(navigator.userAgent),h={},g.browser&&(h[g.browser]=!0,h.version=g.version),h.chrome?h.webkit=!0:h.webkit&&(h.safari=!0),e.browser=h),a(e,"browser",e.browser,"jQuery.browser is deprecated"),e.sub=function(){function t(e,n){return new t.fn.init(e,n)}e.extend(!0,t,this),t.superclass=this,t.fn=t.prototype=this(),t.fn.constructor=t,t.sub=this.sub,t.fn.init=function(r,a){return a&&a instanceof e&&!(a instanceof t)&&(a=t(a)),e.fn.init.call(this,r,a,n)},t.fn.init.prototype=t.fn;var n=t(document);return r("jQuery.sub() is deprecated"),t},e.ajaxSetup({converters:{"text json":e.parseJSON}});var b=e.fn.data;e.fn.data=function(t){var a,i,o=this[0];return!o||"events"!==t||1!==arguments.length||(a=e.data(o,t),i=e._data(o,t),a!==n&&a!==i||i===n)?b.apply(this,arguments):(r("Use of jQuery.fn.data('events') is deprecated"),i)};var j=/\/(java|ecma)script/i,w=e.fn.andSelf||e.fn.addBack;e.fn.andSelf=function(){return r("jQuery.fn.andSelf() replaced by jQuery.fn.addBack()"),w.apply(this,arguments)},e.clean||(e.clean=function(t,a,i,o){a=a||document,a=!a.nodeType&&a[0]||a,a=a.ownerDocument||a,r("jQuery.clean() is deprecated");var s,u,c,l,d=[];if(e.merge(d,e.buildFragment(t,a).childNodes),i)for(c=function(e){return!e.type||j.test(e.type)?o?o.push(e.parentNode?e.parentNode.removeChild(e):e):i.appendChild(e):n},s=0;null!=(u=d[s]);s++)e.nodeName(u,"script")&&c(u)||(i.appendChild(u),u.getElementsByTagName!==n&&(l=e.grep(e.merge([],u.getElementsByTagName("script")),c),d.splice.apply(d,[s+1,0].concat(l)),s+=l.length));return d});var Q=e.event.add,x=e.event.remove,k=e.event.trigger,N=e.fn.toggle,T=e.fn.live,M=e.fn.die,S="ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess",C=RegExp("\\b(?:"+S+")\\b"),H=/(?:^|\s)hover(\.\S+|)\b/,A=function(t){return"string"!=typeof t||e.event.special.hover?t:(H.test(t)&&r("'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'"),t&&t.replace(H,"mouseenter$1 mouseleave$1"))};e.event.props&&"attrChange"!==e.event.props[0]&&e.event.props.unshift("attrChange","attrName","relatedNode","srcElement"),e.event.dispatch&&a(e.event,"handle",e.event.dispatch,"jQuery.event.handle is undocumented and deprecated"),e.event.add=function(e,t,n,a,i){e!==document&&C.test(t)&&r("AJAX events should be attached to document: "+t),Q.call(this,e,A(t||""),n,a,i)},e.event.remove=function(e,t,n,r,a){x.call(this,e,A(t)||"",n,r,a)},e.fn.error=function(){var e=Array.prototype.slice.call(arguments,0);return r("jQuery.fn.error() is deprecated"),e.splice(0,0,"error"),arguments.length?this.bind.apply(this,e):(this.triggerHandler.apply(this,e),this)},e.fn.toggle=function(t,n){if(!e.isFunction(t)||!e.isFunction(n))return N.apply(this,arguments);r("jQuery.fn.toggle(handler, handler...) is deprecated");var a=arguments,i=t.guid||e.guid++,o=0,s=function(n){var r=(e._data(this,"lastToggle"+t.guid)||0)%o;return e._data(this,"lastToggle"+t.guid,r+1),n.preventDefault(),a[r].apply(this,arguments)||!1};for(s.guid=i;a.length>o;)a[o++].guid=i;return this.click(s)},e.fn.live=function(t,n,a){return r("jQuery.fn.live() is deprecated"),T?T.apply(this,arguments):(e(this.context).on(t,this.selector,n,a),this)},e.fn.die=function(t,n){return r("jQuery.fn.die() is deprecated"),M?M.apply(this,arguments):(e(this.context).off(t,this.selector||"**",n),this)},e.event.trigger=function(e,t,n,a){return n||C.test(e)||r("Global events are undocumented and deprecated"),k.call(this,e,t,n||document,a)},e.each(S.split("|"),function(t,n){e.event.special[n]={setup:function(){var t=this;return t!==document&&(e.event.add(document,n+"."+e.guid,function(){e.event.trigger(n,null,t,!0)}),e._data(this,n,e.guid++)),!1},teardown:function(){return this!==document&&e.event.remove(document,n+"."+e._data(this,n)),!1}}})}(jQuery,window);;
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing["jswing"]=jQuery.easing["swing"];jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(a,b,c,d,e){return jQuery.easing[jQuery.easing.def](a,b,c,d,e)},easeInQuad:function(a,b,c,d,e){return d*(b/=e)*b+c},easeOutQuad:function(a,b,c,d,e){return-d*(b/=e)*(b-2)+c},easeInOutQuad:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b+c;return-d/2*(--b*(b-2)-1)+c},easeInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},easeOutCubic:function(a,b,c,d,e){return d*((b=b/e-1)*b*b+1)+c},easeInOutCubic:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b+c;return d/2*((b-=2)*b*b+2)+c},easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c},easeOutQuart:function(a,b,c,d,e){return-d*((b=b/e-1)*b*b*b-1)+c},easeInOutQuart:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b+c;return-d/2*((b-=2)*b*b*b-2)+c},easeInQuint:function(a,b,c,d,e){return d*(b/=e)*b*b*b*b+c},easeOutQuint:function(a,b,c,d,e){return d*((b=b/e-1)*b*b*b*b+1)+c},easeInOutQuint:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b*b+c;return d/2*((b-=2)*b*b*b*b+2)+c},easeInSine:function(a,b,c,d,e){return-d*Math.cos(b/e*(Math.PI/2))+d+c},easeOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c},easeInOutSine:function(a,b,c,d,e){return-d/2*(Math.cos(Math.PI*b/e)-1)+c},easeInExpo:function(a,b,c,d,e){return b==0?c:d*Math.pow(2,10*(b/e-1))+c},easeOutExpo:function(a,b,c,d,e){return b==e?c+d:d*(-Math.pow(2,-10*b/e)+1)+c},easeInOutExpo:function(a,b,c,d,e){if(b==0)return c;if(b==e)return c+d;if((b/=e/2)<1)return d/2*Math.pow(2,10*(b-1))+c;return d/2*(-Math.pow(2,-10*--b)+2)+c},easeInCirc:function(a,b,c,d,e){return-d*(Math.sqrt(1-(b/=e)*b)-1)+c},easeOutCirc:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c},easeInOutCirc:function(a,b,c,d,e){if((b/=e/2)<1)return-d/2*(Math.sqrt(1-b*b)-1)+c;return d/2*(Math.sqrt(1-(b-=2)*b)+1)+c},easeInElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g))+c},easeOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*b)*Math.sin((b*e-f)*2*Math.PI/g)+d+c},easeInOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e/2)==2)return c+d;if(!g)g=e*.3*1.5;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);if(b<1)return-.5*h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+c;return h*Math.pow(2,-10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)*.5+d+c},easeInBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*(b/=e)*b*((f+1)*b-f)+c},easeOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*((b=b/e-1)*b*((f+1)*b+f)+1)+c},easeInOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;if((b/=e/2)<1)return d/2*b*b*(((f*=1.525)+1)*b-f)+c;return d/2*((b-=2)*b*(((f*=1.525)+1)*b+f)+2)+c},easeInBounce:function(a,b,c,d,e){return d-jQuery.easing.easeOutBounce(a,e-b,0,d,e)+c},easeOutBounce:function(a,b,c,d,e){if((b/=e)<1/2.75){return d*7.5625*b*b+c}else if(b<2/2.75){return d*(7.5625*(b-=1.5/2.75)*b+.75)+c}else if(b<2.5/2.75){return d*(7.5625*(b-=2.25/2.75)*b+.9375)+c}else{return d*(7.5625*(b-=2.625/2.75)*b+.984375)+c}},easeInOutBounce:function(a,b,c,d,e){if(b<e/2)return jQuery.easing.easeInBounce(a,b*2,0,d,e)*.5+c;return jQuery.easing.easeOutBounce(a,b*2-e,0,d,e)*.5+d*.5+c}})
/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */;
/*------------------------------------------------------------------------
 # MD Slider - March 18, 2013
 # ------------------------------------------------------------------------
 # Websites:  http://www.megadrupal.com -  Email: info@megadrupal.com
 --------------------------------------------------------------------------*/

(function ($) {
    var effectsIn = [
        'bounceIn',
        'bounceInDown',
        'bounceInUp',
        'bounceInLeft',
        'bounceInRight',
        'fadeIn',
        'fadeInUp',
        'fadeInDown',
        'fadeInLeft',
        'fadeInRight',
        'fadeInUpBig',
        'fadeInDownBig',
        'fadeInLeftBig',
        'fadeInRightBig',
        'flipInX',
        'flipInY',
        'foolishIn', //-
        'lightSpeedIn',
        'rollIn',
        'rotateIn',
        'rotateInDownLeft',
        'rotateInDownRight',
        'rotateInUpLeft',
        'rotateInUpRight',
        'twisterInDown', //-
        'twisterInUp', //-
        'swap', //-
        'swashIn',  //-
        'tinRightIn',  //-
        'tinLeftIn',  //-
        'tinUpIn',  //-
        'tinDownIn', //-
    ],
    effectsOut = [
        'bombRightOut',  //-
        'bombLeftOut', //-
        'bounceOut',
        'bounceOutDown',
        'bounceOutUp',
        'bounceOutLeft',
        'bounceOutRight',
        'fadeOut',
        'fadeOutUp',
        'fadeOutDown',
        'fadeOutLeft',
        'fadeOutRight',
        'fadeOutUpBig',
        'fadeOutDownBig',
        'fadeOutLeftBig',
        'fadeOutRightBig',
        'flipOutX',
        'flipOutY',
        'foolishOut', //-
        'hinge',
        'holeOut', //-
        'lightSpeedOut',
        'puffOut',  //-
        'rollOut',
        'rotateOut',
        'rotateOutDownLeft',
        'rotateOutDownRight',
        'rotateOutUpLeft',
        'rotateOutUpRight',
        'rotateDown', //-
        'rotateUp', //-
        'rotateLeft', //-
        'rotateRight', //-
        'swashOut', //-
        'tinRightOut', //-
        'tinLeftOut', //-
        'tinUpOut', //-
        'tinDownOut', //-
        'vanishOut' //-
    ];
    var e_in_length = effectsIn.length,
        e_out_length = effectsOut.length;
    var MDSlider = function ($element, options) {
        var defaults = {
            className: 'md-slide-wrap',
            itemClassName: 'md-slide-item',
            transitions: 'strip-down-left', // name of transition effect (fade, scrollLeft, scrollRight, scrollHorz, scrollUp, scrollDown, scrollVert)
            transitionsSpeed: 800, // speed of the transition (millisecond)
            width: 990, // responsive = false: this appear as container width; responsive = true: use for scale ;fullwidth = true: this is effect zone width
            height: 420, // container height
            responsive: true,
            fullwidth: true,
            styleBorder: 0, // Border style, from 1 - 9, 0 to disable
            styleShadow: 0, // Dropshadow style, from 1 - 5, 0 to disable
            posBullet: 2, // Bullet position, from 1 to 6, default is 5
            posThumb: 1, // Thumbnail position, from 1 to 5, default is 1
            stripCols: 20,
            stripRows: 10,
            slideShowDelay: 6000, // stop time for each slide item (millisecond)
            slideShow: true,
            loop: false,
            pauseOnHover: false,
            showLoading: true, // Show/hide loading bar
            loadingPosition: 'bottom', // choose your loading bar position (top, bottom)
            showArrow: true, // show/hide next, previous arrows
            showBullet: true,
            videoBox: false,
            showThumb: true, // Show thumbnail, if showBullet = true and showThumb = true, thumbnail will be shown when you hover bullet navigation
            enableDrag: true, // Enable mouse drag
            touchSensitive: 50,
            onEndTransition: function () {
            },	//this callback is invoked when the transition effect ends
            onStartTransition: function () {
            }	//this callback is invoked when the transition effect starts
        };
        this.slider = $element;
        this.options = $.extend({}, defaults, options);
        this.slideItems = [];
        this.activeIndex = -1;
        this.numItem = 0;
        this.lock = true;
        this.minThumbsLeft = 0;
        this.touchstart = false;
        this.thumbsDrag = false;
        this.slideShowDelay = 0;
        this.play = false;
        this.pause = false;
        this.step = 0;
    
        this.init();
    };
    
    MDSlider.prototype = {
        constructor: MDSlider,

        // init
        init: function() {
            var self = this;
            if ("ActiveXObject" in window)
                $(".md-item-opacity", this.slider).addClass("md-ieopacity");

            this.slider.addClass("loading-image");
            var slideClass = '';
            if (this.options.responsive)
                slideClass += ' md-slide-responsive';
            if (this.options.fullwidth)
                slideClass += ' md-slide-fullwidth';
            if (this.options.showBullet && this.options.posBullet)
                slideClass += ' md-slide-bullet-' + this.options.posBullet;
            if (!this.options.showBullet && this.options.showThumb && this.options.posThumb)
                slideClass += ' md-slide-thumb-' + this.options.posThumb;

            this.slider.wrap('<div class="' + this.options.className + slideClass + '"><div class="md-item-wrap"></div></div>');
            this.hoverDiv = this.slider.parent();
            this.wrap = this.hoverDiv.parent();
            this.slideWidth = this.options.responsive ? this.slider.width() : this.options.width;
            this.slideHeight = this.options.height;
            this.slideItems = [];
            this.hasTouch = this.documentHasTouch();
            if (this.hasTouch)
                this.wrap.addClass("md-touchdevice");
            //
            this.slider.find('.' + this.options.itemClassName).each(function (index) {
                self.numItem++;
                self.slideItems[index] = $(this);
                $(this).find(".md-object").each(function () {
                    var top = $(this).data("y") ? $(this).data("y") : 0,
                        left = $(this).data("x") ? $(this).data("x") : 0,
                        width = $(this).data("width") ? $(this).data("width") : 0,
                        height = $(this).data("height") ? $(this).data("height") : 0;
                    if (width > 0) {
                        $(this).width((width / self.options.width * 100) + "%");
                    }
                    if (height > 0) {
                        $(this).height((height / self.options.height * 100) + "%");
                    }
                    var css = {
                        top: (top / self.options.height * 100) + "%",
                        left: (left / self.options.width * 100) + "%"
                    };
                    $(this).css(css);
                });
                if (index > 0)
                    $(this).hide();
            });
            this.initControl();
            this.initDrag();
            if (this.options.slideShow) {
                this.play = true;
            }
            $('.md-object', this.slider).hide();
            if ($(".md-video", this.wrap).size() > 0) {
                if (this.options.videoBox) {
                    $(".md-video", this.wrap).mdvideobox({autoplayVideo: self.options.autoplayVideo});
                } else {
                    var videoCtrl = $('<div class="md-video-control" style="display: none"></div>');                    
                    this.wrap.append(videoCtrl);
                    $(".md-video", this.wrap).click(function () {
                        var video_ele = $("<iframe></iframe>");
                        video_ele.attr('allowFullScreen', '').attr('frameborder', '0').css({
                            width: "100%",
                            height: "100%",
                            background: "black"
                        });
                        if(self.options.autoplayVideo)
                            video_ele.attr("src", $(this).attr("href") + "?autoplay=1");
                        else
                            video_ele.attr("src", $(this).attr("href"));
                        var closeButton = $('<a href="#" class="md-close-video" title="Close video"></a>');
                        closeButton.click(function () {
                            videoCtrl.html("").hide();
                            self.play = true;
                            return false;
                        });
                        videoCtrl.html("").append(video_ele).append(closeButton).show();
                        
                        if(self.arrowButton){
                            videoCtrl.append('<div class="md-arrow"><div class="md-arrow-left"><span></span></div><div class="md-arrow-right"><span></span></div></div>');
                            $('.md-arrow-right', videoCtrl).bind('click', function () {
                                closeButton.trigger('click');
                                self.slideNext();
                            });
                            $('.md-arrow-left', videoCtrl).bind('click', function () {
                                closeButton.trigger('click');
                                self.slidePrev();
                            });
                        }
                        
                        self.play = false;
                        return false;
                    });
                }
            }
            $(window).resize(function () {
                self.resizeWindow();
            }).trigger("resize");
            this.preloadImages();
            this.removeLoader();

            // process when un-active tab
            var inActiveTime = false;
            $(window).blur(function () {
                inActiveTime = (new Date()).getTime();
            });
            $(window).focus(function () {
                if (inActiveTime) {
                    var duration = (new Date()).getTime() - inActiveTime;

                    if (duration > self.slideShowDelay - self.step)
                        self.step = self.slideShowDelay - 200;
                    else
                        self.step += duration;
                    inActiveTime = false;
                }
            });

            $(window).trigger('scroll');
        },

        initControl: function() {
            var self = this;
            // Loading bar
            if (this.options.slideShow && this.options.showLoading) {
                var loadingDiv = $('<div class="loading-bar-hoz loading-bar-' + this.options.loadingPosition + '"><div class="br-timer-glow" style="left: -100px;"></div><div class="br-timer-bar" style="width:0px"></div></div>');
                this.wrap.append(loadingDiv);
                this.loadingBar = $(".br-timer-bar", loadingDiv);
                this.timerGlow = $(".br-timer-glow", loadingDiv);
            }
            if (this.options.slideShow && this.options.pauseOnHover) {
                this.hoverDiv.hover(function () {
                    self.pause = true;
                }, function () {
                    self.pause = false;
                });
            }
            // Border
            if (this.options.styleBorder != 0) {
                var borderDivs = '<div class="border-top border-style-' + this.options.styleBorder + '"></div>';
                borderDivs += '<div class="border-bottom border-style-' + this.options.styleBorder + '"></div>';
                if (!this.options.fullwidth) {
                    borderDivs += '<div class="border-left border-style-' + this.options.styleBorder + '"><div class="edge-top"></div><div class="edge-bottom"></div></div>';
                    borderDivs += '<div class="border-right border-style-' + this.options.styleBorder + '"><div class="edge-top"></div><div class="edge-bottom"></div></div>';
                }
                this.wrap.append(borderDivs);
            }
            // Shadow
            if (this.options.styleShadow != 0) {
                var shadowDivs = '<div class="md-shadow md-shadow-style-' + this.options.styleShadow + '"></div>';
            }
            // Next, preview arrow
            if (this.options.showArrow) {
                this.arrowButton = $('<div class="md-arrow"><div class="md-arrow-left"><span></span></div><div class="md-arrow-right"><span></span></div></div>');
                this.hoverDiv.append(this.arrowButton);
                $('.md-arrow-right', this.arrowButton).bind('click', function () {
                    self.slideNext();
                });
                $('.md-arrow-left', this.arrowButton).bind('click', function () {
                    self.slidePrev();
                });
            }
            ;
            if (this.options.showBullet != false || this.options.showNavigationLinks != false) {
                this.buttons = $('<div class="md-bullets"></div>');
                if(this.options.showNavigationLinks){
                    this.buttons.addClass('md-navigation-links');
                }
                this.wrap.append(this.buttons);
                for (var i = 0; i < this.numItem; i++) {
                    var tagLink = '<a></a>';
                    if(this.options.showNavigationLinks){
                        tagLink = '<a href="#">' + this.slideItems[i].data("thumb-alt") + '</a>'
                    }
                    this.buttons.append('<div class="md-bullet"  rel="' + i + '">' + tagLink + '</div>');
                }
                ;
                if (this.options.showThumb) {
                    var thumbW = parseInt(this.slider.data("thumb-width")),
                        thumbH = parseInt(this.slider.data("thumb-height"));
                    for (var i = 0; i < this.numItem; i++) {
                        var thumbSrc = this.slideItems[i].data("thumb"),
                            thumbType = this.slideItems[i].data("thumb-type"),
                            thumbAlt = this.slideItems[i].data("thumb-alt");
                        if (thumbSrc) {
                            var thumb, thumbLeft;
                            if(this.options.showNavigationLinks){
                                var textLinkWidth =  $('div.md-bullet:eq(' + i + ')', this.buttons).outerWidth();
                                if(thumbW > textLinkWidth)
                                    thumbLeft = (thumbW + 6 - textLinkWidth) / 2;
                                else
                                    thumbLeft = 0;
                            } else
                                thumbLeft = thumbW / 2 - 2;
                            
                            if (thumbType == "image")
                                thumb = $('<img />').attr("src", thumbSrc).attr("alt", this.slideItems[i].data("thumb-alt")).css({
                                    top: -(9 + thumbH) + "px",
                                    left: -thumbLeft + "px",
                                    opacity: 0
                                })
                            else
                                thumb = $("<span></span>").attr("style", thumbSrc).css({
                                    top: -(9 + thumbH) + "px",
                                    left: -thumbLeft + "px",
                                    opacity: 0
                                });
                            $('div.md-bullet:eq(' + i + ')', this.buttons).append(thumb).append('<div class="md-thumb-arrow" style="opacity: 0"></div>');
                        }
                    }
                    $('div.md-bullet', this.buttons).hover(function () {
                        $(this).addClass('md_hover');
                        $("img, span", this).show().animate({'opacity': 1}, 200);
                        $('.md-thumb-arrow', this).show().animate({'opacity': 1}, 200);
                    }, function () {
                        $(this).removeClass('md_hover');
                        $('img, span', this).animate({'opacity': 0}, 200, function () {
                            $(this).hide();
                        });
                        $('.md-thumb-arrow', this).animate({'opacity': 0}, 200, function () {
                            $(this).hide();
                        });
                    });
                }
                $('div.md-bullet', this.wrap).click(function (event) {
                    event.preventDefault();
                    if (!$(this).hasClass('md-current')) {
                        var index = $(this).attr('rel');
                        self.slide(index);
                    }
                });
            } else if (this.options.showThumb) {
                var thumbDiv = $('<div class="md-thumb"><div class="md-thumb-container"><div class="md-thumb-items"></div></div></div>').appendTo(this.wrap);
                this.slideThumb = $(".md-thumb-items", thumbDiv);
                for (var i = 0; i < this.numItem; i++) {
                    var thumbSrc = this.slideItems[i].data("thumb"),
                        thumbType = this.slideItems[i].data("thumb-type"),
                        thumbAlt = this.slideItems[i].data("thumb-alt");

                    if (thumbSrc) {
                        var $link = $('<a class="md-thumb-item" />').attr("rel", i);
                        if (thumbType == "image")
                            $link.append($('<img />').attr("src", thumbSrc).attr("alt", this.slideItems[i].data("thumb-alt")))
                        else
                            $link.append($('<span />').attr("style", thumbSrc).css("display", "inline-block"));
                        this.slideThumb.append($link);
                    }
                }
                $("a", this.slideThumb).click(function () {
                    if ($(this).hasClass('md-current') || self.thumbsDrag) {
                        return false;
                    }
                    ;
                    var index = $(this).attr('rel');
                    self.slide(index);
                });
            }
        },

        initDrag: function() {
            var self = this;
            if (this.hasTouch) {
                this.slider.bind('touchstart', function (event) {
                    if (self.touchstart) return false;
                    event = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                    self.touchstart = true;
                    self.isScrolling = undefined;
                    self.slider.mouseY = event.pageY;
                    self.slider.mouseX = event.pageX;
                });
                this.slider.bind('touchmove', function (event) {
                    event = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                    if (self.touchstart) {
                        var pageX = (event.pageX || event.clientX);
                        var pageY = (event.pageY || event.clientY);

                        if (typeof self.isScrolling == 'undefined') {
                            self.isScrolling = !!( self.isScrolling || Math.abs(pageY - self.slider.mouseY) > Math.abs(pageX - self.slider.mouseX) )
                        }
                        if (self.isScrolling) {
                            self.touchstart = false;
                            return
                        } else {
                            self.mouseleft = pageX - self.slider.mouseX;
                            return false;
                        }
                    }
                    ;
                    return;
                });
                this.slider.bind('touchend', function (event) {
                    if (self.touchstart) {
                        self.touchstart = false;
                        if (self.mouseleft > self.options.touchSensitive) {
                            self.slidePrev();
                            self.mouseleft = 0;
                            return false;
                        } else if (self.mouseleft < -self.options.touchSensitive) {
                            self.slideNext();
                            self.mouseleft = 0;
                            return false;
                        }
                    }
                });
            } else {
                this.hoverDiv.hover(function () {
                    if (self.arrowButton) {
                        self.arrowButton.addClass('active');
                    }
                }, function () {
                    if (self.arrowButton) {
                        self.arrowButton.removeClass('active');
                    }
                });
                this.wrap.trigger("hover");
            }

            if (this.options.enableDrag) {
                this.slider.mousedown(function (event) {
                    if (!self.touchstart) {
                        self.touchstart = true;
                        self.isScrolling = undefined;
                        self.slider.mouseY = event.pageY;
                        self.slider.mouseX = event.pageX;
                    }
                    ;
                    return false;
                });
                this.slider.mousemove(function (event) {
                    if (self.touchstart) {
                        var pageX = (event.pageX || event.clientX);
                        var pageY = (event.pageY || event.clientY);

                        if (typeof self.isScrolling == 'undefined') {
                            self.isScrolling = !!( self.isScrolling || Math.abs(pageY - self.slider.mouseY) > Math.abs(pageX - self.slider.mouseX) )
                        }
                        if (this.isScrolling) {
                            self.touchstart = false;
                            return
                        } else {
                            self.mouseleft = pageX - self.slider.mouseX;
                            return false;
                        }
                    }
                    ;
                    return;
                });
                this.slider.mouseup(function (event) {
                    if (self.touchstart) {
                        self.touchstart = false;
                        if (self.mouseleft > self.options.touchSensitive) {
                            self.slidePrev();
                        } else if (self.mouseleft < -self.options.touchSensitive) {
                            self.slideNext();
                        }
                        self.mouseleft = 0;
                        return false;
                    }
                });
                this.slider.mouseleave(function (event) {
                    self.slider.mouseup();
                });
            }
            ;

        },

        resizeThumbDiv: function() {
            if (this.slideThumb) {
                this.slideThumb.unbind("touchstart");
                this.slideThumb.unbind("touchmove");
                this.slideThumb.unbind("touchmove");
                this.slideThumb.css("left", 0);
                var thumbsWidth = 0,
                    thumbDiv = this.slideThumb.parent().parent(),
                    self = this;

                $("a.md-thumb-item", this.slideThumb).each(function () {

                    if ($("img", $(this)).length > 0) {
                        if ($("img", $(this)).css("borderLeftWidth"))
                            thumbsWidth += parseInt($("img", $(this)).css("borderLeftWidth"), 10);
                        if ($("img", $(this)).css("borderRightWidth"))
                            thumbsWidth += parseInt($("img", $(this)).css("borderRightWidth"), 10);
                        if ($("img", $(this)).css("marginLeft"))
                            thumbsWidth += parseInt($("img", $(this)).css("marginLeft"), 10);
                        if ($("img", $(this)).css("marginRight"))
                            thumbsWidth += parseInt($("img", $(this)).css("marginRight"), 10);

                    }
                    else {
                        if ($("span", $(this)).css("borderLeftWidth"))
                            thumbsWidth += parseInt($("span", $(this)).css("borderLeftWidth"), 10);
                        if ($("span", $(this)).css("borderRightWidth"))
                            thumbsWidth += parseInt($("span", $(this)).css("borderRightWidth"), 10);
                        if ($("span", $(this)).css("marginLeft"))
                            thumbsWidth += parseInt($("span", $(this)).css("marginLeft"), 10);
                        if ($("span", $(this)).css("marginRight"))
                            thumbsWidth += parseInt($("span", $(this)).css("marginRight"), 10);
                    }

                    if ($(this).css("borderLeftWidth"))
                        thumbsWidth += parseInt($(this).css("borderLeftWidth"), 10);
                    if ($(this).css("borderRightWidth"))
                        thumbsWidth += parseInt($(this).css("borderRightWidth"), 10);
                    if ($(this).css("marginLeft"))
                        thumbsWidth += parseInt($(this).css("marginLeft"), 10);
                    if ($(this).css("marginRight"))
                        thumbsWidth += parseInt($(this).css("marginRight"), 10);

                    thumbsWidth += parseInt(self.slider.data("thumb-width"));
                });

                $(".md-thumb-next", thumbDiv).remove();
                $(".md-thumb-prev", thumbDiv).remove();
                if (thumbsWidth > $(".md-thumb-container", thumbDiv).width()) {
                    this.minThumbsLeft = $(".md-thumb-container", thumbDiv).width() - thumbsWidth;
                    this.slideThumb.width(thumbsWidth);
                    thumbDiv.append('<div class="md-thumb-prev"></div><div class="md-thumb-next"></div>');
                    $(".md-thumb-prev", thumbDiv).click(function () {
                        self.scollThumb("right");
                    });
                    $(".md-thumb-next", thumbDiv).click(function () {
                        self.scollThumb("left");
                    });

                    this.checkThumbArrow();
                    if (this.hasTouch) {
                        this.thumbsDrag = true;

                        var thumbTouch, thumbLeft;
                        this.slideThumb.bind('touchstart', function (event) {
                            event = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                            thumbTouch = true;
                            this.mouseX = event.pageX;
                            thumbLeft = self.slideThumb.position().left;
                            return false;
                        });
                        this.slideThumb.bind('touchmove', function (event) {
                            event.preventDefault();
                            event = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                            if (thumbTouch) {
                                self.slideThumb.css("left", thumbLeft + event.pageX - this.mouseX);
                            }
                            ;
                            return false;
                        });
                        this.slideThumb.bind('touchend', function (event) {
                            event.preventDefault();
                            event = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                            thumbTouch = false;
                            if (Math.abs(event.pageX - this.mouseX) < self.options.touchSensitive) {
                                var item = $(event.target).closest('a.md-thumb-item');
                                if (item.length) {
                                    self.slide(item.attr('rel'));
                                }
                                self.slideThumb.stop(true, true).animate({left: thumbLeft}, 400);
                                return false;
                            }
                            if (self.slideThumb.position().left < self.minThumbsLeft) {
                                self.slideThumb.stop(true, true).animate({left: self.minThumbsLeft}, 400, function () {
                                    self.checkThumbArrow()
                                });
                            } else if (self.slideThumb.position().left > 0) {
                                self.slideThumb.stop(true, true).animate({left: 0}, 400, function () {
                                    self.checkThumbArrow()
                                });
                            }
                            thumbLeft = 0;
                            return false;
                        });
                    }
                }
            }
        },

        scollThumb: function(position) {
            var self = this;
            if (this.slideThumb) {
                if (position == "left") {
                    var thumbLeft = this.slideThumb.position().left;
                    if (thumbLeft > this.minThumbsLeft) {
                        var containerWidth = $(".md-thumb-container", this.wrap).width();
                        if ((thumbLeft - containerWidth) > this.minThumbsLeft) {
                            this.slideThumb.stop(true, true).animate({left: thumbLeft - containerWidth}, 400, function () {
                                self.checkThumbArrow()
                            });
                        } else {
                            this.slideThumb.stop(true, true).animate({left: this.minThumbsLeft}, 400, function () {
                                self.checkThumbArrow()
                            });
                        }
                    }
                } else if (position == "right") {
                    var thumbLeft = this.slideThumb.position().left;
                    if (thumbLeft < 0) {
                        var containerWidth = $(".md-thumb-container", this.wrap).width();
                        if ((thumbLeft + containerWidth) < 0) {
                            this.slideThumb.stop(true, true).animate({left: thumbLeft + containerWidth}, 400, function () {
                                self.checkThumbArrow()
                            });
                        } else {
                            this.slideThumb.stop(true, true).animate({left: 0}, 400, function () {
                                self.checkThumbArrow()
                            });
                        }
                    }
                } else {
                    var thumbCurrent = $("a", this.slideThumb).index($("a.md-current", this.slideThumb));
                    if (thumbCurrent >= 0) {
                        var thumbLeft = this.slideThumb.position().left;
                        var currentLeft = thumbCurrent * $("a", this.slideThumb).width();
                        if (currentLeft + thumbLeft < 0) {
                            this.slideThumb.stop(true, true).animate({left: -currentLeft}, 400, function () {
                                self.checkThumbArrow()
                            });
                        } else {
                            var currentRight = currentLeft + $("a", this.slideThumb).width();
                            var containerWidth = $(".md-thumb-container", this.wrap).width();
                            if (currentRight + thumbLeft > containerWidth) {
                                this.slideThumb.stop(true, true).animate({left: containerWidth - currentRight}, 400, function () {
                                    self.checkThumbArrow()
                                });
                            }
                        }
                    }
                }
            }
        },

        checkThumbArrow: function() {
            var thumbLeft = this.slideThumb.position().left;
            if (thumbLeft > this.minThumbsLeft) {
                $(".md-thumb-next", this.wrap).show();
            } else {
                $(".md-thumb-next", this.wrap).hide();
            }
            if (thumbLeft < 0) {
                $(".md-thumb-prev", this.wrap).show();
            } else {
                $(".md-thumb-prev", this.wrap).hide();
            }
        },

        slide: function(index) {
            this.step = 0;
            this.slideShowDelay = this.slideItems[index].data("timeout") ? this.slideItems[index].data("timeout") : this.options.slideShowDelay;
            if (this.loadingBar) {
                var width = this.step * this.slideWidth / this.slideShowDelay;
                this.loadingBar.width(width);
                this.timerGlow.css({left: width - 100 + 'px'});
            }
            this.oIndex = this.activeIndex;
            this.activeIndex = parseInt(index);
            this.options.onStartTransition.call(this.slider);
            var execeptItemClass = '.slide-' + (this.activeIndex+1) + ', .slide-' + (this.oIndex+1);
            $('.md-slide-item:not(' + execeptItemClass +')', this.wrap).hide();
            
            if (this.slideItems[this.oIndex]) {
                $('div.md-bullet:eq(' + this.oIndex + ')', this.buttons).removeClass('md-current');
                $('a:eq(' + this.oIndex + ')', this.slideThumb).removeClass('md-current');
                this.removeTheCaptions(this.slideItems[this.oIndex]);
                var fx = this.options.transitions;
                
                //Generate random transition
                if (this.options.transitions.toLowerCase() == 'random') {
                    var transitions = new Array(
                        'slit-horizontal-left-top',
                        'slit-horizontal-top-right',
                        'slit-horizontal-bottom-up',
                        'slit-vertical-down',
                        'slit-vertical-up',
                        'strip-up-right',
                        'strip-up-left',
                        'strip-down-right',
                        'strip-down-left',
                        'strip-left-up',
                        'strip-left-down',
                        'strip-right-up',
                        'strip-right-down',
                        'strip-right-left-up',
                        'strip-right-left-down',
                        'strip-up-down-right',
                        'strip-up-down-left',
                        'left-curtain',
                        'right-curtain',
                        'top-curtain',
                        'bottom-curtain',
                        'slide-in-right',
                        'slide-in-left',
                        'slide-in-up',
                        'slide-in-down',
                        'fade');
                    fx = transitions[Math.floor(Math.random() * (transitions.length + 1))];
                    if (fx == undefined) fx = 'fade';
                    fx = $.trim(fx.toLowerCase());
                }

                //Run random transition from specified set (eg: effect:'strip-left-fade,right-curtain')
                if (this.options.transitions.indexOf(',') != -1) {
                    var transitions = this.options.transitions.split(',');
                    fx = transitions[Math.floor(Math.random() * (transitions.length))];
                    if (fx == undefined) fx = 'fade';
                    fx = $.trim(fx.toLowerCase());
                }

                //Custom transition as defined by "data-transition" attribute
                if (this.slideItems[this.activeIndex].data('transition')) {
                    var transitions = this.slideItems[this.activeIndex].data('transition').split(',');
                    fx = transitions[Math.floor(Math.random() * (transitions.length))];
                    fx = $.trim(fx.toLowerCase());
                }
                if (!(this.support = Modernizr.csstransitions && Modernizr.csstransforms3d) && (fx == 'slit-horizontal-left-top' || fx == 'slit-horizontal-top-right' || fx == 'slit-horizontal-bottom-up' || fx == 'slit-vertical-down' || fx == 'slit-vertical-up')) {
                    fx = 'fade';
                }
                this.lock = true;
                this.runTransition(fx);
                if (this.buttons)
                    $('div.md-bullet:eq(' + this.activeIndex + ')', this.buttons).addClass('md-current');
                if (this.slideThumb)
                    $('a:eq(' + this.activeIndex + ')', this.slideThumb).addClass('md-current');
                this.scollThumb();
                if(this.options.autoplayVideo){
                    $('.md-video', this.slideItems[this.activeIndex]).trigger('click');
                }
            } 
            else {
                this.slideItems[this.activeIndex].css({top: 0, left: 0}).show().find('video[autoplay]').load(); 
                if(this.options.autoplayVideo){
                    $('.md-video', this.slideItems[this.activeIndex]).trigger('click');
                }
                this.animateTheCaptions(this.slideItems[index]);
                if (this.buttons)
                    $('div.md-bullet:eq(' + this.activeIndex + ')', this.buttons).addClass('md-current');
                if (this.slideThumb)
                    $('a:eq(' + this.activeIndex + ')', this.slideThumb).addClass('md-current');
                this.scollThumb();
                this.lock = false;
            }
        },

        setTimer: function() {
            this.slide(0); 
            var mdslide = this;
            
            this.timer = setInterval(function(){
                if (mdslide.lock) return false;
                if (mdslide.play && !mdslide.pause) {
                    mdslide.step += 40;
                    if (mdslide.step > mdslide.slideShowDelay) {
                        mdslide.slideNext();
                    } else if (mdslide.loadingBar) {
                        var width = mdslide.step * mdslide.slideWidth / mdslide.slideShowDelay;
                        mdslide.loadingBar.width(width);
                        mdslide.timerGlow.css({left: width - 100 + 'px'});
                    }
                }
            }, 40);
        },

        slideNext: function() {
            if (this.lock) return false;
            var index = this.activeIndex;
            index++;
            if (index >= this.numItem && this.options.loop) {
                index = 0;
                this.slide(index);
            } else if (index < this.numItem) {
                this.slide(index);
            }
        },

        slidePrev: function() {
            if (this.lock) return false;
            var index = this.activeIndex;
            index--;
            if (index < 0 && this.options.loop) {
                index = this.numItem - 1;
                this.slide(index);
            }
            else if (index >= 0) {
                this.slide(index);
            }
        },

        endMoveCaption: function(caption) {
            var easeout = (caption.data("easeout")) ? caption.data("easeout") : "",
                ieVersion = (!!window.ActiveXObject && +(/msie\s(\d+)/i.exec(navigator.userAgent)[1])) || NaN;

            if (ieVersion != NaN)
                ieVersion = 11;
            else
                ieVersion = parseInt(ieVersion);

            clearTimeout(caption.data('timer-start'));
            if (easeout != "" && easeout != "keep" && ieVersion <= 9)
                caption.fadeOut();
            else {
                caption.removeClass(effectsIn.join(' '));
                if (easeout != "") {
                    if (easeout == "random")
                        easeout = effectsOut[Math.floor(Math.random() * e_out_length)];
                    caption.addClass(easeout);
                }
                else
                    caption.hide();
            }
        },

        removeTheCaptions: function(oItem) {
            oItem.find(".md-object").each(function () {
                var caption = $(this),
                    easeout = (caption.data("easeout")) ? caption.data("easeout") : "";
                if(easeout != 'keep'){
                    caption.stop(true, true).hide(); 
                }
                clearTimeout(caption.data('timer-start'));
                clearTimeout(caption.data('timer-stop'));
            });
        },

        animateTheCaptions: function(nextItem) {
            var self = this;
            $(".md-object", nextItem).each(function (boxIndex) {
                var caption = $(this);
                if (caption.data("easeout"))
                    caption.removeClass(effectsOut.join(' '));
                var easein = caption.data("easein") ? caption.data("easein") : "",
                    ieVersion = (!!window.ActiveXObject && +(/msie\s(\d+)/i.exec(navigator.userAgent)[1])) || NaN;

                if (ieVersion != NaN)
                    ieVersion = 11;
                else
                    ieVersion = parseInt(ieVersion);

                if (easein == "random")
                    easein = effectsIn[Math.floor(Math.random() * e_in_length)];

                caption.removeClass(effectsIn.join(' '));
                caption.hide();
                if (caption.data("start") != undefined) {
                    caption.data('timer-start', setTimeout(function () {
                        if (easein != "" && ieVersion <= 9)
                            caption.fadeIn();
                        else
                            caption.show().addClass(easein);
                    }, caption.data("start")));
                }
                else
                    caption.show().addClass(easein);

                if (caption.data("stop") != undefined) {
                    caption.data('timer-stop', setTimeout(function () {
                        self.endMoveCaption(caption);
                    }, caption.data('stop')));
                }
            });
        },

        //When Animation finishes
        transitionEnd: function() {
            this.options.onEndTransition.call(this.slider);
            $('.md-strips-container', this.slider).remove();
            this.slideItems[this.oIndex].hide();
            this.slideItems[this.activeIndex].show().find('video[autoplay]').load();
            this.lock = false;
            this.animateTheCaptions(this.slideItems[this.activeIndex]);
        },
        // remove loader
        removeLoader: function() {
            $('.wrap-loader-slider').addClass('fadeOut');
            $('.md-slide-items').css('min-height','');
        },
        
        // Add strips
        addStrips: function(vertical, opts) {
            var strip,
                opts = (opts) ? opts : options,
                stripsContainer = $('<div class="md-strips-container"></div>'),
                stripWidth = Math.round(this.slideWidth / opts.strips),
                stripHeight = Math.round(this.slideHeight / opts.strips),
                $image = $(".md-mainimg img", this.slideItems[this.activeIndex]),
                $overlay = $('.md-slider-overlay', this.slideItems[this.activeIndex]);
            if ($overlay.length) {
                var $temp = $('<div class="md-slider-overlay"></div>');
                $temp.css({
                    'background-color' : $overlay.css('background-color')
                });
                stripsContainer.append ($temp);
            }
            if ($image.length == 0)
                $image = $(".md-mainimg", this.slideItems[this.activeIndex]);
            for (var i = 0; i < opts.strips; i++) {
                var top = ((vertical) ? (stripHeight * i) + 'px' : '0px'),
                    left = ((vertical) ? '0px' : (stripWidth * i) + 'px'),
                    width, height;

                if (i == opts.strips - 1) {
                    width = ((vertical) ? '0px' : (this.slideWidth - (stripWidth * i)) + 'px'),
                        height = ((vertical) ? (this.slideHeight - (stripHeight * i)) + 'px' : '0px');
                } else {
                    width = ((vertical) ? '0px' : stripWidth + 'px'),
                        height = ((vertical) ? stripHeight + 'px' : '0px');
                }

                strip = $('<div class="mdslider-strip"></div>').css({
                    width: width,
                    height: height,
                    top: top,
                    left: left,
                    opacity: 0
                }).append($image.clone().css({
                    marginLeft: vertical ? 0 : -(i * stripWidth) + "px",
                    marginTop: vertical ? -(i * stripHeight) + "px" : 0
                }));
                stripsContainer.append(strip);
            }
            this.slider.append(stripsContainer);
        },

        // Add strips
        addTiles: function(x, y, index) {
            var tile;
            var stripsContainer = $('<div class="md-strips-container"></div>');
            var tileWidth = this.slideWidth / x,
                tileHeight = this.slideHeight / y,
                $image = $(".md-mainimg img", this.slideItems[index]),
                $overlay = $('.md-slider-overlay', this.slideItems[index]),
                specialHeight = 0,
                specialWidth = 0;
            if ($overlay.length) {
                var $temp = $('<div class="md-slider-overlay"></div>');
                $temp.css({
                    'background-color' : $overlay.css('background-color')
                });
                stripsContainer.append ($temp);
            }
            if ($image.length == 0)
                $image = $(".md-mainimg", this.slideItems[index]);
            
            // fix make round width height
            if(x > 1){
                var titleWidthRound = Math.round(tileWidth);
                specialWidth = titleWidthRound - tileWidth;
                tileWidth = titleWidthRound;
            }else if(y > 1){
                var titleHeightRound = Math.round(tileHeight);
                specialHeight = titleHeightRound - tileHeight;
                tileHeight = titleHeightRound;
            }

            for (var i = 0; i < y; i++) {
                for (var j = 0; j < x; j++) {
                    var top = (tileHeight * i) + 'px',
                        left = (tileWidth * j) + 'px';
                
                    // fix increase / decrease with/height in last col / last row
                    if(x > 1 && specialWidth && j === (x-1)){
                        var titleWidthNew = tileWidth - x * specialWidth;
                        left = (x-1)*tileWidth + 'px';
                        tileWidth = titleWidthNew;
                    }
                    else if(y > 1 && specialHeight && i == (y-1)){
                        var titleHeightNew = tileHeight - y * specialHeight;
                        top = (y-1)*tileHeight + 'px';
                        tileHeight = titleHeightNew;
                    }
                    
                    tile = $('<div class="mdslider-tile"/>').css({
                        width: tileWidth,
                        height: tileHeight,
                        top: top,
                        left: left
                    }).append($image.clone().css({
                        marginLeft: "-" + left,
                        marginTop: "-" + top
                    }));
                    stripsContainer.append(tile);
                }
            }

            this.slider.append(stripsContainer);
        },

        // Add strips
        addStrips2: function() {
            var strip,
                images = [],
                stripsContainer = $('<div class="md-strips-container"></div>'),
                $overlay = $('.md-slider-overlay', this.slideItems[this.activeIndex]);
            if ($overlay.length) {
                var $temp = $('<div class="md-slider-overlay"></div>');
                $temp.css({
                    'background-color' : $overlay.css('background-color')
                });
                stripsContainer.append ($temp);
            }
            
            // get all content of old slide to strip
            images.push(this.slideItems[this.oIndex].children());            
            // get content of next slide to strip
            if ($(".md-mainimg img", this.slideItems[this.activeIndex]).length > 0)
                images.push($(".md-mainimg img", this.slideItems[this.activeIndex]));
            else
                images.push($(".md-mainimg", this.slideItems[this.activeIndex]));

            for (var i = 0; i < 2; i++) {
                var cloneHtml = images[i].clone();
                if(i == 0){
                    $('.md-object', cloneHtml).removeClass(effectsIn.join(" "));
                }
                strip = $('<div class="mdslider-strip"></div>').css({
                    width: this.slideWidth,
                    height: this.slideHeight
                }).append(cloneHtml);
                stripsContainer.append(strip);
            }
            this.slider.append(stripsContainer);
        },

        // Add strips
        addSlits: function(fx) {
            var $stripsContainer = $('<div class="md-strips-container ' + fx + '"></div>'),
                $image = ($(".md-mainimg img", this.slideItems[this.oIndex]).length > 0) ? $(".md-mainimg img", this.slideItems[this.oIndex]) : $(".md-mainimg", this.slideItems[this.oIndex]),
                $div1 = $('<div class="mdslider-slit"/>').append($image.clone()),
                $div2 = $('<div class="mdslider-slit"/>'),
                position = $image.position(),
                $overlay = $('.md-slider-overlay', this.slideItems[this.activeIndex]);
            if ($overlay.length) {
                var $temp = $('<div class="md-slider-overlay"></div>');
                $temp.css({
                    'background-color' : $overlay.css('background-color')
                });
                $stripsContainer.append ($temp);
            }

            $div2.append($image.clone().css("top", position.top - (this.slideHeight / 2) + "px"));
            if (fx == "slit-vertical-down" || fx == "slit-vertical-up")
                $div2 = $('<div class="mdslider-slit"/>').append($image.clone().css("left", position.left - (this.slideWidth / 2) + "px"));

            $stripsContainer.append($div1).append($div2);
            this.slider.append($stripsContainer);
        },

        runTransition: function(fx) {
            var self = this;
            switch (fx) {
                case 'slit-horizontal-left-top':
                case 'slit-horizontal-top-right':
                case 'slit-horizontal-bottom-up':
                case 'slit-vertical-down':
                case 'slit-vertical-up':
                    this.addSlits(fx);
                    $(".md-object", this.slideItems[this.activeIndex]).hide();
                    this.slideItems[this.oIndex].hide();
                    this.slideItems[this.activeIndex].show();
                    var slice1 = $('.mdslider-slit', this.slider).first(),
                        slice2 = $('.mdslider-slit', this.slider).last();
                    var transitionProp = {
                        'transition': 'all ' + this.options.transitionsSpeed + 'ms ease-in-out',
                        '-webkit-transition': 'all ' + this.options.transitionsSpeed + 'ms ease-in-out',
                        '-moz-transition': 'all ' + this.options.transitionsSpeed + 'ms ease-in-out',
                        '-ms-transition': 'all ' + this.options.transitionsSpeed + 'ms ease-in-out'
                    };
                    $('.mdslider-slit', this.slider).css(transitionProp);
                    setTimeout(function () {
                        slice1.addClass("md-trans-elems-1");
                        slice2.addClass("md-trans-elems-2");
                    }, 50);
                    setTimeout(function () {
                        self.options.onEndTransition.call(self.slider);
                        $('.md-strips-container', self.slider).remove();
                        self.lock = false;
                        self.animateTheCaptions(self.slideItems[self.activeIndex]);
                    }, self.options.transitionsSpeed);
                    break;
                case 'strip-up-right':
                case 'strip-up-left':
                    this.addTiles(this.options.stripCols, 1, this.activeIndex);
                    var strips = $('.mdslider-tile', this.slider),
                        timeStep = this.options.transitionsSpeed / this.options.stripCols / 2,
                        speed = this.options.transitionsSpeed / 2;
                    if (fx == 'strip-up-right') strips = $('.mdslider-tile', this.slider).reverse();
                    strips.css({
                        height: '1px',
                        bottom: '0px',
                        top: "auto"
                    });
                    strips.each(function (i) {
                        var strip = $(this);
                        setTimeout(function () {
                            strip.animate({
                                height: '100%',
                                opacity: '1.0'
                            }, speed, 'easeInOutQuart', function () {
                                if (i == self.options.stripCols - 1) self.transitionEnd();
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-down-right':
                case 'strip-down-left':
                    this.addTiles(this.options.stripCols, 1, this.activeIndex);
                    var strips = $('.mdslider-tile', this.slider),
                        timeStep = this.options.transitionsSpeed / this.options.stripCols / 2,
                        speed = this.options.transitionsSpeed / 2;
                    if (fx == 'strip-down-right') strips = $('.mdslider-tile', this.slider).reverse();
                    strips.css({
                        height: '1px',
                        top: '0px',
                        bottom: "auto"
                    });
                    strips.each(function (i) {
                        var strip = $(this);
                        setTimeout(function () {
                            strip.animate({
                                height: '100%',
                                opacity: '1.0'
                            }, speed, 'easeInOutQuart', function () {
                                if (i == self.options.stripCols - 1) self.transitionEnd();
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-left-up':
                case 'strip-left-down':
                    this.addTiles(1, this.options.stripRows, this.activeIndex);
                    var strips = $('.mdslider-tile', this.slider),
                        timeStep = this.options.transitionsSpeed / this.options.stripRows / 2,
                        speed = this.options.transitionsSpeed / 2;
                    if (fx == 'strip-left-up') strips = $('.mdslider-tile', this.slider).reverse();
                    strips.css({
                        width: '1px',
                        left: '0px',
                        right: "auto"
                    });
                    strips.each(function (i) {
                        var strip = $(this);
                        setTimeout(function () {
                            strip.animate({
                                width: '100%',
                                opacity: '1.0'
                            }, speed, 'easeInOutQuart', function () {
                                if (i == self.options.stripRows - 1) self.transitionEnd();
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-right-up':
                case 'strip-right-down':
                    this.addTiles(1, this.options.stripRows, this.activeIndex);
                    var strips = $('.mdslider-tile', this.slider),
                        timeStep = this.options.transitionsSpeed / this.options.stripRows / 2,
                        speed = this.options.transitionsSpeed / 2;
                    if (fx == 'strip-left-right-up') strips = $('.mdslider-tile', this.slider).reverse();
                    strips.css({
                        width: '1px',
                        left: 'auto',
                        right: "1px"
                    });
                    strips.each(function (i) {
                        var strip = $(this);
                        setTimeout(function () {
                            strip.animate({
                                width: '100%',
                                opacity: '1.0'
                            }, speed, 'easeInOutQuart', function () {
                                if (i == self.options.stripRows - 1) self.transitionEnd();
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-right-left-up':
                case 'strip-right-left-down':
                    this.addTiles(1, this.options.stripRows, this.oIndex);
                    this.slideItems[this.oIndex].hide();
                    this.slideItems[this.activeIndex].show();
                    var strips = $('.mdslider-tile', this.slider),
                        timeStep = this.options.transitionsSpeed / this.options.stripRows,
                        speed = this.options.transitionsSpeed / 2;
                    if (fx == 'strip-right-left-up') strips = $('.mdslider-tile', this.slider).reverse();
                    strips.filter(':odd').css({
                        width: '100%',
                        right: '0px',
                        left: "auto",
                        opacity: 1
                    }).end().filter(':even').css({
                        width: '100%',
                        right: 'auto',
                        left: "0px",
                        opacity: 1
                    });
                    ;
                    strips.each(function (i) {
                        var strip = $(this);
                        var css = (i % 2 == 0) ? {
                            left: '-50%',
                            opacity: '0'
                        } : {right: '-50%', opacity: '0'};
                        setTimeout(function () {
                            strip.animate(css, speed, 'easeOutQuint', function () {
                                if (i == self.options.stripRows - 1) {
                                    self.options.onEndTransition.call(self.slider);
                                    $('.md-strips-container', self.slider).remove();
                                    self.lock = false;
                                    self.animateTheCaptions(self.slideItems[self.activeIndex]);
                                }
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-up-down-right':
                case 'strip-up-down-left':
                    this.addTiles(this.options.stripCols, 1, this.oIndex);
                    this.slideItems[this.oIndex].hide();
                    this.slideItems[this.activeIndex].show();
                    var strips = $('.mdslider-tile', this.slider),
                        timeStep = this.options.transitionsSpeed / this.options.stripCols / 2,
                        speed = this.options.transitionsSpeed / 2;
                    if (fx == 'strip-up-down-right') strips = $('.mdslider-tile', this.slider).reverse();
                    strips.filter(':odd').css({
                        height: '100%',
                        bottom: '0px',
                        top: "auto",
                        opacity: 1
                    }).end().filter(':even').css({
                        height: '100%',
                        bottom: 'auto',
                        top: "0px",
                        opacity: 1
                    });
                    ;
                    strips.each(function (i) {
                        var strip = $(this);
                        var css = (i % 2 == 0) ? {
                            top: '-50%',
                            opacity: 0
                        } : {bottom: '-50%', opacity: 0};
                        setTimeout(function () {
                            strip.animate(css, speed, 'easeOutQuint', function () {
                                if (i == self.options.stripCols - 1) {
                                    self.options.onEndTransition.call(self.slider);
                                    $('.md-strips-container', self.slider).remove();
                                    self.lock = false;
                                    self.animateTheCaptions(self.slideItems[self.activeIndex]);
                                }
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'left-curtain':
                    this.addTiles(this.options.stripCols, 1, this.activeIndex);
                    var strips = $('.mdslider-tile', this.slider),
                        stripItemWidth = this.getWidthStripItem(),
                        _self = this,
                        timeStep = this.options.transitionsSpeed / this.options.stripCols / 2;
                    strips.each(function (i) {
                        var strip = $(this);
                        var width = (i == _self.options.stripCols - 1) ? stripItemWidth.last : stripItemWidth.normal,
                            left = (i == _self.options.stripCols - 1) ? (_self.width - stripItemWidth.last) : (width * i);
                        strip.css({left: left, width: 0, opacity: 0});
                        setTimeout(function () {
                            strip.animate({
                                width: width,
                                opacity: '1.0'
                            }, self.options.transitionsSpeed / 2, function () {
                                if (i == self.options.stripCols - 1) self.transitionEnd();
                            });
                        }, timeStep * i);
                    });
                    break;
                case 'right-curtain':
                    this.addTiles(this.options.stripCols, 1, this.activeIndex);
                    var strips = $('.mdslider-tile', this.slider).reverse(),
                        stripItemWidth = this.getWidthStripItem(),
                        _self = this,
                        timeStep = this.options.transitionsSpeed / this.options.stripCols / 2;
                    //right-curtain neu de item cuoi cung co width la last thi js transition se chuyen cai last nay thanh first va gay loi
                    //vay nen ta lam nguoc lai, cho item first chua width last
                    strips.each(function (i) {
                        var strip = $(this);
                        var width = (i == 0) ? stripItemWidth.last : stripItemWidth.normal,
                            right = i ? ((width * (i -1)) + stripItemWidth.last) : 0;
                        strip.css({
                            right: right,
                            left: "auto",
                            width: 0,
                            opacity: 0
                        });
                        setTimeout(function () {
                            strip.animate({
                                width: width,
                                opacity: '1.0'
                            }, self.options.transitionsSpeed / 2, function () {
                                if (i == self.options.stripCols - 1) self.transitionEnd();
                            });
                        }, timeStep * i);
                    });
                    break;
                case 'top-curtain':
                    this.addTiles(1, this.options.stripRows, this.activeIndex);
                    var strips = $('.mdslider-tile', this.slider),
                        stripItemHeight = this.getHeightStripItem(),
                        _self = this,
                        timeStep = this.options.transitionsSpeed / this.options.stripRows / 2;
                    strips.each(function (i) {
                        var strip = $(this);
                        var height = (i == _self.options.stripRows - 1) ? stripItemHeight.last : stripItemHeight.normal,
                            top = (i == _self.options.stripRows - 1) ? (_self.height - stripItemHeight.last) : (height * i);
                        strip.css({top: top, height: 0, opacity: 0});
                        setTimeout(function () {
                            strip.animate({
                                height: height,
                                opacity: '1.0'
                            }, self.options.transitionsSpeed / 2, function () {
                                if (i == self.options.stripRows - 1) self.transitionEnd();
                            });
                        }, timeStep * i);
                    });
                    break;
                case 'bottom-curtain':
                    this.addTiles(1, this.options.stripRows, this.activeIndex);
                    var strips = $('.mdslider-tile', this.slider).reverse(),
                        stripItemHeight = this.getHeightStripItem(),
                        _self = this,
                        timeStep = this.options.transitionsSpeed / this.options.stripRows / 2;
                    //bottom-curtain neu de item cuoi cung co height la last thi js transition se chuyen cai last nay thanh first va gay loi
                    //vay nen ta lam nguoc lai, cho item first chua height last
                    strips.each(function (i) {
                        var strip = $(this);
                        var height = (i == 0) ? stripItemHeight.last : stripItemHeight.normal,
                            bottom = i ? ((height * (i -1)) + stripItemHeight.last) : 0;
                        strip.css({bottom: bottom, height: 0, opacity: 0});
                        setTimeout(function () {
                            strip.animate({
                                height: height,
                                opacity: '1.0'
                            }, self.options.transitionsSpeed / 2, function () {
                                if (i == self.options.stripRows - 1) self.transitionEnd();
                            });
                        }, timeStep * i);
                    });
                    break;
                case 'slide-in-right':
                    var i = 0;
                    this.addStrips2();
                    var strips = $('.mdslider-strip', this.slider);
                    strips.each(function () {
                        strip = $(this);
                        var left = i * self.slideWidth;
                        strip.css({
                            left: left
                        });
                        strip.animate({
                            left: left - self.slideWidth
                        }, self.options.transitionsSpeed, function () {
                            self.transitionEnd();
                        });
                        i++;
                    });
                    break;
                case 'slide-in-left':
                    var i = 0;
                    this.addStrips2();
                    var strips = $('.mdslider-strip', this.slider);
                    strips.each(function () {
                        strip = $(this);
                        var left = -i * self.slideWidth;
                        strip.css({
                            left: left
                        });
                        strip.animate({
                            left: self.slideWidth + left
                        }, (self.options.transitionsSpeed * 2), function () {
                            self.transitionEnd();
                        });
                        i++;
                    });
                    break;
                case 'slide-in-up':
                    var i = 0;
                    this.addStrips2();
                    var strips = $('.mdslider-strip', this.slider);
                    strips.each(function () {
                        strip = $(this);
                        var top = i * self.slideHeight;
                        strip.css({
                            top: top
                        });
                        strip.animate({
                            top: top - self.slideHeight
                        }, self.options.transitionsSpeed, function () {
                            self.transitionEnd();
                        });
                        i++;
                    });
                    break;
                case 'slide-in-down':
                    var i = 0;
                    this.addStrips2();
                    var strips = $('.mdslider-strip', this.slider);
                    strips.each(function () {
                        strip = $(this);
                        var top = -i * self.slideHeight;
                        strip.css({
                            top: top
                        });
                        strip.animate({
                            top: self.slideHeight + top
                        }, self.options.transitionsSpeed, function () {
                            self.transitionEnd();
                        });
                        i++;
                    });
                    break;
                case 'fade':
                default:
                    var opts = {
                        strips: 1
                    };
                    this.addStrips(false, opts);
                    var strip = $('.mdslider-strip:first', this.slider);
                    strip.css({
                        'height': '100%',
                        'width': this.slideWidth
                    });
                    if (fx == 'slide-in-right') strip.css({
                        'height': '100%',
                        'width': this.slideWidth,
                        'left': this.slideWidth + 'px',
                        'right': ''
                    });
                    else if (fx == 'slide-in-left') strip.css({
                        'left': '-' + this.slideWidth + 'px'
                    });

                    strip.animate({
                        left: '0px',
                        opacity: 1
                    }, this.options.transitionsSpeed, function () {
                        self.transitionEnd();
                    });
                    break;
            }
        },
        
        getWidthStripItem: function(){
            var width = this.slideWidth / this.options.stripCols,
                result = {};
            result.normal = Math.round(width);
            result.last = this.slideWidth - (result.normal * (this.options.stripCols - 1));
            return result;
        },
        getHeightStripItem: function(){
            var height = this.slideHeight / this.options.stripRows,
                result = {};
            result.normal = Math.round(height);
            result.last = this.slideHeight - (result.normal * (this.options.stripRows - 1));
            return result;
        },

        // Shuffle an array
        shuffle: function(oldArray) {
            var newArray = oldArray.slice();
            var len = newArray.length;
            var i = len;
            while (i--) {
                var p = parseInt(Math.random() * len);
                var t = newArray[i];
                newArray[i] = newArray[p];
                newArray[p] = t;
            }
            return newArray;
        },

        documentHasTouch: function() {
            return ('onthis.touchstart' in window || 'createTouch' in document);
        },

        resizeWindow: function() {
            this.wrap.width();
            this.slideWidth = this.options.responsive ? this.wrap.width() : this.options.width;
            if (this.options.responsive) {
                if (this.options.fullwidth && this.slideWidth > this.options.width)
                    this.slideHeight = this.options.height;
                else
                    this.slideHeight = Math.round(this.slideWidth / this.options.width * this.options.height);
            }

            if (!this.options.responsive && !this.options.fullwidth)
                this.wrap.width(this.slideWidth);
            if (!this.options.responsive && this.options.fullwidth)
                this.wrap.css({"min-width": this.slideWidth + "px"});
            if (this.options.fullwidth) {
                $(".md-objects", this.slider).width(this.options.width);
                var bulletSpace = 20;
                if ((this.wrap.width() - this.options.width) / 2 > 20)
                    bulletSpace = (this.wrap.width() - this.options.width) / 2;
                this.wrap.find(".md-bullets").css({
                    'left': bulletSpace,
                    'right': bulletSpace
                });
                this.wrap.find(".md-thumb").css({
                    'left': bulletSpace,
                    'right': bulletSpace
                });
            }
            if (this.options.responsive && this.options.fullwidth && (this.wrap.width() < this.options.width))
                $(".md-objects", this.slider).width(this.slideWidth);
            this.wrap.height(this.slideHeight);
            $(".md-slide-item", this.slider).height(this.slideHeight);

            this.resizeBackgroundImage();
            this.resizeThumbDiv();
            this.resizeFontSize();
            this.resizePadding();
            this.setThumnail()
        },

        resizeBackgroundImage: function() {
            var self = this;
            $(".md-slide-item", this.slider).each(function () {
                var $background = $(".md-mainimg img", this);

                if ($background.length == 1) {
                    if ($background.data("defW") && $background.data("defH")) {
                        var width = $background.data("defW"),
                            height = $background.data("defH");
                        self.changeImagePosition($background, width, height);
                    }
                }
                else
                    $(".md-mainimg", $(this)).width($(".md-slide-item:visible", self.slider).width()).height($(".md-slide-item:visible", self.slider).height())
            });
        },

        preloadImages: function() {
            var count = $(".md-slide-item .md-mainimg img", this.slider).length,
                self = this;
            this.slider.data('count', count);
            if (this.slider.data('count') == 0)
                this.slideReady();            
            $(".md-slide-item .md-mainimg img", this.slider).each(function () {
                $(this).load(function () {
                    var $image = $(this);
                    if (!$image.data('defW')) {
                        var dimensions = self.getImgSize($image.attr("src"));
                        self.changeImagePosition($image, dimensions.width, dimensions.height);
                        $image.data({
                            'defW': dimensions.width,
                            'defH': dimensions.height
                        });
                    }
                    self.slider.data('count', self.slider.data('count') - 1);
                    if (self.slider.data('count') == 0)
                        self.slideReady();
                });
                if (this.complete) $(this).load();
            });
        },

        slideReady: function() {
            this.slider.removeClass("loading-image");
            this.setTimer();
        },

        changeImagePosition: function($background, width, height) {
            var panelWidth = $(".md-slide-item:visible", this.slider).width(),
                panelHeight = $(".md-slide-item:visible", this.slider).height();

            if (height > 0 && panelHeight > 0) {
                if (((width / height) > (panelWidth / panelHeight))) {
                    var left = panelWidth - (panelHeight / height) * width;
                    $background.css({
                        width: "auto",
                        height: panelHeight + "px"
                    });
                    if (left < 0) {
                        $background.css({left: (left / 2) + "px", top: 0});
                    } else {
                        $background.css({left: 0, top: 0});
                    }
                } else {
                    var top = panelHeight - (panelWidth / width) * height;
                    $background.css({width: panelWidth + "px", height: "auto"});
                    if (top < 0) {
                        $background.css({top: (top / 2) + "px", left: 0});
                    } else {
                        $background.css({left: 0, top: 0});
                    }
                }
            }
        },

        resizeFontSize: function() {
            var fontDiff = 1,
                jqueryVer = $.fn.jquery.split('.');
            if (jqueryVer[0] == '1' && parseInt($.browser.version, 10) < 9)
                fontDiff = 6;
            if (this.wrap.width() < this.options.width) {
                $(".md-objects", this.slider).css({'font-size': this.wrap.width() / this.options.width * 100 - fontDiff + '%'});
            } else {
                $(".md-objects", this.slider).css({'font-size': 100 - fontDiff + '%'});
            }
        },

        resizePadding: function() {
            var self = this;
            if (this.wrap.width() < this.options.width && this.options.responsive) {
                $(".md-objects div.md-object", this.slider).each(function () {
                    var objectRatio = self.wrap.width() / self.options.width,
                        $_object = $(this),
                        objectPadding = {};

                    if ($_object.data('paddingtop'))
                        objectPadding['padding-top'] = $_object.data('paddingtop') * objectRatio;
                    if ($_object.data('paddingright'))
                        objectPadding['padding-right'] = $_object.data('paddingright') * objectRatio;
                    if ($_object.data('paddingbottom'))
                        objectPadding['padding-bottom'] = $_object.data('paddingbottom') * objectRatio;
                    if ($_object.data('paddingleft'))
                        objectPadding['padding-left'] = $_object.data('paddingleft') * objectRatio;

                    if ($('> a', $_object).length){
                        $('> a', $_object).css(objectPadding);
                    }
                    else
                        $_object.css(objectPadding);
                })
            }
            else {
                $(".md-objects div.md-object", this.slider).each(function () {
                    var $_object = $(this),
                        objectPadding = {};

                    if ($_object.data('paddingtop'))
                        objectPadding['padding-top'] = $_object.data('paddingtop');
                    if ($_object.data('paddingtop'))
                        objectPadding['padding-top'] = $_object.data('paddingtop');
                    if ($_object.data('paddingright'))
                        objectPadding['padding-right'] = $_object.data('paddingright');
                    if ($_object.data('paddingbottom'))
                        objectPadding['padding-bottom'] = $_object.data('paddingbottom');
                    if ($_object.data('paddingleft')) objectPadding['padding-left'] = $_object.data('paddingleft');

                    if ($('> a', $_object).length)
                        $('> a', $_object).css(objectPadding);
                    else
                        $_object.css(objectPadding);
                });
            }
        },

        setThumnail: function() {
            if (this.options.showThumb && !this.options.showBullet) {
                var thumbHeight = this.slider.data('thumb-height');

                if (this.options.posThumb == '1') {
                    var thumbBottom = thumbHeight / 2;
                    this.wrap.find(".md-thumb").css({
                        'height': thumbHeight + 20,
                        'bottom': -thumbBottom - 10
                    });
                    this.wrap.css({'margin-bottom': thumbBottom + 10})
                }
                else {
                    this.wrap.find(".md-thumb").css({
                        'height': thumbHeight + 20,
                        'bottom': -(thumbHeight + 20)
                    });
                    this.wrap.css({'margin-bottom': thumbHeight + 50})
                }
            }
        },

        getImgSize: function(imgSrc) {
            var newImg = new Image();
            newImg.src = imgSrc;
            var dimensions = {height: newImg.height, width: newImg.width};
            return dimensions;
        }
    };
    
    $.fn.mdSlider = function (options) {
        return new MDSlider($(this), options);
    };
    $.fn.reverse = [].reverse;
    //Image Preloader Function
    var ImagePreload = function (p_aImages, p_pfnPercent, p_pfnFinished) {
        this.m_pfnPercent = p_pfnPercent;
        this.m_pfnFinished = p_pfnFinished;
        this.m_nLoaded = 0;
        this.m_nProcessed = 0;
        this.m_aImages = new Array;
        this.m_nICount = p_aImages.length;
        for (var i = 0; i < p_aImages.length; i++) this.Preload(p_aImages[i])
    };

    ImagePreload.prototype = {
        Preload: function (p_oImage) {
            var oImage = new Image;
            this.m_aImages.push(oImage);
            oImage.onload = ImagePreload.prototype.OnLoad;
            oImage.onerror = ImagePreload.prototype.OnError;
            oImage.onabort = ImagePreload.prototype.OnAbort;
            oImage.oImagePreload = this;
            oImage.bLoaded = false;
            oImage.source = p_oImage;
            oImage.src = p_oImage
        },
        OnComplete: function () {
            this.m_nProcessed++;
            if (this.m_nProcessed == this.m_nICount) this.m_pfnFinished();
            else this.m_pfnPercent(Math.round((this.m_nProcessed / this.m_nICount) * 10))
        },
        OnLoad: function () {
            this.bLoaded = true;
            this.oImagePreload.m_nLoaded++;
            this.oImagePreload.OnComplete()
        },
        OnError: function () {
            this.bError = true;
            this.oImagePreload.OnComplete()
        },
        OnAbort: function () {
            this.bAbort = true;
            this.oImagePreload.OnComplete()
        }
    }
    $.fn.mdvideobox = function (opt) {
        $(this).each(function () {
            function init() {
                if ($("#md-overlay").length == 0) {
                    var _overlay = $('<div id="md-overlay" class="md-overlay"></div>').hide().click(closeMe);
                    var _container = $('<div id="md-videocontainer" class="md-videocontainer"><div id="md-video-embed"></div><div class="md-description clearfix"><div class="md-caption"></div><a id="md-closebtn" class="md-closebtn" href="#"></a></div></div>');
                    _container.css({
                        'width': options.initialWidth + 'px',
                        'height': options.initialHeight + 'px',
                        'display': 'none'
                    });
                    $("#md-closebtn", _container).click(closeMe);
                    $("body").append(_overlay).append(_container);
                }
                overlay = $("#md-overlay");
                container = $("#md-videocontainer");
                videoembed = $("#md-video-embed", container);
                caption = $(".md-caption", container);
                element.click(activate);
            }

            function closeMe() {
                overlay.fadeTo("fast", 0, function () {
                    $(this).css('display', 'none')
                });
                videoembed.html('');
                container.hide();
                return false;
            }

            function activate() {
                options.click.call();
                overlay.css({'height': $(window).height() + 'px'});
                var top = ($(window).height() / 2) - (options.initialHeight / 2);
                var left = ($(window).width() / 2) - (options.initialWidth / 2);
                container.css({top: top, left: left}).show();
                videoembed.css({
                    'background': '#fff url(css/loading.gif) no-repeat center',
                    'height': options.contentsHeight,
                    'width': options.contentsWidth
                });
                overlay.css('display', 'block').fadeTo("fast", options.defaultOverLayFade);
                caption.html(title);
                videoembed.fadeIn("slow", function () {
                    insert();
                });
                return false;
            }

            function insert() {
                videoembed.css('background', '#fff');
                embed = '<iframe src="' + videoSrc + '" width="' + options.contentsWidth + '" height="' + options.contentsHeight + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
                videoembed.html(embed);
            }

            var options = $.extend({
                initialWidth: 640,
                initialHeight: 400,
                contentsWidth: 640,
                contentsHeight: 350,
                defaultOverLayFade: 0.8,
                click: function () {
                }
            }, opt);
            var overlay, container, caption, videoembed, embed;
            var element = $(this);
            var videoSrc = options.autoplayVideo ? (element.attr("href") + "?autoplay=1") : element.attr("href");
            var title = element.attr("title");
            //lets start it
            init();
        });
    }
})(jQuery);
;
