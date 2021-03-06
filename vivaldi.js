/**
 * @todo Consider calling Player.init in the constructor
 * @todo Consider renaming "module" to "control", may be easier to understand
 */
!function($, Vivaldi) {

/**
 * Global settings for all plugin elements.
 */
var ENV_OPTIONS = {
  // If true, only one player on a page can play audio at a time.
  exclusive: false,

  // If true, the player will pull song data from the playlists module.
  playlists: false
}

/**
 * Creates a new instance of an audio player.
 * @class
 * @param {String|HTMLElement|jQuery} element - CSS selector, DOM element, or jQuery element of the player container.
 */
function Player(element) {
  if ($(element).data('vivaldi') instanceof Player) {
    console.warn('Vivaldi: tried to initialize a player twice on element ' + element);
  }

  /**
   * Player container element.
   * @type jQuery
   */
  this.$player = $(element);

  /**
   * UI elements in use by the player. Each key is the name of the control (the attribute used to activate it without `data-`), and the value is the corresponding jQuery object.
   * @type Object
   */
  this.ui = {};

  /**
   * DOM element of the player's `<audio>`.
   * @type HTMLAudioElement
   */
  this.audio = null;

  /**
   * Current loaded song, for use if the player can play multiple songs.
   * @type Object | null
   */
  this.song = null;

  /**
   * Player state not covered by `<audio>`.
   * @type Object
   */
  this.state = {
    seeking: false
  };

  // Add this class instance as an attribute of the player container. This allows it to be accessed if the player was initialized with $.fn.vivaldi().
  this.$player.data('vivaldi', this);
}

/**
 * Lifecycle hooks from external addons.
 * @type Object.<String, Function[]>
 */
Player.hooks = {
  init: []
}

/**
 * Initialize the player by finding UI elements and storing them in a UI object.
 */
Player.prototype.init = function() {
  // Find and store the <audio> element
  this.audio = this.$player.find('[data-audio]')[0];

  // The <audio> element is required
  if (typeof this.audio !== 'undefined') {
    // And it has to be <audio>
    if (this.audio.nodeName !== 'AUDIO') {
      throw new Error('Vivaldi Error: the data-audio element must be <audio>.');
    }
  }
  else {
    throw new Error('Vivaldi Error: player is missing an <audio data-audio> element.');
  }

  // Find and store UI elements
  for (var attr in MODULES) {
    var $elem = this.$player.find('[data-' + attr + ']');

    if ($elem.length > 0) {
      this.ui[attr] = $elem;

      if (MODULES[attr]) {
        MODULES[attr](this, this.ui[attr]);
      }
    }
  }

  // Set basic events
  $(this.audio).on({
    loadeddata: function() {
      this.$player.addClass('is-active');
    }.bind(this),

    play: function() {
      this.$player.removeClass('is-paused');
      this.$player.addClass('is-playing');
    }.bind(this),

    pause: function() {
      this.$player.removeClass('is-playing');
      this.$player.addClass('is-paused');
    }.bind(this)
  });

  if (ENV_OPTIONS.exclusive) {
    $(window).on('playing.vivaldi', function(event) {
      if (!this.$player.is(event.target)) {
        this.pause();
      }
    }.bind(this));
  }

  // Run external lifecycle hooks
  Player.hooks.init.map(function(hook) {
    hook(this);
  }.bind(this));
}

/**
 * Loads an audio file. The URL of the file can be passed in to this function. Or, by omitting a source, the player will try to load a file from:
 *   - The value of the `data-src` attribute on the player container.
 *   - The `url` property of the current song, loaded through `Player.setSong()` or `Player.getSong()`.
 * @param {String} source - URL to the audio source.
 * @todo Infer MIME type from extension and add that to <source> also
 * @todo Remove old <source> elements when called again
 */
Player.prototype.load = function(source) {
  // If no source is given, try to load first from data-src, then from player.song.url
  if (source === null || source === undefined) {
    if (typeof this.$player.attr('data-src') !== 'undefined') {
      source = this.$player.attr('data-src');
    }
    else if (this.song && this.song.url) {
      source = this.song.url;
    }
  }

  // Create a <source> element for the <audio>
  var sourceElement = document.createElement('source');
  sourceElement.setAttribute('src', source);
  this.audio.appendChild(sourceElement);
}

/**
 * Sets the song to be used by the player. A song is a plain object of any format, with a `url` parameter pointing to the URL of the track.
 * @param {Object} song - Song to load.
 */
Player.prototype.setSong = function(song) {
  if ($.isPlainObject(song)) {
    if (!song.url) {
      throw new Error('Vivaldi: when loading a song into a player, there must be a "url" property.');
    }
    else {
      this.song = song;
      this.$player.trigger('trackchange.vivaldi');
    }
  }
}

/**
 * Get song metadata from an external source, using a user-defined loading function set by Vivaldi.loader().
 */
Player.prototype.getSong = function() {
  if (!ENV_OPTIONS.loader) {
    throw new Error('Vivaldi: must define a loading function with Vivaldi.loader() before calling Player.getSong()');
  }

  // Add a callback to the arguments sent to the loader function
  var args = Array.prototype.slice.call(arguments);
  args.push(function(song) {
    this.setSong(song);
  }.bind(this));

  // Then run the loader function with user arguments + the callback
  ENV_OPTIONS.loader.apply(this, args);
}

/**
 * Start or resume playback on the player.
 */
Player.prototype.play = function() {
  this.audio.play();

  if (ENV_OPTIONS.exclusive) {
    this.$player.trigger('playing.vivaldi');
  }
}

/**
 * Pause playback on the player.
 */
Player.prototype.pause = function() {
  this.audio.pause();
}

/**
 * Start playback if audio is paused, or pause playback if audio is playing.
 */
Player.prototype.playToggle = function() {
  if (this.audio.paused) {
    this.play();
  }
  else {
    this.pause();
  }
}

/**
 * Seek to the given time in the track. The time can be given as an integer, which is a number of seconds, or a decimal, which is a percentage of the track's total length.
 */
Player.prototype.seek = function(time) {
  var audio = this.audio;

  // Decimal values
  if (time % 1 != 0) {
    audio.currentTime = (audio.duration * time).toFixed();
  }
  // Integer values
  else {
    audio.currentTime = time;
  }
}

var MODULES = {
  /**
   * Toggles play state on click.
   */
  'play-toggle': function(player, ui) {
    ui.on('click', function() {
      player.playToggle();
    });
  },

  /**
   * Displays the total time of the current audio track.
   */
  'time-total': function(player, ui) {
    // Set the initial readout
    ui.text('0:00');

    // When a new audio file is loaded, set the time
    $(player.audio).on('durationchange.vivaldi', function() {
      var time = Player.util.formatTime(player.audio.duration);
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
    $(player.audio).on('timeupdate.vivaldi', function() {
      if (!player.state.seeking) {
        var time = Player.util.formatTime(player.audio.currentTime);
        ui.text(time);
      }
    });

    // While the user is seeking, change the text
    player.$player.on('seekerupdate.vivaldi', function(event, pct) {
      var time = (pct * player.audio.duration).toFixed();
      time = Player.util.formatTime(time);
      ui.text(time);
    });
  },

  /**
   * Seeker bar which can be clicked on to move the playhead.
   * @todo Prevent autoplay after seeking if audio was already paused
   */
  'seeker': function(player, ui) {
    var audio = player.audio;

    // On mousedown, the player enters a seeking state.
    ui.on('mousedown.vivaldi', function(event) {
      player.state.seeking = true;
    });

    // Releasing the mouse button moves the track to the given time.
    ui.on('mouseup.vivaldi', function(event) {
      var pct = Player.util.getMousePosition(this, event);
      player.seek(pct);
      player.state.seeking = false;
    });

    // If the mouse button is already held down, dragging the mouse inside the seeker will move the playhead.
    ui.on('mousemove.vivaldi', function(event) {
      if (player.state.seeking) {
        var pct = Player.util.getMousePosition(this, event);
        player.$player.trigger('seekerupdate.vivaldi', [pct]);
      }
    });
  },

  /**
   * Visually represents the elapsed time of the playing track.
   */
  'seeker-fill': function(player, ui) {
    // Update the fill as the track's elapsed time changes
    $(player.audio).on('timeupdate.vivaldi', function() {
      if (!player.state.seeking) {
        var pct = (player.audio.currentTime / player.audio.duration).toFixed(3);
        ui.css('transform', 'scaleX(' + pct + ')');
      }
    });

    // Update the fill as the user is seeking
    player.$player.on('seekerupdate.vivaldi', function(event, pct) {
      ui.css('transform', 'scaleX(' + pct + ')');
    });
  },

  /**
   * Seek forward or back in a track by a set amount on click.
   */
  'seeker-jump': function(player, ui) {
    var audio = player.audio;

    ui.on('click.vivaldi', function() {
      // "n" is a jump forward, "-n" is a jump backward
      var offset = parseInt(this.getAttribute('data-seeker-jump'));
      var seekLocation = audio.currentTime + offset;

      // The seek location must be >= 0 and <= the total track length
      if (seekLocation < 0) seekLocation = 0;
      if (seekLocation > audio.duration) seekLocation = audio.duration;

      player.seek(seekLocation.toFixed());
    });
  },

  /**
   * Display the contents of properties on Player.song.
   */
  'meta': function(player, ui) {
    player.$player.on('trackchange.vivaldi', function(event) {
      for (var key in this.song) {
        ui.filter('[data-meta="' + key + '"]').text(this.song[key]);
      }
    }.bind(player));
  }
}

// Currently unused
Player.OPTIONS = []

Player.util = {
  /**
   * Converts a number of seconds into a timestamp formatted like mm:ss.
   * @param {Number} time - Number to convert.
   * @returns {String} A formatted timestamp.
   */
  formatTime: function(time) {
    var min = parseInt(time / 60);
    var sec = (time % 60 < 10) ? ('0'+parseInt(time % 60)) : parseInt(time % 60);
    return min + ':' + sec;
  },

  /**
   * Given a list of input options `input`, and a list of all possible plugin options `options`, creates an object of plugin settings. Each key is a plugin option, and the value of the key is `true` if the option is enabled, or `false` otherwise.
   * @param {String} input - List of user-defined options as a space-separated list.
   * @param {String[]} options - Array of all possible plugin options.
   * @returns {Object} Object of enabled/disabled plugin options.
   */
  getOptions: function(input, options) {
    if (typeof input !== 'string') {
      input = '';
    }

    var obj = {}; // Return value
    input = input.split(' '); // Input value

    for (var i in options) {
      var opt = options[i];
      if (input.indexOf(opt) > -1) {
        obj[opt] = true;
      }
      else {
        obj[opt] = false;
      }
    }

    return obj;
  },

  /**
   * Calculates the horizontal position of a click on an element, returning a decimal value representing the offset. 0 is left, and 1 is right.
   * @param {Element} elem - HTML element clicked on.
   * @param {jQuery.Event} event - Click event.
   * @returns {Float} Decimal value of offset.
   */
  getMousePosition: function(elem, event) {
    var rect = elem.getBoundingClientRect();
    var x = event.clientX - rect.left;
    return (x / rect.width).toFixed(2);
  }
}

$.fn.vivaldi = function() {
  return this.each(function() {
    var p = new Player(this);
    p.init();
  });
}

/**
 * Set all players to "exclusive" mode, which means only one can be playing audio at a time on the page.
 */
Vivaldi.exclusive = function() {
  ENV_OPTIONS.exclusive = true;
}

/**
 * Define a loading function to be used when an audio player calls `getSong()`. The last parameter of the function must be a callback which is called with a song metadata object as its parameter.
 * @param {Function} fn - Loading function.
 */
Vivaldi.loader = function(fn) {
  if (typeof fn !== 'function') {
    throw new Error('Vivaldi: must supply a function to loader().');
  }

  ENV_OPTIONS.loader = fn;
}

/**
 * Define elements on the page that can load tracks on an audio player when clicked on. `selector` must be an HTML attribute; this is what will be used to look for click targets. On click, the value of the `selector` attribute is passed to `Player.getSong()` as an argument.
 * @param {String} attr - Attribute of click targets.
 * @param {Vivaldi.Player} player - Audio player instance to send the track requests to.
 */
Vivaldi.inlineTracks = function(attr, player) {
  $('[' + attr + ']').on('click.vivaldi', function() {
    player.getSong(this.getAttribute(attr));
  });
}

/**
 * Defines a custom UI module that can be used in any audio player. The name supplied is used as a key in `Player.ui`, and made into an HTML attribute to identify instances of the module, i.e. `data-[name]`.
 * @param {String} name - Name of the module.
 * @param {ModuleInitCallback} fn - Function that initializes the module.
 */
Vivaldi.module = function(name, fn) {
  if (typeof name !== 'string' || typeof fn !== 'function') {
    throw new Error('Vivaldi: must supply a name and function to create a module.');
  }

  // Add the function to the set of module functions
  var newModule = {};
  newModule[name] = fn;
  $.extend(MODULES, newModule);
}

/**
 * Define multiple modules in one method call with an object, where each key is the name of a module, and its value is the initialization function. Refer to `Vivaldi.module()` for more.
 @param {Object} modules - Modules to load.
 */
Vivaldi.modules = function(modules) {
  for (var name in modules) {
    Vivaldi.module(name, modules[name]);
  }
}

/**
 * Enable playlist support.
 */
Vivaldi.playlists = function() {
  if (!Vivaldi.Playlist) {
    throw new Error('Vivaldi: cannot find Playlists module. Make sure vivaldi.playlists.js is included in your scripts.');
  }

  ENV_OPTIONS.playlists = true;
}

/**
 * Add lifecycle hooks to Vivaldi.
 * @param {Object} events - Hooks to add.
 * @param {Function} events.init - Function to run when an event is initialized.
 */
Vivaldi.on = function(events) {
  for (var name in events) {
    // Only add the hook if it's a valid hook type
    if (typeof Player.hooks !== 'undefined') {
      Player.hooks[name].push(events[name]);
    }
  }
}

/**
 * Audio player class.
 */
Vivaldi.Player = Player;

}(window.jQuery, window.Vivaldi || (window.Vivaldi = {}));
