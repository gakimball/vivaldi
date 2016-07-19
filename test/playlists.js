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
});
