# Vivaldi

Vivaldi is a set of JavaScript (with jQuery) tools to create audio players of many shapes. Single-track players, players with playlists, or multiple players inter-connected on one page.

## Features

- **Quick setup:** you can configure the whole player through HTML and one JavaScript function.
- **Modular:** but hopefully not in that way where everything is confusing. Every audio player control is optional, so you can use as much or as little of the tool as you like.
- **Style-free:** no CSS is required for the player to function, but the plugin does include a drop-in set of styles.

## Installation

```bash
npm install vivaldi --save
```

Inside the package are `vivaldi.js` and `vivaldi.css`. Note that the CSS is optional.

## Usage

### Setup

The bare minimum you need to construct an audio player is a container and an `<audio>` element with the `data-audio` attribute.

```html
<div id="player">
  <audio data-audio></audio>
</div>
```

You can initialize the player by calling `vivaldi()` on a jQuery object:

```js
$('#player').vivaldi();
```

Or, you can access the `Player` class directly. This gives you faster access to player methods and elements.

```js
// You can pass in a selector, DOM element, or jQuery object
var player = new Vivaldi.Player('#player');

// This is required to set up the UI
player.init();
```

Even if you use the jQuery method, you can still access the `Player` instance by pulling it out of the `data-vivaldi` attribute:

```js
$('#player').vivaldi();
var player = $('#player').data('vivaldi');
```

### Playing Audio

To play audio, we need to hand the player the URL of an audio file. You can do this two ways.

To load a file in JavaScript, use the `load()` method.

```js
player.load('path/to/track.mp3');
```

You can also plant a URL in the HTML of the player, by adding the `data-src` attribute. Then call the `load()` method without any arguments to pull the URL off the player's HTML.

```js
player.load();
```

To play the track as soon as enough of it has loaded, add the `autoplay` attribute to the player's `<audio>` element.

```html
<div id="player">
  <audio data-audio autoplay></audio>
</div>
```

If you instead add the `preload` attribute to `<audio>`, the player will start buffering the track automatically on page load.

```html
<div id="player">
  <audio data-audio preload></audio>
</div>
```

**This isn't recommended, as you risk chewing through someone's cellular data plan.** However, you can instead use `preload="metadata"`, which will preload track metadata only, and not any actual audio. This is useful if your player displays the length of the track.

```html
<div id="player">
  <!-- This will fill in with the correct time on page load -->
  <p data-time-total></p>
  <audio data-audio preload="metadata"></audio>
</div>
```

### Playback Controls

You've got a handful of simple methods to control playback. The `play()` and `pause()` methods will do exactly that.

```js
player.play(); // I may not always love you
player.pause();
player.play(); // But as long as there are stars above you
```

If you want to automatically play *or* pause depending on what the player is doing, use `playToggle()`.

```js
player.playToggle();
player.playToggle(); // You never need to doubt it
```

To jump around in the music, use the `seek()` method, and give it a number in seconds to jump to. (That makes `0` the beginning of the song.)

```js
player.seek(87); // And God only knows what I'd be without you
```

The HTML Audio element has a lot of built-in methods and properties of its own. To access the DOM element of the player's `<audio>` element, use `player.audio`.

## Player Controls

The Vivaldi player has over a dozen different controls, covering playback, seeking, playlists, volume, and more. Every control is optional, and none of them are inter-dependent. Additionally, none of the controls require any special CSS to function. This means you can use as many or as few parts as you like.

All controls are identified with `data-` attributes. For example, the play/pause button is `data-play-toggle` and the track duration is `data-time-total`.

```html
<div id="player">
  <button type="button" data-play-toggle>Play/Pause</button>
  <span data-time-total>0:00</span>
  <audio data-audio></audio>
</div>
```

None of the modules require any extra setup to function&mdash;just drop in the HTML and it'll work.

### Play Toggle

The `play-toggle` module will play or pause the player when clicked on.

```html
<div id="player">
  <button type="button" data-play-toggle>Play/Pause</button>
  <audio data-audio></audio>
</div>
```

### Track Time

The `time-current` and `time-total` modules display the current and total time, respectively, of the current track, in the `mm:ss` format.

```html
<div id="player">
  <!-- Text will look like 0:00 / 3:00 when activated -->
  <span data-time-current></span> /
  <span data-time-total></span>
  <audio data-audio></audio>
</div>
```

### Seeking

The `seeker` and `seeker-fill` modules create a visual display of the elapsed track time. In most cases, `seeker-fill` will go inside `seeker`.

