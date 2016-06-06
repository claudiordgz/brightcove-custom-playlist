
var VideoPlaylist = function () {
  var player,
    options,
    playlistItems,
    singleItemWidth,
    totalItems,
    currentIndexedItem,
    itemsPerScroll,

    css = function(element, prop, pseudo, value){
      if(value==null){
        var b = (window.navigator.userAgent).toLowerCase();
        var s;
        if(/msie|opera/.test(b)){
          s = element.currentStyle;
        }else if(/gecko/.test(b)){
          s = document.defaultView.getComputedStyle(element,pseudo);
        }
        if(s[prop]!=undefined){
          return s[prop];
        }
        return element.style[prop];
      }
      if(prop){
        element.style[prop]=value;
      }
      return true;
    },

    /**
     * removes highlight from all playlist items
     */
    clearHighlight = function(items) {
      [].forEach.call(items, function(item) {
        item.setAttribute('data-selected', 'false');
      });
    },

    /**
     * tests for all the ways a variable might be undefined or not have a value
     * @param {*} x the variable to test
     * @return {Boolean} true if variable is defined and has a value
     */
    isDefined = function(x) {
      return (!(x === "" || x === null));
    },

    /**
     * loads a playlist item that was clicked on
     */
    loadPlaylistItem = function(items, idx) {
      // item index in playlist array
      var index = parseInt(idx, 10);
      player.playlist.currentItem(index);
      clearHighlight(items);
      items[index].setAttribute('data-selected', 'true');
      player.play();
    },

    buildPlaylistDomItems = function() {
      playlistItems = [];
      // set click listeners on playlist items
      var children = document.getElementById(player.id_).parentNode.childNodes;
      for (var i=0; i<children.length; i++) {
        if (children[i].className === 'bcls-playlist') {
          children = children[i].childNodes;
          break;
        }
      }
      [].forEach.call(children, function(item) {
        if (item.className === 'bcls-playlist-item') {
          playlistItems.push(item);
        }
      });
    },

    setParentDomElements = function() {
      var playerWrapper = document.createElement('div'),
        playlistWrapper = document.createElement('div'),
        playerEl = player.el(),
        playerParent = playerEl.parentNode,
        playerWidth = isDefined(options.width) ? options.width : player.width(),
        playerHeight = (9 / 16) * playerWidth;
      // add styles to wrapper and player and playlist wrapper
      playerWrapper.setAttribute('style', 'width:' + playerWidth + 'px;');
      playerWrapper.setAttribute('class', 'bcls-player-wrapper');
      playerEl.setAttribute('style', 'width:100%;height:' + playerHeight + 'px;');
      playlistWrapper.setAttribute('class', 'bcls-playlist');
      // insert a div to wrap the player and playlist before the player
      playerParent.insertBefore(playerWrapper, playerEl);
      // now append the player to the new div
      playerWrapper.appendChild(playerEl);
      // append the playlist wrapper to the new div
      playerWrapper.appendChild(playlistWrapper);
      return playlistWrapper;
    },

    buildPlaylistData = function(videoItem, index, playlistWrapper) {
      // create the playlist item and set its class and style
      var playlistItem = document.createElement('div');
      var itemInnerDiv = document.createElement('div');
      var itemTitle = document.createElement('span');
      playlistItem.setAttribute('data-playlist-index', index);
      playlistItem.setAttribute('class', 'bcls-playlist-item');
      // create the inner div and set class and style
      itemInnerDiv.setAttribute('class', 'bcls-item-inner-div');
      itemInnerDiv.setAttribute('style', 'background-image:url(' + videoItem.thumbnail + ');');
      // create the title and set its class
      itemTitle.setAttribute('class', 'bcls-title');
      // add the video name to the title element
      itemTitle.appendChild(document.createTextNode(videoItem.name));
      // now append the title to the innerdiv,
      // the innerdiv to the item,
      // and the item to the playlist
      itemInnerDiv.appendChild(itemTitle);
      playlistItem.appendChild(itemInnerDiv);
      playlistWrapper.appendChild(playlistItem);

    },
    
    setupNavigation = function(playlist, items) {
      var visibleWidth = parseInt(css(playlist, 'width'), 10);
      singleItemWidth = parseInt(css(items[0], 'width', 'before'), 10) + parseInt(css(items[0], 'margin-right', 'before'), 10) - 1;
      itemsPerScroll = Math.floor(visibleWidth / singleItemWidth);
      currentIndexedItem = 0;
      totalItems = playlistItems.length;
    },
    
    navigateLeft = function(items, operation, currentIndexedItem, totalItems, itemsPerScroll, singleItemWidth) {
      if(currentIndexedItem < 0) {
        currentIndexedItem = operation(currentIndexedItem, itemsPerScroll);
      } else if (currentIndexedItem == 0) {
        currentIndexedItem = -(totalItems - (totalItems % Math.abs(itemsPerScroll)));
      } else {
        currentIndexedItem = 0;
      }
      items[0].style.marginLeft = (currentIndexedItem * singleItemWidth) + 'px';
      return currentIndexedItem;
    },

    navigateRight = function(items, operation, currentIndexedItem, totalItems, itemsPerScroll, singleItemWidth) {
      var max = (totalItems - Math.abs(itemsPerScroll)),
        current = Math.abs(currentIndexedItem);
      if(current < max) {
        currentIndexedItem = operation(currentIndexedItem, itemsPerScroll);
      } else {
        currentIndexedItem = 0;
      }
      items[0].style.marginLeft = (currentIndexedItem * singleItemWidth) + 'px';
      return currentIndexedItem;
    },

    load = function() {
      // handle loadedmetadata just once, it fires again with each video load
      player.one('loadedmetadata', function () {
        var playlistData = player.playlist();
        var playlistWrapper = setParentDomElements();
        playlistData.forEach(function(item, index) {
          buildPlaylistData(item, index, playlistWrapper);
        });
        buildPlaylistDomItems();
        clearHighlight(playlistItems);
        [].forEach.call(playlistItems, function(item) {
          item.addEventListener('click', function(e) {
            loadPlaylistItem(playlistItems, this.getAttribute('data-playlist-index'));
          });
        });
        // initially highlight the first item
        // but make sure playlist isn't empty
        if (playlistItems.length > 0) {
          playlistItems[0].setAttribute('data-selected', 'true');
        }
        var beforeButton = document.createElement('div'),
          nextButton = document.createElement('div');
        beforeButton.setAttribute('class', 'bcls-before-nav');
        playlistWrapper.parentNode.insertBefore(beforeButton, playlistWrapper);
        nextButton.setAttribute('class', 'bcls-next-nav');
        playlistWrapper.parentNode.insertBefore(nextButton, playlistWrapper.nextSibling);
        setupNavigation(playlistWrapper, playlistItems);
        function sum(a, b) { return (a + b); }
        function subs(a, b) { return (a - b); }
        if (itemsPerScroll > totalItems) {
          beforeButton.setAttribute('data-enabled', 'false');
          nextButton.setAttribute('data-enabled', 'false');
        } else {
          beforeButton.setAttribute('data-enabled', 'true');
          nextButton.setAttribute('data-enabled', 'true');
        }

        beforeButton.addEventListener('click', function (e) {
          var enabledFlag = this.getAttribute('data-enabled');
          if(enabledFlag) {
            currentIndexedItem = navigateLeft(playlistItems, sum, currentIndexedItem, totalItems, itemsPerScroll, singleItemWidth);
          }
        });
        
        nextButton.addEventListener('click', function (e) {
          var enabledFlag = this.getAttribute('data-enabled');
          if(enabledFlag) {
            currentIndexedItem = navigateRight(playlistItems, subs, currentIndexedItem, totalItems, itemsPerScroll, singleItemWidth);
          }
        });
        
      });
    },

    init = function(lPlayer, lOptions) {
      player = lPlayer;
      options = lOptions;
      load();
    };

  return {
    init: init
  };
};


videojs.plugin('customPlaylist', function (options) {
  var myPlayer = this,
    pl = new VideoPlaylist();
  pl.init(myPlayer, options);
});

//@ sourceURL=custom-playlist.js