!function($, Vivaldi) {

var SONGS = [];
var POSITION = 0;
var TEMPLATE = function() {};

/**
 * Vivaldi playlist module.
 */
Vivaldi.Playlist = {
  /**
   * Gets the current song list of the playlist.
   * @returns {Object[]} List of songs.
   */
  getSongs: function() {
    return SONGS;
  },

  /**
   * Adds a song to the end of the playlist.
   * @param {Object} song - Song to add.
   */
  addSong: function(song) {
    SONGS.push(song);
  },

  /**
   * Removes a song from the playlist at the specified index. `0` is the first song in the playlist.
   * @param {Integer} index - Index of song to remove.
   */
  removeSong: function(index) {
    SONGS.splice(index, 1);
  },

  /**
   * Removes all songs from the playlist.
   */
  clear: function() {
    SONGS = [];
    POSITION = 0;
  },

  /**
   * Gets the index of the currently playing track.
   */
  getPosition: function() {
    return POSITION;
  },

  /**
   * Sets the index of the currently playing track. This will cause the audio player to load the new track.
   * @param {Integer} position - Index of track to switch to.
   */
  setPosition: function(position) {
    if (POSITION >= 0 && POSITION < SONGS.length - 1) {
      POSITION = position;
    }
  },

  /**
   * Moves forward in the playlist queue. This will cause the audio player to load the new track. If the playlist is already on the last song, nothing happens.
   */
  next: function() {
    if (POSITION < SONGS.length - 1) {
      POSITION++;
    }
  },

  /**
   * Moves backward in the playlist queue. This will cause the audio player to load the new track. If the playlist is already on the first song, nothing happens.
   */
  prev: function() {
    if (POSITION > 0) {
      POSITION--;
    }
  },

  /**
   * Define the function that renders a playlist in HTML.
   * @function {TemplateRenderCallback} Callback that parses each song in the playlist.
   */
  template: function(fn) {
    TEMPLATE = fn;
  }
}

Vivaldi.on({
  init: function(player) {
    if (SONGS.length) {
      player.setSong(SONGS[0]);
    }
  }
});

Vivaldi.modules({
  /**
   * Moves the playlist to the next song on click.
   */
  'next': function(player, ui) {
    ui.on('click.vivaldi', function() {
      Playlist.next();
    });
  },

  /**
   * Moves the playlist to the previous song on click.
   */
  'prev': function(player, ui) {
    ui.on('click.vivaldi', function() {
      Playlist.prev();
    });
  },

  /**
   * Renders the contents of the playlist.
   */
  'playlist': function(player, ui) {
    if (typeof TEMPLATE !== 'function') {
      throw new Error('Vivaldi.Playlist: must define a playlist template with Vivaldi.Playlist.template()');
    }

    ui.empty();
    ui.append(SONGS.map(function(song) {
      return $(TEMPLATE(song));
    }));
  }
});

}(window.jQuery, window.Vivaldi || (window.Vivaldi = {}));
