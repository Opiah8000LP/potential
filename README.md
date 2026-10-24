# Dweebpedia

A tiny static site: a Wikipedia-style encyclopedia of my own opinions.
No build step, no frameworks, no dependencies.

## Files

- `articles.js`: **the only file you edit.** Site name, tagline, and every article.
- `examples.js`: about 1000 sample categories, each with one placeholder article. Delete this file (and its line in `index.html`) to remove them all.
- `index.html`, `style.css`, `site.js`: the site itself. Leave these alone unless you want to change the look.
- `images/`: make this folder yourself if you want pictures in articles.

## Adding an article

1. Open `articles.js`.
2. Copy the template from the comment at the top.
3. Paste it at the top of the `ARTICLES` list and fill it in.
4. Save and push to GitHub. The site updates in a minute or so.

## Putting it on GitHub Pages

1. Create a new repository on GitHub (any name, public).
2. Upload all of these files to it.
3. Go to Settings > Pages.
4. Under "Build and deployment", pick "Deploy from a branch", branch `main`, folder `/ (root)`, then Save.
5. After a minute your site is live at `https://YOURNAME.github.io/REPONAME/`.

To use your own domain (like a subdomain of rdweeb.xyz), add it under Settings > Pages > Custom domain.

## Trying it on your own computer

Just double-click `index.html`. It works without a server.
