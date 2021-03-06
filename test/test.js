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
    $elem = $('<div data-player><audio data-audio></audio></div>').appendTo(body);
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
    $elem = $('<div data-player></div>').appendTo(body);
    var p = new Player($elem);

    expect(p).to.be.an.instanceOf(Player);
    expect(p.$player).to.have.length(1);
    expect(p.ui).to.be.an.object;
    expect(p.ui).to.be.empty;
    expect(p.$player.data('vivaldi')).to.be.an.instanceOf(Player);

    $elem.remove();
  });

  describe('init()', function() {
    var $elem;
    var originalHooks;

    before(function() {
      originalHooks = $.extend({}, Player.hooks);
    });

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

      $elem = $(TEMPLATE).appendTo(body);
      var p = new Player($elem);
      p.init();

      expect(p.ui).to.have.all.keys([
        'play-toggle',
        'time-current',
        'time-total',
        'seeker',
        'seeker-fill'
      ]);
      expect(p.audio).to.be.instanceOf(HTMLAudioElement);
    });

    it('throws an error if the data-audio element does not exist', function() {
      $elem = $('<div data-player></div>').appendTo(body);
      var p = new Player($elem);

      expect(function() {
        p.init();
      }).to.throw(Error);
    });

    it('throws an error if the data-audio element is not <audio>', function() {
      $elem = $('<div data-player><div data-audio></div></div>').appendTo(body);
      var p = new Player($elem);

      expect(function() {
        p.init();
      }).to.throw(Error);
    });

    /**
     * @todo Add tests for .is-playing and .is-paused classes
     */
    it('sets up event handlers to toggle classes on various state changes', function(done) {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo(body);
      var p = new Player($elem);
      p.init();
      p.load('test.mp3');

      $(p.audio).on('canplay', function() {
        expect(p.$player).to.have.class('is-active');
        done();
      });
    });

    // @todo Replace with sinon.spy(). The Wi-fi doesn't work on this airplane!
    it('runs init lifecycle hooks', function() {
      var lifecycleCalled = false;
      function lifecycle() {
        lifecycleCalled = true;
      };

      Player.hooks.init = [lifecycle];

      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo(body);
      var p = new Player($elem);
      p.init();

      expect(lifecycleCalled).to.be.true;
    });

    afterEach(function() {
      $elem.remove();
      Player.hooks = originalHooks;
    });
  });

  describe('load()', function() {
    var $elem;

    it('appends a <source> element to the <audio> of the player', function() {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo(body);
      var p = new Player($elem);
      p.init();
      p.load('test.mp3');

      var $source = $elem.find('source');
      expect($source).to.have.length(1);
      expect($source).to.have.attr('src', 'test.mp3');
    });

    xit('accepts a data URI instead of a URL as an audio source', function(done) {
      this.timeout(0);

      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo(body);
      window.p = new Player($elem);
      p.init();
      p.load(AUDIO);
    });

    it('can be called with no parameters if the player has a data-src attribute', function(done) {
      $elem = $('<div data-player data-src="test.mp3"><audio data-audio></audio></div>').appendTo(body);
      var p = new Player($elem);
      p.init();
      p.load();

      $(p.audio).on('loadedmetadata', function() {
        done();
      });
    });

    it('can be called with no parameters if the player has song metadata', function(done) {
      $elem = $('<div data-player data-src="test.mp3"><audio data-audio></audio></div>').appendTo(body);
      var p = new Player($elem);
      p.init();
      p.setSong({ url: 'test.mp3' });
      p.load();

      $(p.audio).on('loadedmetadata', function() {
        done();
      });
    });

    afterEach(function() {
      $elem.remove();
    });
  });

  describe('setSong()', function() {
    var $elem;

    it('sets the input song to the Player.song property', function() {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo(body);
      var p = new Player($elem);
      var song = {
        url: 'test.mp3'
      };

      p.init();
      p.setSong(song);
      expect(p.song).to.eql(song);
    });

    it('ignores non-object input', function() {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo(body);
      var p = new Player($elem);
      p.init();

      p.setSong(0);
      expect(p.song).to.be.null;

      p.setSong('string');
      expect(p.song).to.be.null;

      p.setSong(null);
      expect(p.song).to.be.null;
    });

    it('throws an error if the song has no URL parameter', function() {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo(body);
      var p = new Player($elem);
      p.init();

      expect(function() {
        p.setSong({ foo: 'bar' });
      }).to.throw(Error);
    });

    afterEach(function() {
      $elem.remove();
    });
  });

  describe('getSong()', function() {
    var $elem;

    it('calls the global loader function to fetch song metadata', function(done) {
      $elem = $('<div data-player><audio data-audio></div></div>').appendTo(body);
      var p = new Player($elem);
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
      $elem = $('<div data-player><audio data-audio></div></div>').appendTo(body);
      var p = new Player($elem);
      p.init();

      expect(function() {
        p.getSong();
      }).to.throw(Error);
    });

    afterEach(function() {
      $elem.remove();
    });
  });

  describe('play()', function() {
    var p, $elem;

    before(function(done) {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo(body);
      p = new Player($elem);
      p.init();
      p.load('test.mp3');

      $(p.audio).on('loadeddata', function() {
        done();
      });
    });

    it('plays audio', function() {
      p.play();
      expect(p.audio.paused).to.be.false;
    });

    after(function() {
      $elem.remove();
    })
  });

  describe('pause()', function() {
    var p, $elem;

    before(function(done) {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo(body);
      p = new Player($elem);
      p.init();
      p.load('test.mp3');

      $(p.audio).on('loadeddata', function() {
        p.play();
        done();
      });
    });

    it('pauses audio', function() {
      p.pause();
      expect(p.audio.paused).to.be.true;
    });

    after(function() {
      $elem.remove();
    })
  });

  describe('playToggle()', function() {
    var p, $elem;

    before(function(done) {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo(body);
      p = new Player($elem);
      p.init();
      p.load('test.mp3');

      $(p.audio).on('loadeddata', function() {
        done();
      });
    });

    it('starts playback if audio is paused', function() {
      p.playToggle();
      expect(p.audio.paused).to.be.false;
    });

    it('pauses playback if audio is playing', function() {
      p.playToggle();
      expect(p.audio.paused).to.be.true;
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
          <audio data-audio autoplay></audio>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo(body);
      var $button = $elem.find('button');
      var p = new Player($elem);
      p.init();
      p.load('test.mp3');

      $(p.audio).one('play', function() {
        $button.click();
        expect(p.audio.paused).to.be.true;
        $button.click();
        expect(p.audio.paused).to.be.false;

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
      $elem = $(TEMPLATE).appendTo(body);
      var p = new Player($elem);
      p.init();

      $(p.audio).on('durationchange', function() {
        expect(p.ui['time-total']).to.have.text('0:10');
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
          <audio data-audio autoplay></audio>
          <span data-time-current></span> /
          <span data-time-total></span>
        </div>
      `;
      $elem = $(TEMPLATE).appendTo(body);
      var p = new Player($elem);
      p.init();

      $(p.audio).on('timeupdate.test', function() {
        if (p.audio.currentTime >= 1) {
          expect(p.ui['time-current']).to.have.text('0:01');
          $(p.audio).off('timeupdate.test');
          done();
        }
      });

      p.load('test.mp3');
    });
  });

  describe('meta', function() {
    it('displays the contents of properties on player.song', function() {
      $elem = $('<div data-player><div data-meta="title"></div><audio data-audio></audio></div>').appendTo(body);
      var p = new Player($elem);
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

xdescribe('Player Options', function() {
  var $elem;

  afterEach(function() {
    $elem.remove();
  });
});

describe('Vivaldi', function() {
  describe('loader()', function() {
    it('only allows functions to be passed as parameters', function() {
      expect(function() {
        Vivaldi.loader(null);
      }).to.throw(Error);
    });
  });

  describe('inlineTracks()', function() {
    var $elem, $clicker;

    it('creates click targets to load song metadata', function() {
      $elem = $('<div data-player><audio data-audio></audio></div>').appendTo(body);
      $clicker = $('<button data-track="test">Button!</button>').appendTo(body);
      var p = new Player($elem);
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

  describe('module()', function() {
    var $elem;

    it('allows custom player UI to be created', function() {
      $elem = $('<div data-player><div data-custom></div><audio data-audio></audio></div>').appendTo(body);
      Vivaldi.module('custom', function(player, ui) {
        ui.text('Custom');
      });
      var p = new Player($elem);
      p.init();

      expect($elem.children('[data-custom]')).to.have.text('Custom');
    });

    afterEach(function() {
      $elem.remove();
    });
  });

  describe('modules()', function() {
    var $elem;

    it('allows multiple modules to be defined at once', function() {
      $elem = $(`
        <div data-player>
          <div data-one></div>
          <div data-two></div>
          <audio data-audio></audio>
        </div>
      `).appendTo(body);
      var p = new Player($elem);
      Vivaldi.modules({
        one: function() {},
        two: function() {}
      });
      p.init();

      expect(p.ui).to.contain.keys('one', 'two');
    });

    afterEach(function() {
      $elem.remove();
    })
  });

  describe('on()', function() {
    var originalHooks;

    beforeEach(function() {
      originalHooks = $.extend({}, Player.hooks);
      for (var i in Player.hooks) {
        Player.hooks[i] = [];
      }
    });

    it('adds lifecycle hooks to the Player', function() {
      Vivaldi.on({
        init: function() { return true }
      });

      expect(Player.hooks.init).to.have.lengthOf(1);
      expect(Player.hooks.init[0]()).to.be.true;
    });

    afterEach(function() {
      Player.hooks = originalHooks;
    });
  });
});
