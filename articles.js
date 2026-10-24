/* =====================================================================
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   1. SITE   - the name, tagline and links of your site.
   2. ARTICLES - one block per article. To add a new one, copy the
      template below, paste it at the TOP of the ARTICLES list, and
      fill it in. Save, upload to GitHub, done.

   NOTE: examples.js holds ~1000 sample articles (one per category) so the
   site has categories to browse. Delete that file when you do not want them.
   ===================================================================== */

const SITE = {
  name: "Dweebpedia",
  tagline: "The opinionated encyclopedia",
  author: "Dweeb",

  // Link to your main site (shows in the left menu). Leave url empty to hide it.
  mainSite: { name: "RDWEEB RECORDS", url: "https://rdweeb.xyz/" },

  // Text on the main page, under "Welcome".
  welcome: "This is a personal encyclopedia of things I like, things I don't, and what I think about them. Nothing here is factual or neutral. It is all just my opinion."
};

/* ---------------------------------------------------------------------
   ARTICLE TEMPLATE (copy this whole block, including the braces and comma)

  {
    title: "Name of the thing",
    date: "2026-10-24",                  // YYYY-MM-DD
    category: ["Music videos"],          // one or more, you make them up
    info: {                              // the box on the right. all optional.
      image: "images/example.jpg",       // put pictures in an images folder
      caption: "A caption",
      "Made by": "Someone",
      "My rating": "9/10"
    },
    body: `
Write the article here. Leave a blank line between paragraphs.

## A heading
More text. You can use **bold**, *italics*, and [links](https://example.com).

- a list item
- another one

> A quote

Link to another article of yours with double brackets: [[Welcome]]
or with different text: [[Welcome|click here]]
    `
  },

   Tips:
   - "slug" is made from the title automatically (Welcome -> welcome).
   - Use the backtick ` character around the body, not quotes.
   - Do not put a backtick inside the body text.
   - Raw HTML works too, e.g. a YouTube <iframe> embed on its own line.
   --------------------------------------------------------------------- */

const ARTICLES = [

  {
    title: "Welcome",
    date: "2026-10-24",
    category: ["Meta"],
    info: {
      "Run by": "Dweeb",
      "Started": "October 2026"
    },
    body: `
**Welcome** is the first article on this site. If you are reading it, the site works.

## What is this?
A place where I write about things I find: music videos, songs, games, websites, whatever. I am not trying to be accurate or fair. These are opinions.

## How to find things
Use the search box at the top, or look through the categories on the left.

## How to add articles
Open the file called articles.js, copy the template at the top, and fill it in. Then delete this article.
    `
  }

];
