# A personal website, as a skeleton

The structure, stylesheet and layout of a writer and researcher's site, with
every word of the original taken out and replaced with instructions. Fill it in
and it is yours.

It is plain HTML, CSS and JavaScript. No framework, no build step, no
dependencies, nothing to install. The files you edit are the files that get
published. It should still work in ten years.

## Look at it

Open `index.html` in a browser. That is the whole setup.

If you would rather use a local server, and there are a couple of things that
are easier to judge over http than over `file://`:

```
node serve.js
```

then open <http://localhost:4180>. This is the only thing in the project that
needs Node, and you can delete it without affecting anything.

## What is in it

| File | What it is |
|---|---|
| `index.html` | Home: a photo, a short bio, and previews into the other pages |
| `about.html` | A world map you can drag and zoom, with pins, and a longer bio |
| `background.html` | Work, education, and anything you sit on the board of |
| `airtime.html` | Writing, talks, podcasts, press |
| `projects.html` | Things you have built |
| `exploring.html` | What you do when you are not working |
| `reading.html` | Books and newsletters |
| `listening.html` | Podcasts and music, as embedded players |
| `using.html` | Things you own and rate |
| `collaborations.html` | The kinds of work you take on |
| `contact.html` | An address and a form |
| `styles.css` | All of the design. One file. |
| `site.js` | Carousels, the lightbox, the map, the menu. One file. |
| `images/` | Your pictures go here |

Delete any page you do not want. Remove its line from the sidebar in the other
pages and it is gone.

## How to edit it

**Every page carries its own instructions.** Open one in a text editor and you
will find a comment above the first entry explaining what to change and what
each part does. That is the documentation; there is no other manual.

Entries repeat. To add one, copy a whole `<article>` or `<div>` block, paste it
below, and edit the text inside. Nothing is generated from a data file, so what
you see in the HTML is what appears on the page.

Anything still unwritten is marked `class="tk"`, which greys it out so you can
see at a glance what is left. Delete the class once there is real text.

### The sidebar

Identical on every page apart from `aria-current="page"`, which marks where you
are. If you add, remove or rename a page, change it in every file. It is the
one piece of repetition in the project, and it is deliberate: it keeps each
page a single self-contained file you can open and read.

### Colour

Each section has its own accent, set by a class on `<body>` and defined at the
top of `styles.css`. Every accent is three values:

```css
--accent      /* the bright one: rules, squares, borders */
--accent-ink  /* a deeper one: text, and fills behind text */
--accent-soft /* a pale wash: hover backgrounds */
```

Bright colour never carries text directly, which is what keeps it legible.
Change the hex values and the whole site follows.

### Pictures

Put them in `images/` and point `src` at them. **Until a file exists you get a
grey block with the filename printed in it**, so nothing looks broken while you
are still collecting photographs, and you can see exactly what to go and find.

`--ratio` on a `.media` element sets the crop: `3/2` landscape, `1/1` square,
`4/5` upright. The picture is cropped to fill, never squashed.

Photographs are meant to be the main visual element here. The design assumes
real ones. It will look thin without them.

### The map

`about.html` has a world map you can drag and zoom. The outlines come from
Natural Earth, which is public domain, so `images/world.svg` is included and
needs no attribution.

A pin needs only its coordinates:

```html
<a class="pin accent-about" style="--lon: 28.98; --lat: 41.01" href="#somewhere">
```

Longitude and latitude in decimal degrees, east and north positive. The map is
an equirectangular projection, which is the whole trick: a place's coordinates
are its position on the image, and the CSS works out the rest. Look them up on
any maps site.

On a touch screen, tapping a pin writes the place out underneath the map
instead of floating a card that the edge would cut in half.

## What it does not do

No analytics, no cookies, no trackers, no fonts beyond Google Fonts, no
third-party scripts. Nothing phones home. If you add an embedded player it will
be the only thing on the page loading from somewhere else.

The contact form has no server behind it. It hands the message to the visitor's
own mail app, pre-filled, and they press send. **That is not reliable**: anyone
reading mail in a browser tab gets nothing at all. If you want messages to
actually arrive, point the form at something that emails you. A form service
takes five minutes; a small function on whatever hosts the site is tidier.

## Accessibility

Visible focus outlines, a skip link, real headings in order, and alt text on
anything that carries meaning. `prefers-reduced-motion` is respected: the
carousels stop animating and nothing slides. Please keep all of that if you
change things.

## Publishing it

These are static files, so anything that serves a folder will do: Netlify,
Vercel, GitHub Pages, Cloudflare Pages, or plain old shared hosting. There is
nothing to build, so there is nothing to configure.

## Licence

MIT, see `LICENSE`. Use it, change it, publish it, sell what you make with it.
Attribution is welcome but not required.

The map outlines are Natural Earth, public domain.
