describe('Playlist', function() {
  afterEach(function() {
    Playlist.clear();
  });

  describe('getSongs()', function() {
    it('returns an array of songs', function() {
      expect(Playlist.getSongs()).to.be.an('array');
    });
  });

  describe('addSong()', function() {
    it('adds a song to the end of the playlist', function() {
      Playlist.addSong({ url: 'test.mp3' });
      expect(Playlist.getSongs()).to.have.lengthOf(1);
    });
  });

  describe('removeSong()', function() {
    it('removes a song from the playlist by index', function() {
      Playlist.addSong({ url: 'test.mp3' });
      Playlist.removeSong(0);
      expect(Playlist.getSongs()).to.have.lengthOf(0);
    });
  });

  describe('clear()', function() {
    it('removes all songs from the playlist', function() {
      Playlist.addSong({ url: 'test.mp3' });
      Playlist.clear();
      expect(Playlist.getSongs()).to.have.lengthOf(0);
    });
  });

  describe('getPosition()', function() {
    it('gets the current playlist position', function() {
      expect(Playlist.getPosition()).to.be.a('number');
    });
  });

  describe('setPosition()', function() {
    it('sets the current playlist position', function() {
      Playlist.addSong({ url: 'one' });
      Playlist.addSong({ url: 'two' });
      Playlist.setPosition(1);

      expect(Playlist.getPosition()).to.equal(1);
    });

    it('will ignore negative numbers', function() {
      Playlist.setPosition(-1);

      expect(Playlist.getPosition()).to.equal(0);
    });

    it('will ignore indexes higher than the playlist length', function() {
      Playlist.setPosition(1);

      expect(Playlist.getPosition()).to.equal(0);
    });

    afterEach(function() {
      Playlist.clear();
    });
  });

  describe('next()', function() {
    it('increments the playlist position', function() {
      Playlist.addSong({});
      Playlist.addSong({});
      Playlist.next();

      expect(Playlist.getPosition()).to.equal(1);
    });

    it('will not increment past the end of the playlist', function() {
      Playlist.addSong({});
      Playlist.next();

      expect(Playlist.getPosition()).to.equal(0);
    });

    afterEach(function() {
      Playlist.clear();
    });
  });

  describe('prev()', function() {
    it('decrements the playlist position', function() {
      Playlist.addSong({});
      Playlist.addSong({});
      Playlist.setPosition(1);
      Playlist.prev();

      expect(Playlist.getPosition()).to.equal(0);
    });

    it('will not decrement past zero', function() {
      Playlist.prev();

      expect(Playlist.getPosition()).to.equal(0);
    });

    afterEach(function() {
      Playlist.clear();
    });
  });
});

describe('Playlist Modules', function() {
  describe('next', function() {
    var $elem, p;

    before(function() {
      Playlist.addSong({});
      Playlist.addSong({});
      $elem = $(`
        <div data-player>
          <button data-next>Next</button>
          <audio data-audio></audio>
        </div>
      `).appendTo(body);
      p = new Player($elem);
      p.init();
    });

    it('increments the playlist pointer on click', function() {
      $elem.find('button').click();
      expect(Playlist.getPosition()).to.equal(1);
    });

    after(function() {
      Playlist.clear();
      $elem.remove();
    })
  });

  describe('prev', function() {
    var $elem, p;

    before(function() {
      Playlist.addSong({});
      Playlist.addSong({});
      Playlist.setPosition(1);
      $elem = $(`
        <div data-player>
          <button data-prev>Prev</button>
          <audio data-audio></audio>
        </div>
      `).appendTo(body);
      p = new Player($elem);
      p.init();
    });

    it('decrements the playlist pointer on click', function() {
      $elem.find('button').click();
      expect(Playlist.getPosition()).to.equal(0);
    });

    after(function() {
      Playlist.clear();
      $elem.remove();
    });
  });

  describe('playlist', function() {
    var $elem;

    it('renders the playlist contents according to an HTML template', function() {
      $elem = $(`
        <div data-player>
          <audio data-audio></audio>
          <ul data-playlist></ul>
        </div>
      `).appendTo(body);

      Playlist.addSong({
        url: 'test.mp3',
        title: 'Title 1'
      });
      Playlist.addSong({
        url: 'test.mp3',
        title: 'Title 2'
      });

      Playlist.template(function(song) {
        return '<li>' + song.title + '</li>';
      });

      var p = new Player($elem);
      p.init();

      expect($elem.find('li')).to.have.lengthOf(2);
      expect($elem.find('li').eq(0).text()).to.equal('Title 1');
      expect($elem.find('li').eq(1).text()).to.equal('Title 2');
    });

    afterEach(function() {
      Playlist.clear();
      $elem.remove();
    })
  });
});
