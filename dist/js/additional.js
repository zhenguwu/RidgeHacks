 $('.anchor-scroll').anchorScroll({
    scrollSpeed: 1000, // scroll speed
    offsetTop: 0, // offset for fixed top bars (defaults to 0)
    onScroll: function () { 
      // callback on scroll start
    },
    scrollEnd: function () { 
      // callback on scroll end
    }
 });