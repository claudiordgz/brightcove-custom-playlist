var VideoPlaylist = function () {
    var player,
        options,
        playlistItems,

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
    loadPlaylistItem = function(idx) {
        // item index in playlist array
        var index = parseInt(idx, 10);
        player.playlist.currentItem(index);
        clearHighlight(playlistItems);
        playlistItems[index].setAttribute('data-selected', 'true');
        player.play();
    },

    setPlaylistItems = function() {
        // set click listeners on playlist items
        playlistItems = [];
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

    load = function() {
        // handle loadedmetadata just once, it fires again with each video load
        player.one('loadedmetadata', function () {
            var playerEl = player.el(),
                playerParent = playerEl.parentNode,
                i,
                iMax,
                playerWrapper = document.createElement('div'),
                playlistWrapper = document.createElement('div'),
                playlistItem,
                itemInnerDiv,
                itemTitle,
                playlistData = player.playlist(),
                videoItem,
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
            // build the playlist items
            iMax = playlistData.length;
            for (i = 0; i < iMax; i++) {
                videoItem = playlistData[i];
                // create the playlist item and set its class and style
                playlistItem = document.createElement('div');
                playlistItem.setAttribute('data-playlist-index', i);
                playlistItem.setAttribute('class', 'bcls-playlist-item');
                // create the inner div and set class and style
                itemInnerDiv = document.createElement('div');
                itemInnerDiv.setAttribute('class', 'bcls-item-inner-div');
                itemInnerDiv.setAttribute('style', 'background-image:url(' + videoItem.thumbnail + ');');
                // create the title and set its class
                itemTitle = document.createElement('span');
                itemTitle.setAttribute('class', 'bcls-title');
                // add the video name to the title element
                itemTitle.appendChild(document.createTextNode(videoItem.name));
                // now append the title to the innerdiv,
                // the innerdiv to the item,
                // and the item to the playlist
                itemInnerDiv.appendChild(itemTitle);
                playlistItem.appendChild(itemInnerDiv);
                playlistWrapper.appendChild(playlistItem);
            }
            setPlaylistItems();
            clearHighlight(playlistItems);
            [].forEach.call(playlistItems, function(item) {
                item.addEventListener('click', function(e) {
                    loadPlaylistItem(this.getAttribute('data-playlist-index'));
                });
            });
            // initially highlight the first item
            // but make sure playlist isn't empty
            if (playlistItems.length > 0) {
                playlistItems[0].setAttribute('data-selected', 'true');
            }
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

/**
 * Brightcove player plugin that displays a playlist
 * as a row of thumbnail images along the bottom of the
 * player
 * @option {integer} width - the width of the player and playlist in pixels
 *
 * created by Robert Crooks, Brightcove Learning Services, rcrooks@brightcove.com
 * last modified: 2015-09-15
 */
videojs.plugin('customPlaylist', function (options) {
    var myPlayer = this,
        pl = new VideoPlaylist();
    pl.init(myPlayer, options);
});