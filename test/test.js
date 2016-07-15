var Player = $.fn.vivaldi.Player;

describe('jQuery.fn.vivaldi', function() {
  it.only('initializes a player', function() {
    var $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
    $elem.vivaldi();

    expect($elem).to.be.an.instanceOf(jQuery);
    expect($elem.data('vivaldi')).to.be.an.instanceOf(Player);
  });
});

describe('Player()', function() {
  it('exists as a property of the Vivaldi jQuery function', function() {
    expect($.fn.vivaldi.Player).to.be.a('function');
  });

  it('creates a new instance of a Player', function() {
    var $elem = $('<div data-player></div>').appendTo('body');
    var p = new Player('[data-player]');

    expect(p).to.be.an.instanceOf(Player);
    expect(p.$player).to.have.length(1);
    expect(p.ui).to.be.an.object;
    expect(p.ui).to.be.empty;

    $elem.remove();
  });
});

describe('Player.init()', function() {
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

    var $elem = $(TEMPLATE).appendTo('body');
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

    $elem.remove();
  });

  it('throws an error if the data-audio element does not exist', function() {
    var $elem = $('<div data-player></div>').appendTo('body');
    var p = new Player('[data-player]');

    expect(function() {
      p.init();
    }).to.throw(Error);

    $elem.remove();
  });

  it('throws an error if the data-audio element is not <audio>', function() {
    var $elem = $('<div data-player><div data-audio></div></div>').appendTo('body');
    var p = new Player('[data-player]');

    expect(function() {
      p.init();
    }).to.throw(Error);

    $elem.remove();
  });

  /**
   * @todo Add tests for .is-playing and .is-paused classes
   */
  it('sets up event handlers to toggle classes on various state changes', function(done) {
    var $elem = $('<div data-player><audio data-audio></audio></div>').appendTo('body');
    var p = new Player('[data-player]');
    p.init();
    p.load('test.mp3');

    p.ui.audio.on('canplay', function() {
      expect(p.$player).to.have.class('is-active');
      $elem.remove();
      done();
    });
  });
});

describe('Player.load()', function() {
  it('appends a <source> element to the <audio> of the player', function() {
    var TEMPLATE = `
      <div data-player>
        <audio data-audio></audio>
      </div>
    `;
    var $elem = $(TEMPLATE).appendTo('body');
    var p = new Player('[data-player]');
    p.init();
    p.load('test.mp3');

    var $source = $elem.find('source');
    expect($source).to.have.length(1);
    expect($source).to.have.attr('src', 'test.mp3');

    $elem.remove();
  });

  it('can autoplay the audio source once loaded', function(done) {
    var TEMPLATE = `
      <div data-player>
        <audio data-audio></audio>
      </div>
    `;
    var $elem = $(TEMPLATE).appendTo('body');
    var p = new Player('[data-player]');
    p.init();
    p.load('test.mp3', true);

    p.ui.audio.on('play', function() {
      $elem.remove();
      done();
    });
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
    $elem.remove();
  });
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
    $elem.remove();
  });
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

  after(function() {
    $elem.remove();
  });

  it('starts playback if audio is paused', function() {
    p.playToggle();
    expect(p.ui.audio[0].paused).to.be.false;
  });

  it('pauses playback if audio is playing', function() {
    p.playToggle();
    expect(p.ui.audio[0].paused).to.be.true;
  });
});

describe('Player Modules', function() {
  describe('time-total', function() {
    it('updates when the total duration of a track changes', function(done) {
      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
          <span data-time-total></span>
        </div>
      `;
      var $elem = $(TEMPLATE).appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      p.ui.audio.on('durationchange', function() {
        expect(p.ui['time-total']).to.have.text('3:38');
        $elem.remove();
        done();
      });

      p.load('test.mp3');
    });
  });

  describe('time-current', function() {
    it('updates when the elapsed time of a track changes', function(done) {
      this.timeout(0);

      var TEMPLATE = `
        <div data-player>
          <audio data-audio></audio>
          <span data-time-current></span> /
          <span data-time-total></span>
        </div>
      `;
      var $elem = $(TEMPLATE).appendTo('body');
      var p = new Player('[data-player]');
      p.init();

      p.ui.audio.on('play', function() {
        setTimeout(function() {
          expect(p.ui['time-current']).to.not.have.text('0:00');
          $elem.remove();
          done();
        }, 1500);
      });

      p.load('test.mp3', true);
    });
  });
});
