topic("Topic Name", {
  group: "Group Name",
  about: "One line about the topic.",
  articles: [
    {
      title: "Article title",
      date: "2026-01-01",
      also: ["Another Topic"],
      info: { image: "images/pic.jpg", caption: "Caption", "My rating": "9/10" },
      body: `
Text here. **bold**, *italic*, [link](https://example.com), [[Other Article]].

## Heading
More text.
      `,
      sub: [
        { title: "Sub-article title", body: `Text.` }
      ]
    }
  ]
});
