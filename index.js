!function($) {

/**
 * Names of possible player UI elements.
 * These strings are used as keys on the player.ui object, and as CSS selectors to locate the matching DOM elements, i.e. data-time-current.
 */
var PLAYER_UI = [
  // <audio> source
  'audio',

  // Play/pause button
  'play-pause',

  // Time readout
  'time-current',
  'time-total',

  // Seeker bar
  'seeker',
  'seeker-fill'
];

/**
 * Creates a new instance of an audio player.
 * @class
 * @param {String} selector - CSS selector of the player container.
 */
function Player(selector) {
  this.$player = $(selector);
  this.ui = {};
}

/**
 * Initialize the player by finding UI elements and storing them in a UI object.
 */
Player.prototype.init = function() {
  // Find and store UI elements
  for (var i in PLAYER_UI) {
    var attr = PLAYER_UI[i];
    var $elem = this.$player.find('[data-'+attr+']');

    if ($elem.length > 0) {
      this.ui[attr] = $elem;

      if (Player.MODULES[attr]) {
        Player.MODULES[attr](this, this.ui[attr]);
      }
    }
  }

  // The data-audio element is required
  if ('audio' in this.ui) {
    // And it has to be <audio>
    if (this.ui['audio'][0].nodeName !== 'AUDIO') {
      throw new Error('Vivaldi Error: the data-audio element must be <audio>.');
    }
  }
  else {
    throw new Error('Vivaldi Error: player is missing an <audio data-audio> element.');
  }
}

/**
 * Loads an audio file. The audio can be set to automatically play once enough of it has loaded.
 * @param {String} source - URL to the audio source.
 * @param {Boolean} autoplay [false] - If `true`, the audio will auto-play after being loaded.
 * @todo Infer MIME type from extension and add that to <source> also
 * @todo Remove old <source> elements when called again
 * @todo In loadeddata handler, only call play() if the media is buffered enough
 */
Player.prototype.load = function(source, autoplay) {
  // Create a <source> element for the <audio>
  var sourceElement = document.createElement('source');
  sourceElement.setAttribute('src', source);
  this.ui.audio[0].appendChild(sourceElement);

  // Auto-play if set to
  if (autoplay) {
    this.ui.audio.on('canplay.vivaldi', function() {
      this.play();
    }.bind(this));
  }
}

/**
 * Start or resume playback on the player.
 */
Player.prototype.play = function() {
  this.ui.audio[0].play();
}

/**
 * Pause playback on the player.
 */
Player.prototype.pause = function() {
  this.ui.audio[0].pause();
}

/**
 * Start playback if audio is paused, or pause playback if audio is playing.
 */
Player.prototype.playToggle = function() {
  if (this.ui.audio[0].paused) {
    this.play();
  }
  else {
    this.pause();
  }
}

Player.MODULES = {
  /**
   * Displays the total time of the current audio track.
   */
  'time-total': function(player, ui) {
    // Set the initial readout
    ui.text('0:00');

    // When a new audio file is loaded, set the time
    player.ui.audio.on('durationchange', function() {
      var time = Player.util.formatTime(player.ui.audio[0].duration);
      ui.text(time);
    });
  },

  /**
   * Displays the current time of the audio track playing.
   * @todo Throttle update function
   */
  'time-current': function(player, ui) {
    // Set the initial readout
    ui.text('0:00');

    // When the duration changes, change the text
    player.ui.audio.on('timeupdate', function() {
      var time = Player.util.formatTime(player.ui.audio[0].currentTime);
      ui.text(time);
    });
  }
}

Player.util = {
  formatTime: function(time) {
    var min = parseInt(time / 60);
    var sec = (time % 60 < 10) ? ('0'+parseInt(time % 60)) : parseInt(time % 60);
    return min + ':' + sec;
  }
}

$.fn.vivaldi = function() {}
$.fn.vivaldi.Player = Player;

}(jQuery)
