(function () {
  "use strict";

  var content = document.getElementById("content");
  var byTopic = {}, bySlug = {}, all = [];

  function slugify(t) {
    return String(t).replace(/&amp;/g, "&").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
  function byTitle(a, b) { return a.title.localeCompare(b.title); }
  function byName(a, b) { return a.name.localeCompare(b.name); }
  function byDateDesc(a, b) { return (b.date || "").localeCompare(a.date || ""); }

  function register(a, t, parent) {
    var base = slugify(a.slug || a.title), n = 2;
    a.slug = base;
    // same title twice gets a number
    while (bySlug[a.slug]) a.slug = base + "-" + n++;
    a.topic = t;
    a.parent = parent;
    a.subs = a.sub || [];
    a.also = a.also || [];
    bySlug[a.slug] = a;
    all.push(a);
    t.count++;
    a.subs.forEach(function (s) {
      s.date = s.date || a.date;
      register(s, t, a);
    });
  }

  TOPICS.forEach(function (t) {
    t.slug = slugify(t.name);
    t.count = 0;
    byTopic[t.slug] = t;
  });
  TOPICS.forEach(function (t) {
    (t.articles || []).forEach(function (a) { register(a, t, null); });
  });

  function rootsOf(t) {
    return all.filter(function (a) {
      return !a.parent && (a.topic === t || a.also.indexOf(t.name) !== -1);
    }).sort(byTitle);
  }

  function inline(t) {
    return t
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, a, b) {
        var s = slugify(a);
        var kind = bySlug[s] ? "article" : byTopic[s] ? "topic" : "";
        return '<a href="#/' + (kind || "article") + "/" + s + '"' + (kind ? "" : ' class="new"') + ">" + (b || a) + "</a>";
      })
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\*([^*]+)\*/g, "<i>$1</i>");
  }

  function render(body) {
    // headings always get their own block
    body = body.replace(/^[ \t]*(#{2,3}[ \t]+.+)$/gm, "\n\n$1\n\n");
    var blocks = body.trim().split(/\n\s*\n/);
    var html = "", toc = [], n2 = 0, n3 = 0;

    blocks.forEach(function (b) {
      b = b.trim();
      if (!b) return;
      var m = b.match(/^(#{2,3})\s+(.+)$/);
      if (m) {
        var lvl = m[1].length, id = "sec" + toc.length, num;
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
        html += b; // raw html (embeds)
      } else {
        html += "<p>" + inline(lines.join(" ")) + "</p>";
      }
    });
    return { html: html, toc: toc };
  }

  function plain(body) {
    return (body || "")
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

  function head(title, sub) {
    return '<h1 class="firstHeading">' + title + '</h1><div class="siteSub">' + sub + "</div>";
  }

  function infobox(a) {
    var info = a.info || {}, rows = "";
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

  function crumbs(a) {
    var parts = [], p = a.parent;
    while (p) {
      parts.unshift('<a href="#/article/' + p.slug + '">' + esc(p.title) + "</a>");
      p = p.parent;
    }
    parts.unshift('<a href="#/topic/' + a.topic.slug + '">' + esc(a.topic.name) + "</a>");
    return '<div class="crumbs">' + parts.join(" &gt; ") + "</div>";
  }

  function tree(list, dates) {
    if (!list.length) return "";
    return "<ul>" + list.map(function (a) {
      return '<li><a href="#/article/' + a.slug + '">' + esc(a.title) + "</a>" +
        (dates && a.date ? ' <span class="date">(' + fmtDate(a.date) + ")</span>" : "") +
        tree(a.subs.slice().sort(byTitle), dates) + "</li>";
    }).join("") + "</ul>";
  }

  function topicIndex() {
    var groups = {};
    TOPICS.forEach(function (t) {
      var g = t.group || "Other";
      (groups[g] = groups[g] || []).push(t);
    });
    return Object.keys(groups).sort().map(function (g) {
      return "<h2>" + esc(g) + '</h2><ul class="cols">' + groups[g].sort(byName).map(function (t) {
        return '<li><a href="#/topic/' + t.slug + '">' + esc(t.name) + "</a>" +
          (t.count ? ' <span class="date">(' + t.count + ")</span>" : "") + "</li>";
      }).join("") + "</ul>";
    }).join("");
  }

  function pageHome() {
    var recent = all.slice().sort(byDateDesc).slice(0, 10);
    content.innerHTML = head("Main Page", "From " + esc(SITE.name)) +
      '<div class="box"><h2 class="boxhead">Welcome to ' + esc(SITE.name) + '</h2><div class="boxbody"><p>' + inline(esc(SITE.welcome)) +
      "</p><p>" + (all.length ? "<b>" + all.length + "</b> article" + (all.length === 1 ? "" : "s") : "No articles yet") +
      " across <b>" + TOPICS.length + '</b> topics. <a href="#/topics">See all topics</a>.</p></div></div>' +
      (recent.length ? '<div class="box"><h2 class="boxhead">Recently added</h2><div class="boxbody"><ul>' + recent.map(function (a) {
        return '<li><a href="#/article/' + a.slug + '">' + esc(a.title) + '</a> <span class="date">(' + esc(a.topic.name) + ")</span></li>";
      }).join("") + "</ul></div></div>" : "") +
      '<div class="box"><h2 class="boxhead">Browse by topic</h2><div class="boxbody">' + topicIndex() + "</div></div>";
    document.title = SITE.name;
  }

  function pageTopics() {
    content.innerHTML = head("All topics", "From " + esc(SITE.name)) +
      "<p>" + TOPICS.length + " topics.</p>" + topicIndex();
    document.title = "All topics - " + SITE.name;
  }

  function pageAll() {
    content.innerHTML = head("All articles", "From " + esc(SITE.name)) +
      (all.length ? "<ul>" + all.slice().sort(byTitle).map(function (a) {
        return '<li><a href="#/article/' + a.slug + '">' + esc(a.title) + '</a> <span class="date">(' + esc(a.topic.name) + ")</span></li>";
      }).join("") + "</ul>" : '<p class="notice">Nothing here yet.</p>');
    document.title = "All articles - " + SITE.name;
  }

  function pageTopic(slug) {
    var t = byTopic[slug];
    if (!t) {
      content.innerHTML = head("No such topic", "") + '<p>See <a href="#/topics">all topics</a>.</p>';
      return;
    }
    var list = rootsOf(t);
    content.innerHTML = head("Topic: " + esc(t.name), "From " + esc(SITE.name) + (t.group ? " - " + esc(t.group) : "")) +
      (t.about ? "<p>" + inline(esc(t.about)) + "</p>" : "") +
      (list.length ? tree(list, true) : '<p class="notice">Nothing here yet.</p>');
    document.title = t.name + " - " + SITE.name;
  }

  function pageArticle(slug) {
    var a = bySlug[slug];
    if (!a) {
      content.innerHTML = head("No such article", "") + "<p>There is no article called <b>" + esc(slug) + '</b> yet.</p><p>Try the search box, or go back to the <a href="#/">main page</a>.</p>';
      document.title = "Not found - " + SITE.name;
      return;
    }
    var r = render(a.body || "");
    var tops = [a.topic].concat(a.also.map(function (n) { return byTopic[slugify(n)]; }).filter(Boolean));
    var links = tops.map(function (t) { return '<a href="#/topic/' + t.slug + '">' + esc(t.name) + "</a>"; }).join(" | ");
    var subs = a.subs.slice().sort(byTitle);
    content.innerHTML = head(esc(a.title), "From " + esc(SITE.name)) + crumbs(a) +
      infobox(a) + tocBox(r.toc) + r.html +
      (subs.length ? "<h2>Sub-articles</h2>" + tree(subs, false) : "") +
      (a.date ? '<p class="date" style="clear:both">This article was written on ' + fmtDate(a.date) + ". It is only my opinion.</p>" : "") +
      '<div class="catlinks"><b>Topics:</b> ' + links + "</div>";
    document.title = a.title + " - " + SITE.name;
  }

  function pageSearch(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var topics = [], results = [];

    if (terms.length) {
      TOPICS.forEach(function (t) {
        var text = (t.name + " " + (t.about || "") + " " + (t.group || "")).toLowerCase();
        if (terms.every(function (w) { return text.indexOf(w) !== -1; })) topics.push(t);
      });

      all.forEach(function (a) {
        var title = a.title.toLowerCase();
        var tp = (a.topic.name + " " + a.also.join(" ")).toLowerCase();
        var info = Object.keys(a.info || {}).map(function (k) { return k + " " + a.info[k]; }).join(" ").toLowerCase();
        var text = plain(a.body);
        var low = text.toLowerCase();
        var score = 0, ok = true;
        terms.forEach(function (w) {
          var s = 0;
          if (title.indexOf(w) !== -1) s += 10;
          if (tp.indexOf(w) !== -1) s += 5;
          if (info.indexOf(w) !== -1) s += 3;
          var i = low.indexOf(w);
          while (i !== -1) { s += 1; i = low.indexOf(w, i + w.length); }
          if (!s) ok = false;
          score += s;
        });
        if (ok) results.push({ a: a, score: score, text: text, low: low });
      });
      results.sort(function (x, y) { return y.score - x.score; });
    }

    function snippet(r) {
      var pos = -1;
      terms.forEach(function (w) {
        var i = r.low.indexOf(w);
        if (i !== -1 && (pos === -1 || i < pos)) pos = i;
      });
      var start = Math.max(0, (pos === -1 ? 0 : pos) - 70);
      var s = esc(r.text.substr(start, 190));
      terms.forEach(function (w) {
        s = s.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>");
      });
      return (start > 0 ? "..." : "") + s + "...";
    }

    var h = head("Search results", "From " + esc(SITE.name));
    if (!terms.length) {
      h += '<p class="notice">Type something in the search box.</p>';
    } else if (!topics.length && !results.length) {
      h += "<p>Nothing matches <b>" + esc(q) + "</b>.</p>";
    } else {
      if (topics.length) {
        h += "<h2>Topics</h2><ul>" + topics.map(function (t) {
          return '<li><a href="#/topic/' + t.slug + '">' + esc(t.name) + '</a> <span class="date">- ' + esc(t.about || "") + "</span></li>";
        }).join("") + "</ul>";
      }
      if (results.length) {
        h += "<h2>Articles</h2>";
        results.forEach(function (r) {
          h += '<div class="result"><div class="rtitle"><a href="#/article/' + r.a.slug + '">' + esc(r.a.title) + "</a></div>" +
            '<div class="snippet">' + snippet(r) + "</div>" +
            '<div class="meta">' + esc(r.a.topic.name) + (r.a.date ? " - " + fmtDate(r.a.date) : "") + "</div></div>";
        });
      }
    }
    content.innerHTML = h;
    document.title = "Search: " + q + " - " + SITE.name;
  }

  function route() {
    var parts = location.hash.replace(/^#\/?/, "").split("/");
    var page = parts[0] || "home", arg = "";
    try { arg = decodeURIComponent(parts.slice(1).join("/")); } catch (e) { arg = parts.slice(1).join("/"); }
    window.scrollTo(0, 0);

    if (page === "random") {
      location.replace(all.length ? "#/article/" + all[Math.floor(Math.random() * all.length)].slug : "#/");
      return;
    }
    if (page === "article") return pageArticle(arg);
    if (page === "topic") return pageTopic(arg);
    if (page === "topics") return pageTopics();
    if (page === "all") return pageAll();
    if (page === "search") return pageSearch(arg);
    pageHome();
  }

  document.getElementById("site-name").textContent = SITE.name;
  document.getElementById("site-tagline").textContent = SITE.tagline;
  document.getElementById("logo-mark").textContent = (SITE.name || "D").charAt(0).toUpperCase();
  document.getElementById("footer-text").textContent =
    "Everything on this site is just " + SITE.author + "'s opinion. Not factual, not neutral, not Wikipedia.";

  var ms = document.getElementById("main-site-link");
  if (SITE.mainSite && SITE.mainSite.url) {
    ms.href = SITE.mainSite.url;
    ms.textContent = SITE.mainSite.name;
  } else {
    ms.parentNode.style.display = "none";
  }

  document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = document.getElementById("search-input").value.trim();
    if (q) location.hash = "#/search/" + encodeURIComponent(q);
  });

  content.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-goto]") : null;
    if (!t) return;
    e.preventDefault();
    var el = document.getElementById(t.getAttribute("data-goto"));
    if (el) el.scrollIntoView();
  });

  window.addEventListener("hashchange", route);
  route();
})();
