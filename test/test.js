var Player = $.fn.vivaldi.Player;

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
        <button data-play-pause></button>
        <span data-time-elapsed></span>
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
      'play-pause',
      'time-elapsed',
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
});
