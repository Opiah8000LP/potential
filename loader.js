function topic(name, data) {
  data.name = name;
  TOPICS.push(data);
}

TOPIC_FILES.forEach(function (f) {
  document.write('<script src="topics/' + f + '.js"><\/script>');
});
