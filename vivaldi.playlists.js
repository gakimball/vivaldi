!function($, Vivaldi) {

var SONGS = [];
var POSITION = 0;

Vivaldi.Playlist = {
  getSongs: function() {
    return SONGS;
  },

  addSong: function(song) {
    SONGS.push(song);
  },

  removeSong: function(index) {
    SONGS.splice(index, 1);
  },

  clear: function() {
    SONGS = [];
    POSITION = 0;
  },

  getPosition: function() {
    return POSITION;
  },

  setPosition: function(position) {
    if (POSITION >= 0 && POSITION < SONGS.length - 1) {
      POSITION = position;
    }
  },

  next: function() {
    if (POSITION < SONGS.length - 1) {
      POSITION++;
    }
  },

  prev: function() {
    if (POSITION > 0) {
      POSITION--;
    }
  }
}

Vivaldi.modules({
  'next': function(player, ui) {
    ui.on('click.vivaldi', function() {
      Playlist.next();
    });
  },

  'prev': function(player, ui) {
    ui.on('click.vivaldi', function() {
      Playlist.prev();
    });
  }
});

}(window.jQuery, window.Vivaldi || (window.Vivaldi = {}));
