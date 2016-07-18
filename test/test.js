var Player = Vivaldi.Player;

// var AUDIO;
//
// before(function(done) {
//   this.timeout(0);
//
//   $.get('test.mp3')
//     .done(function(data) {
//       AUDIO = 'data:audio/mp3;base64,' + btoa(unescape(encodeURIComponent(data)));
//       done();
//     });
// });

describe('jQuery.fn.vivaldi', function() {
  var $elem;

  it('initializes a player', function() {
    $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
    $elem.vivaldi();

    expect($elem).to.be.an.instanceOf(jQuery);
  });

  after(function() {
    $elem.remove();
  })
});

describe('Player()', function() {
  var $elem;

  it('exists on window.Vivaldi', function() {
    expect(window.Vivaldi.Player).to.be.a('function');
  });

  it('creates a new instance of a Player', function() {
    $elem = $('<div data-player></div>').appendTo('body');
    var p = new Player('[data-player]');

    expect(p).to.be.an.instanceOf(Player);
    expect(p.$player).to.have.length(1);
    expect(p.ui).to.be.an.object;
    expect(p.ui).to.be.empty;
    expect(p.$player.data('vivaldi')).to.be.an.instanceOf(Player);

    $elem.remove();
  });

  describe('Player.init()', function() {
    var $elem;

    it('finds UI elements and stores them in an object', function() {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
          <button data-play-toggle></button>
          <span data-time-current></span>
          <span data-time-total></span>
          <div data-seeker>
            <div data-seeker-fill>
            </div>
          </div>
        </div>
      `;

      $elem = $(TEMPLATE).appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      expect(p.ui).to.have.all.keys([
        'audio',
        'play-toggle',
        'time-current',
        'time-total',
        'seeker',
        'seeker-fill'
      ]);
      expect(p.ui.audio).to.be.instanceOf(jQuery);
    });

    it('throws an error if the data-audio element does not exist', function() {
      $elem = $('<div data-player></div>').appendTo('body');
      var p = new Player('[data-player]');

      expect(function() {
        p.init();
      }).to.throw(Error);
    });

    it('throws an error if the data-audio element is not <audio>', function() {
      $elem = $('<div data-player><div data-audio></div></div>').appendTo('body');
      var p = new Player('[data-player]');

      expect(function() {
        p.init();
      }).to.throw(Error);
    });

    it('creates an options object for a player without data-options', function() {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      expect(p.options).to.eql({ autoload: false, autoplay: false });
    });

    it('creates an options object for a player with data-options', function() {
      $elem = $('<div data-player data-options="autoload"><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      expect(p.options).to.eql({ autoload: true, autoplay: false });
    });

    /**
     * @todo Add tests for .is-playing and .is-paused classes
     */
    it('sets up event handlers to toggle classes on various state changes', function(done) {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();
      p.load('test.mp3');

      p.ui.audio.on('canplay', function() {
        expect(p.$player).to.have.class('is-active');
        done();
      });
    });

    afterEach(function() {
      $elem.remove();
    })
  });

  describe('Player.load()', function() {
    var $elem;

    it('appends a <source> element to the <audio> of the player', function() {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo('body');
      var p = new Player('[data-player]');
      p.init();
      p.load('test.mp3');

      var $source = $elem.find('source');
      expect($source).to.have.length(1);
      expect($source).to.have.attr('src', 'test.mp3');
    });

    it('can autoplay the audio source once loaded', function(done) {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo('body');
      var p = new Player('[data-player]');
      p.init();
      p.load('test.mp3', true);

      p.ui.audio.on('play', function() {
        done();
      });
    });

    xit('accepts a data URI instead of a URL as an audio source', function(done) {
      this.timeout(0);

      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
      window.p = new Player('[data-player]');
      p.init();
      p.load(AUDIO, true);
    });

    it('can be called with no parameters if the player has a data-src attribute', function(done) {
      $elem = $('<div data-player data-src="test.mp3"><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();
      p.load();

      p.ui.audio.on('loadedmetadata', function() {
        done();
      });
    });

    it('can be called with a null parameter if the player has a data-src attribute', function(done) {
      $elem = $('<div data-player data-src="test.mp3"><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();
      p.load(null, true);

      p.ui.audio.on('play', function() {
        done();
      });
    });

    it('can be called with no parameters if the player has song metadata', function(done) {
      $elem = $('<div data-player data-src="test.mp3"><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();
      p.setSong({ url: 'test.mp3' });
      p.load();

      p.ui.audio.on('loadedmetadata', function() {
        done();
      });
    });

    it('can be called with a null parameter if the player has song metadata', function(done) {
      $elem = $('<div data-player data-src="test.mp3"><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();
      p.setSong({ url: 'test.mp3' });
      p.load(null, true);

      p.ui.audio.on('play', function() {
        done();
      });
    });

    afterEach(function() {
      $elem.remove();
    });
  });

  describe('Player.setSong()', function() {
    var $elem;

    it('sets the input song to the Player.song property', function() {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      var song = {
        url: 'test.mp3'
      };

      p.init();
      p.setSong(song);
      expect(p.song).to.eql(song);
    });

    it('ignores non-object input', function() {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      p.setSong(0);
      expect(p.song).to.be.null;

      p.setSong('string');
      expect(p.song).to.be.null;

      p.setSong(null);
      expect(p.song).to.be.null;
    });

    it('throws an error if the song has no URL parameter', function() {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      expect(function() {
        p.setSong({ foo: 'bar' });
      }).to.throw(Error);
    });

    afterEach(function() {
      $elem.remove();
    });
  });

  describe('Player.getSong()', function() {
    var $elem;

    it('calls the global loader function to fetch song metadata', function() {
      $elem = $('<div data-player><audio data-audio></div></div>').appendTo('body');
      var p = new Player('[data-player]');
      var song = {
        url: 'test.mp3'
      };

      Vivaldi.loader(function(track, cb) {
        cb(song);
      });

      p.$player.on('trackchange.vivaldi', function() {
        expect(p.song).to.eql(song);
        done();
      });

      p.init();
      p.getSong(null);
    });

    it('fails if a loader function has not been set', function() {
      $elem = $('<div data-player><audio data-audio></div></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      expect(function() {
        p.getSong();
      }).to.throw(Error);
    });

    afterEach(function() {
      $elem.remove();
    });
  });

  describe('Player.play()', function() {
    var p, $elem;

    before(function(done) {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo('body');
      p = new Player('[data-player]');
      p.init();
      p.load('test.mp3');

      p.ui.audio.on('loadeddata', function() {
        done();
      });
    });

    it('plays audio', function() {
      p.play();
      expect(p.ui.audio[0].paused).to.be.false;
    });

    after(function() {
      $elem.remove();
    })
  });

  describe('Player.pause()', function() {
    var p, $elem;

    before(function(done) {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo('body');
      p = new Player('[data-player]');
      p.init();
      p.load('test.mp3');

      p.ui.audio.on('loadeddata', function() {
        p.play();
        done();
      });
    });

    it('pauses audio', function() {
      p.pause();
      expect(p.ui.audio[0].paused).to.be.true;
    });

    after(function() {
      $elem.remove();
    })
  });

  describe('Player.playToggle()', function() {
    var p, $elem;

    before(function(done) {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo('body');
      p = new Player('[data-player]');
      p.init();
      p.load('test.mp3');

      p.ui.audio.on('loadeddata', function() {
        done();
      });
    });

    it('starts playback if audio is paused', function() {
      p.playToggle();
      expect(p.ui.audio[0].paused).to.be.false;
    });

    it('pauses playback if audio is playing', function() {
      p.playToggle();
      expect(p.ui.audio[0].paused).to.be.true;
    });

    after(function() {
      $elem.remove();
    });
  });
});

describe('Player Modules', function() {
  var $elem;

  describe('play-toggle', function() {
    it('toggles play state on click', function(done) {
      var TEMPLATE = `
        <div data-player>
          <button data-play-toggle>Play/Pause</button>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo('body');
      var $button = $elem.find('button');
      var p = new Player('[data-player]');
      p.init();
      p.load('test.mp3', true);

      p.ui.audio.one('play', function() {
        $button.click();
        expect(p.ui.audio[0].paused).to.be.true;
        $button.click();
        expect(p.ui.audio[0].paused).to.be.false;

        done();
      });
    });
  });

  describe('time-total', function() {
    it('updates when the total duration of a track changes', function(done) {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
          <span data-time-total></span>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      p.ui.audio.on('durationchange', function() {
        expect(p.ui['time-total']).to.have.text('3:38');
        done();
      });

      p.load('test.mp3');
    });
  });

  describe('time-current', function() {
    it('updates when the elapsed time of a track changes', function(done) {
      this.slow(2000);

      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
          <span data-time-current></span> /
          <span data-time-total></span>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      p.ui.audio.on('timeupdate.test', function() {
        if (p.ui.audio[0].currentTime >= 1) {
          expect(p.ui['time-current']).to.have.text('0:01');
          p.ui.audio.off('timeupdate.test');
          done();
        }
      });

      p.load('test.mp3', true);
    });
  });

  describe('meta', function() {
    it('displays the contents of properties on player.song', function() {
      $elem = $('<div data-player><div data-meta="title"></div><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();
      p.setSong({
        url: 'test.mp3',
        title: 'Title'
      });

      expect($('[data-meta]')).to.have.text('Title');
    });
  });

  afterEach(function() {
    $elem.remove();
  })
});

describe('Player Utilities', function() {
  describe('formatTime()', function() {
    it('converts a number of seconds to a mm:ss timestamp', function() {
      var fn = Player.util.formatTime;
      expect(fn(0)).to.equal('0:00');
      expect(fn(10)).to.equal('0:10');
      expect(fn(60)).to.equal('1:00');
      expect(fn(70)).to.equal('1:10');
    });
  });

  describe('getOptions()', function() {
    var fn = Player.util.getOptions;
    var opts = ['one', 'two'];

    it('converts a string of plugin options into an object of keys with true/false values', function() {
      expect(fn('', opts)).to.eql({ one: false, two: false });
      expect(fn('one', opts)).to.eql({ one: true, two: false });
      expect(fn('one two', opts)).to.eql({ one: true, two: true });
    });

    it('can handle an undefined value for input', function() {
      expect(fn(undefined, opts)).to.eql({ one: false, two: false });
    });
  });
});

describe('Player Options', function() {
  var $elem;

  describe('autoload', function() {
    it('automatically begins loading a track on document ready', function(done) {
      $elem = $('<div data-player data-src="test.mp3" data-options="autoload"><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      p.ui.audio.on('loadstart', function() {
        done();
      });
    });

    it('will not autoload if no data-src attribute is present', function() {
      $elem = $('<div data-player data-options="autoload"><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');

      expect(function() {
        p.init()
      }).to.not.throw(Error);
    });
  });

  describe('autoplay', function() {
    it('will autoplay a track with data-src and the autoload option', function(done) {
      $elem = $('<div data-player data-src="test.mp3" data-options="autoload autoplay"><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      p.ui.audio.on('play', function() {
        done();
      });
    });

    it('will autoplay a track with data-src and no autoload option', function(done) {
      $elem = $('<div data-player data-options="autoplay"><audio data-audio></audio></div>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();
      p.load('test.mp3');

      p.ui.audio.on('play', function() {
        done();
      });
    });
  });

  afterEach(function() {
    $elem.remove();
  })
});

describe('Vivaldi', function() {
  describe('Vivaldi.loader()', function() {
    it('only allows functions to be passed as parameters', function() {
      expect(function() {
        Vivaldi.loader(null);
      }).to.throw(Error);
    });
  });

  describe('Vivaldi.inlineTracks()', function() {
    var $elem, $clicker;

    it('creates click targets to load song metadata', function() {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
      $clicker = $('<button data-track="test">Button!</button>').appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      Vivaldi.loader(function(text, cb) {
        cb({
          url: 'test.mp3',
          text: text
        });
      });
      Vivaldi.inlineTracks('data-track', p);

      $clicker.click();
      expect(p.song).to.eql({
        url: 'test.mp3',
        text: 'test'
      });
    });

    afterEach(function() {
      $elem.remove();
      $clicker.remove();
    })
  });
});
