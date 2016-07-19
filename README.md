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

This function has a second parameter to enable auto-play. The track will begin playing as soon as enough of it has buffered.

```js
player.load('path/to/track.mp3', true);
```

You can also plant a URL in the HTML of the player, by adding the `data-src` attribute. Then call the `load()` method without any arguments to pull the URL off the player's HTML.

```js
player.load();

// Want autoplay also?
player.load(null, true);
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

The HTML Audio element has a lot of built-in methods and properties of its own. To access the DOM element of the player's `<audio>` element, use `player.ui.audio`.

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

## Local Development

```bash
git clone https://github.com/gakimball/vivaldi
cd vivaldi
npm install
```

Run tests by opening `test/index.html` in your browser.

## Colophon

Vivaldi is maintained by [Geoff Kimball](http://geoffkimball.com).
