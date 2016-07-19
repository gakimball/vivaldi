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
});