```html
<div id="player">
  <div data-seeker>
    <div data-seeker-fill></div>
  </div>
  <audio data-audio></audio>
</div>
```

The `seeker` element, when clicked on, will seek the track to the point in time matching the position of the click on the bar. So, clicking at the halfway point of the bar will seek to the halfway point of the track. The user can also drag their mouse along the bar, and the track will seek when they release the mouse button.

The `seeker-fill` element stretches itself using a CSS transform to create the effect of growing as the track progresses. You will need one line of CSS to make the fill work correctly: `transform-origin: left center;`. This makes the bar grow from the left side&mdash;otherwise, it will grow from the center!

There's one more seeker module: `seeker-jump`, a button control to move forward or backward in a track by a number of seconds.

The value of the `seeker-jump` attribute on an element defines the length of the jump in seconds. Use a *positive number* to move forward, and a *negative number* to move backward.

```html
<div id="player">
  <!-- Jumps back 15 seconds -->
  <button data-seeker-jump="-15">Prev</button>
  <!-- Jumps forward 15 seconds -->
  <button data-seeker-jump="15">Fwd</button>
  <audio data-audio></audio>
</div>
```

### Metadata

The `meta` module displays data about the current track, such as title, artist, and so on. The text automatically updates when the track changes.

```html
<div id="player">
  <!-- These empty tags are filled in with data when the track loads -->
  <p data-meta="title"></p>
  <p data-meta="artist"></p>
  <p data-meta="album"></p>
  <audio data-audio></audio>
</div>
```

## Playlists

An audio player stores just one track at a time. The optional Playlist module allows you to store a playlist of songs, accessible by players.

To use it, add `vivaldi.playlists.js` to your page. The `Playlist` object on the window controls a global playlist.

### Methods

#### getSongs()

Get the playlist contents as an array of objects.

```js
Playlist.getSongs(); // => [{ url: 'pet-sounds.mp3' }, ...]
```

#### addSong(song)

Add a song to the end of the playlist. Like with the basic player, a song can be an object of any shape, but it must have a `url` property.

```js
Playlist.addSong({
  url: 'pet-sounds.mp3',
  title: 'Pet Sounds',
  artist: 'The Beach Boys'
});
```

#### removeSong(index)

Remove a song at a specific index.

```js
Playlist.removeSong(0); // Removes the first song
```

#### clear()

Remove all songs from the playlist.

```js
Playlist.clear();
```

#### getPosition()

Get the index of the currently-playing song.

```js
Playlist.getPosition(); // => 0
```

#### setPosition(index)

Switch the currently-playing song to the one at the specified index.

```js
Playlist.setPosition(0);
```

#### next()

Move to the next song.

```js
Playlist.next();
```

#### prev()

Move to the previous song.

```js
Playlist.prev();
```

#### template(function)

Define a function to generate an HTML rendering of the playlist contents. The function passed here is used by the `data-playlist` module, which displays the contents of the playlist. The function is passed to `Array.prototype.map()`, so you have three parameters:

- `song` (Object): metadata for a song.
- `index` (Integer): index of the song within the playlist.
- `playlist` (Array of Objects): playlist contents.

The function can return anything you'd pass into the jQuery constructor. Most likely it's a string, but it could also be a jQuery element or a DOM element. It should be a *single element*, however, and not an array. This is because the element gets a click event for playing a specific song in the playlist.

```js
Playlist.template(function(song, index) {
  return `<li>${index + 1}. ${song.title}</li>`;
});
```

### Modules

With the Playlist addon loaded, these additional modules can be used in your audio player.

#### next

Advances the playlist on click.

```html
<div id="player">
  <button data-next>Next Song</button>
  <audio data-audio></audio>
</div>
```

#### prev

...wait, what is the opposite of "advance"? Regress? Double back?

```html
<div id="player">
  <button data-prev>Previous Song</button>
  <audio data-audio></audio>
</div>
```

#### playlist

Renders the contents of the playlist. By default, it's just a bunch of `<li>`s with the title of each song. However, you can define your own template using the `Playlist.template()` method.

```html
<div id="player">
  <ul data-playlist>
    <!-- Keep this empty -->
  </ul>
  <audio data-audio></audio>
</div>
```

## Local Development

```bash
git clone https://github.com/gakimball/vivaldi
cd vivaldi
npm install
```

Run tests by opening `test/index.html` in your browser.

## Colophon

Vivaldi is maintained by [Geoff Kimball](http://geoffkimball.com) and is MIT-licensed.
