!function($, Vivaldi) {

var SONGS = [];
var POINTER = 0;

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
  }
}

}(window.jQuery, window.Vivaldi || (window.Vivaldi = {}));
