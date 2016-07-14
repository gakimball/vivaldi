!function($) {

/**
 * Names of possible player UI elements.
 * These strings are used as keys on the player.ui object, and as CSS selectors to locate the matching DOM elements, i.e. data-time-elapsed.
 */
var PLAYER_UI = [
  // <audio> source
  'audio',

  // Play/pause button
  'play-pause',

  // Time readout
  'time-elapsed',
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
 */
Player.prototype.load = function(source, autoplay) {
  // Create a <source> element for the <audio>
  var sourceElement = document.createElement('source');
  sourceElement.setAttribute('src', source);
  this.ui.audio[0].appendChild(sourceElement);

  // Auto-play if set to
  if (autoplay) {
    this.ui.audio.on('loadeddata.vivaldi', function() {
      this.play();
    }.bind(this));
  }
}

Player.prototype.play = function() {
  this.ui.audio[0].play();
}

$.fn.vivaldi = function() {}
$.fn.vivaldi.Player = Player;

}(jQuery)
