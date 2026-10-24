# Dweebpedia

Static site, no build step. Open `index.html` to run it locally.

## Layout

- `config.js`: site name, tagline, welcome text, and the list of topic files
- `topics/`: one file per topic, this is where the articles go
- `topics/_template.js`: copy this to start a new topic (it is not loaded)
- `loader.js`, `site.js`, `style.css`, `index.html`: the site itself

## Add an article

Open the topic file (e.g. `topics/anime-manga.js`) and add an object inside `articles: [ ]`:

```js
{
  title: "Berserk",
  date: "2026-10-24",
  info: { "Author": "Kentaro Miura", "My rating": "10/10" },
  body: `
What I think about it.

## What I like
More text.
  `,
  sub: [
    { title: "The Golden Age Arc", body: `My thoughts on the arc.` }
  ]
},
```

- Only `title` is required.
- `sub` makes sub-articles. They can have their own `sub`.
- `also: ["Animation & Cartoons"]` lists the article under a second topic.
- `[[Berserk]]` links to another article or topic. `[[Berserk|this one]]` changes the text.
- Pink links point to articles that don't exist yet.
- Put pictures in an `images/` folder and set `info.image`.
- Don't put a backtick inside a body. Titles must be unique.

## Add a topic

1. Copy `topics/_template.js` to `topics/your-topic.js` and fill it in.
2. Add `"your-topic"` to `TOPIC_FILES` in `config.js`.

## GitHub Pages

Push everything to a repo, then Settings > Pages > Deploy from a branch > `main` / root.
