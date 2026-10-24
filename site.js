/* Dweebpedia engine. You should not need to edit this file. */
(function () {
  "use strict";

  var content = document.getElementById("content");

  /* your articles + the optional sample articles from examples.js */
  var EX = typeof EXAMPLE_ARTICLES !== "undefined" ? EXAMPLE_ARTICLES : [];
  var GROUPS = typeof CATEGORY_GROUPS !== "undefined" ? CATEGORY_GROUPS : {};
  var ALL = ARTICLES.concat(EX);

  function slugify(t) {
    return String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function fmtDate(d) {
    if (!d) return "";
    var dt = new Date(d + "T00:00:00");
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  var bySlug = {};
  ALL.forEach(function (a) {
    a.slug = a.slug || slugify(a.title);
    a.category = Array.isArray(a.category) ? a.category : (a.category ? [a.category] : []);
    bySlug[a.slug] = a;
  });

  /* ---------- text formatting ---------- */

  function inline(t) {
    return t
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, a, b) {
        var s = slugify(a);
        return '<a href="#/article/' + s + '"' + (bySlug[s] ? "" : ' class="new"') + ">" + (b || a) + "</a>";
      })
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\*([^*]+)\*/g, "<i>$1</i>");
  }

  function render(body) {
    body = body.replace(/^[ \t]*(#{2,3}[ \t]+.+)$/gm, "\n\n$1\n\n");
    var blocks = body.trim().split(/\n\s*\n/);
    var html = "";
    var toc = [];
    var n2 = 0, n3 = 0;

    blocks.forEach(function (b) {
      b = b.trim();
      if (!b) return;
      var m = b.match(/^(#{2,3})\s+(.+)$/);
      if (m) {
        var lvl = m[1].length;
        var id = "sec" + toc.length;
        var num;
        if (lvl === 2) { n2++; n3 = 0; num = n2 + ""; } else { n3++; num = (n2 || 1) + "." + n3; }
        toc.push({ id: id, lvl: lvl, num: num, text: m[2] });
        html += "<h" + lvl + ' id="' + id + '">' + inline(m[2]) + "</h" + lvl + ">";
        return;
      }
      var lines = b.split("\n");
      if (lines.every(function (l) { return /^\s*[-*]\s+/.test(l); })) {
        html += "<ul>" + lines.map(function (l) { return "<li>" + inline(l.replace(/^\s*[-*]\s+/, "")) + "</li>"; }).join("") + "</ul>";
      } else if (lines.every(function (l) { return /^\s*\d+\.\s+/.test(l); })) {
        html += "<ol>" + lines.map(function (l) { return "<li>" + inline(l.replace(/^\s*\d+\.\s+/, "")) + "</li>"; }).join("") + "</ol>";
      } else if (/^>/.test(b)) {
        html += "<blockquote>" + inline(lines.map(function (l) { return l.replace(/^>\s?/, ""); }).join(" ")) + "</blockquote>";
      } else if (/^</.test(b)) {
        html += b; /* raw html, e.g. an embed */
      } else {
        html += "<p>" + inline(lines.join(" ")) + "</p>";
      }
    });
    return { html: html, toc: toc };
  }

  function plain(body) {
    return body
      .replace(/<[^>]+>/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, a, b) { return b || a; })
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/^#{2,3}\s+/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/[*]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ---------- pieces ---------- */

  function infobox(a) {
    var info = a.info || {};
    var rows = "";
    if (info.image) {
      rows += '<tr><td colspan="2" class="imgrow"><img src="' + esc(info.image) + '" alt="' + esc(a.title) + '">' +
        (info.caption ? '<div class="cap">' + inline(esc(info.caption)) + "</div>" : "") + "</td></tr>";
    }
    Object.keys(info).forEach(function (k) {
      if (k === "image" || k === "caption") return;
      rows += "<tr><th>" + esc(k) + "</th><td>" + inline(esc(info[k])) + "</td></tr>";
    });
    if (!rows) return "";
    return '<table class="infobox"><caption>' + esc(a.title) + "</caption>" + rows + "</table>";
  }

  function tocBox(toc) {
    if (toc.length < 3) return "";
    var h = '<div id="toc"><div class="toctitle">Contents</div><ul>';
    toc.forEach(function (t) {
      h += '<li style="margin-left:' + (t.lvl === 3 ? 18 : 0) + 'px"><a href="#" data-goto="' + t.id + '"><span class="num">' + t.num + "</span>" + inline(t.text) + "</a></li>";
    });
    return h + "</ul></div>";
  }

  function listArticles(list, withDate) {
    if (!list.length) return '<p class="notice">Nothing here yet.</p>';
    return "<ul>" + list.map(function (a) {
      return '<li><a href="#/article/' + a.slug + '">' + esc(a.title) + "</a>" +
        (withDate && a.date ? ' <span class="date">(' + fmtDate(a.date) + ")</span>" : "") + "</li>";
    }).join("") + "</ul>";
  }

  function byDateDesc(a, b) { return (b.date || "").localeCompare(a.date || ""); }
  function byTitle(a, b) { return a.title.localeCompare(b.title); }

  function categories() {
    var map = {};
    ALL.forEach(function (a) {
      a.category.forEach(function (c) { map[c] = (map[c] || 0) + 1; });
    });
    return map;
  }

  function groupMap() {
    var cats = categories();
    var out = [], seen = {};
    Object.keys(GROUPS).forEach(function (g) {
      var list = GROUPS[g].filter(function (c) { return cats[c]; });
      list.forEach(function (c) { seen[c] = 1; });
      if (list.length) out.push({ name: g, cats: list });
    });
    var rest = Object.keys(cats).filter(function (c) { return !seen[c]; }).sort();
    if (rest.length) out.push({ name: "Other", cats: rest });
    return out;
  }

  function groupOf(cat) {
    var gs = groupMap();
    for (var i = 0; i < gs.length; i++) {
      if (gs[i].cats.indexOf(cat) !== -1) return gs[i].name;
    }
    return "";
  }

  function catLink(c, counts) {
    return '<li><a href="#/category/' + encodeURIComponent(c) + '">' + esc(c) + "</a>" +
      (counts ? ' <span class="date">(' + counts[c] + ")</span>" : "") + "</li>";
  }

  function pageCategories() {
    var counts = categories();
    var gs = groupMap();
    var h = '<h1 class="firstHeading">All categories</h1><div class="siteSub">From ' + esc(SITE.name) + "</div>" +
      "<p>There are <b>" + Object.keys(counts).length + "</b> categories in <b>" + gs.length + "</b> topics.</p>";
    gs.forEach(function (g) {
      h += '<h2><a href="#/group/' + encodeURIComponent(g.name) + '">' + esc(g.name) + "</a></h2>" +
        '<ul class="catcols">' + g.cats.map(function (c) { return catLink(c, counts); }).join("") + "</ul>";
    });
    content.innerHTML = h;
    document.title = "All categories - " + SITE.name;
  }

  function pageGroup(name) {
    var g = groupMap().filter(function (x) { return x.name === name; })[0];
    if (!g) {
      content.innerHTML = '<h1 class="firstHeading">No such topic</h1><p>See <a href="#/categories">all categories</a>.</p>';
      return;
    }
    var h = '<h1 class="firstHeading">Topic: ' + esc(g.name) + '</h1><div class="siteSub">From ' + esc(SITE.name) + "</div>" +
      "<p>" + g.cats.length + " categories. <a href=\"#/categories\">See all topics</a>.</p>";
    g.cats.forEach(function (c) {
      var list = ALL.filter(function (a) { return a.category.indexOf(c) !== -1; }).sort(byTitle);
      h += '<h3><a href="#/category/' + encodeURIComponent(c) + '">' + esc(c) + "</a></h3>" + listArticles(list, false);
    });
    content.innerHTML = h;
    document.title = "Topic: " + g.name + " - " + SITE.name;
  }

  /* ---------- pages ---------- */

  function pageHome() {
    var real = ALL.filter(function (a) { return !a.example; });
    var recent = (real.length ? real : ALL).slice().sort(byDateDesc).slice(0, 8);
    var gs = groupMap();
    var topicHtml = gs.map(function (g) {
      return '<li><a href="#/group/' + encodeURIComponent(g.name) + '">' + esc(g.name) + '</a> <span class="date">(' + g.cats.length + ")</span></li>";
    }).join("");
    var nCats = Object.keys(categories()).length;
    var countLine = "There are currently <b>" + real.length + "</b> article" + (real.length === 1 ? "" : "s") +
      (EX.length ? " by " + esc(SITE.author) + " and <b>" + EX.length + "</b> sample articles" : "") +
      " on this site, in <b>" + nCats + "</b> categories.";

    content.innerHTML =
      '<h1 class="firstHeading">Main Page</h1>' +
      '<div class="siteSub">From ' + esc(SITE.name) + ", " + esc(SITE.tagline.toLowerCase()) + "</div>" +
      '<div class="box"><h2 class="boxhead">Welcome to ' + esc(SITE.name) + '</h2><div class="boxbody"><p>' + inline(esc(SITE.welcome)) +
      "</p><p>" + countLine + ' <a href="#/all">See all articles</a> or <a href="#/categories">browse every category</a>.</p></div></div>' +
      '<div class="box"><h2 class="boxhead">Recently added</h2><div class="boxbody">' + listArticles(recent, true) + "</div></div>" +
      '<div class="box"><h2 class="boxhead">Browse by topic</h2><div class="boxbody">' +
      (topicHtml ? '<ul class="catcols">' + topicHtml + "</ul>" : '<p class="notice">No categories yet.</p>') + "</div></div>";
    document.title = SITE.name;
  }

  function pageAll() {
    content.innerHTML = '<h1 class="firstHeading">All articles</h1><div class="siteSub">From ' + esc(SITE.name) + "</div>" +
      listArticles(ALL.slice().sort(byTitle), true);
    document.title = "All articles - " + SITE.name;
  }

  function pageCategory(name) {
    var list = ALL.filter(function (a) { return a.category.indexOf(name) !== -1; }).sort(byTitle);
    var g = groupOf(name);
    content.innerHTML = '<h1 class="firstHeading">Category: ' + esc(name) + '</h1><div class="siteSub">From ' + esc(SITE.name) +
      (g ? ' - topic: <a href="#/group/' + encodeURIComponent(g) + '">' + esc(g) + "</a>" : "") + "</div>" + listArticles(list, true);
    document.title = "Category: " + name + " - " + SITE.name;
  }

  function pageArticle(slug) {
    var a = bySlug[slug];
    if (!a) {
      content.innerHTML = '<h1 class="firstHeading">No such article</h1><p>There is no article called <b>' + esc(slug) + "</b> yet.</p>" +
        '<p>Try the search box, or go back to the <a href="#/">main page</a>.</p>';
      document.title = "Not found - " + SITE.name;
      return;
    }
    var r = render(a.body || "");
    var cats = a.category.map(function (c) { return '<a href="#/category/' + encodeURIComponent(c) + '">' + esc(c) + "</a>"; }).join(" | ");
    content.innerHTML =
      '<h1 class="firstHeading">' + esc(a.title) + "</h1>" +
      '<div class="siteSub">From ' + esc(SITE.name) + ", " + esc(SITE.tagline.toLowerCase()) + "</div>" +
      (a.example ? '<p class="notice sample">This is a sample article that came with the site. Delete <b>examples.js</b> to remove all samples, or replace this one with your own opinion.</p>' : "") +
      infobox(a) + tocBox(r.toc) + r.html +
      (a.date && !a.example ? '<p class="date" style="clear:both">This article was written on ' + fmtDate(a.date) + ". It is only my opinion.</p>" : "") +
      (cats ? '<div class="catlinks"><b>Categories:</b> ' + cats + "</div>" : "");
    document.title = a.title + " - " + SITE.name;
  }

  function pageSearch(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var results = [];
    if (terms.length) {
      ALL.forEach(function (a) {
        var title = a.title.toLowerCase();
        var cats = a.category.join(" ").toLowerCase();
        var info = a.example ? "" : Object.keys(a.info || {}).map(function (k) { return k + " " + a.info[k]; }).join(" ").toLowerCase();
        var text = a.example ? "" : plain(a.body || "");
        var low = text.toLowerCase();
        var score = 0, ok = true;
        terms.forEach(function (t) {
          var s = 0;
          if (title.indexOf(t) !== -1) s += 10;
          if (cats.indexOf(t) !== -1) s += 5;
          if (info.indexOf(t) !== -1) s += 3;
          var i = low.indexOf(t);
          while (i !== -1) { s += 1; i = low.indexOf(t, i + t.length); }
          if (!s) ok = false;
          score += s;
        });
        if (ok) results.push({ a: a, score: score, text: text, low: low });
      });
      results.sort(function (x, y) { return y.score - x.score; });
    }

    function snippet(r) {
      var pos = -1;
      terms.forEach(function (t) {
        var i = r.low.indexOf(t);
        if (i !== -1 && (pos === -1 || i < pos)) pos = i;
      });
      var start = Math.max(0, (pos === -1 ? 0 : pos) - 70);
      var s = esc(r.text.substr(start, 190));
      terms.forEach(function (t) {
        var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
        s = s.replace(re, "<mark>$1</mark>");
      });
      return (start > 0 ? "..." : "") + s + "...";
    }

    var h = '<h1 class="firstHeading">Search results</h1><div class="siteSub">From ' + esc(SITE.name) + "</div>";
    if (!terms.length) {
      h += '<p class="notice">Type something in the search box.</p>';
    } else if (!results.length) {
      h += "<p>No articles match <b>" + esc(q) + "</b>.</p>";
    } else {
      h += "<p>" + results.length + " result" + (results.length === 1 ? "" : "s") + " for <b>" + esc(q) + "</b>:</p>";
      results.forEach(function (r) {
        h += '<div class="result"><div class="rtitle"><a href="#/article/' + r.a.slug + '">' + esc(r.a.title) + "</a></div>" +
          (r.text ? '<div class="snippet">' + snippet(r) + "</div>" : "") +
          '<div class="meta">' + esc(r.a.category.join(", ")) + (r.a.date ? " - " + fmtDate(r.a.date) : "") + "</div></div>";
      });
    }
    content.innerHTML = h;
    document.title = "Search: " + q + " - " + SITE.name;
  }

  /* ---------- router ---------- */

  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/");
    var page = parts[0] || "home";
    var arg = "";
    try { arg = decodeURIComponent(parts.slice(1).join("/")); } catch (e) { arg = parts.slice(1).join("/"); }
    window.scrollTo(0, 0);

    if (page === "random") {
      if (ALL.length) {
        location.replace("#/article/" + ALL[Math.floor(Math.random() * ALL.length)].slug);
      } else {
        location.replace("#/");
      }
      return;
    }
    if (page === "article") return pageArticle(arg);
    if (page === "all") return pageAll();
    if (page === "category") return pageCategory(arg);
    if (page === "categories") return pageCategories();
    if (page === "group") return pageGroup(arg);
    if (page === "search") return pageSearch(arg);
    pageHome();
  }

  /* ---------- setup ---------- */

  document.getElementById("site-name").textContent = SITE.name;
  document.getElementById("site-tagline").textContent = SITE.tagline;
  document.getElementById("logo-mark").textContent = (SITE.name || "D").charAt(0).toUpperCase();
  document.getElementById("footer-text").innerHTML =
    "Everything on this site is just the opinion of " + esc(SITE.author) + ". Not factual, not neutral, not Wikipedia.";

  var ms = document.getElementById("main-site-link");
  if (SITE.mainSite && SITE.mainSite.url) {
    ms.href = SITE.mainSite.url;
    ms.textContent = SITE.mainSite.name;
  } else {
    ms.parentNode.style.display = "none";
  }

  document.getElementById("category-list").innerHTML = groupMap().map(function (g) {
    return '<li><a href="#/group/' + encodeURIComponent(g.name) + '">' + esc(g.name) + "</a></li>";
  }).join("") || '<li class="count">none yet</li>';

  document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = document.getElementById("search-input").value.trim();
    if (q) location.hash = "#/search/" + encodeURIComponent(q);
  });

  content.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-goto]") : null;
    if (t) {
      e.preventDefault();
      var el = document.getElementById(t.getAttribute("data-goto"));
      if (el) el.scrollIntoView();
    }
  });

  window.addEventListener("hashchange", route);
  route();
})();
