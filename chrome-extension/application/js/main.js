$(function () {

  let depthLevel = 1;
  YouTrack.loadIssues(Settings.getRootIssueId() || "IDEA-106716", depthLevel, function(issuesList) {
    // FIXME sometimes called twice
    console.log(issuesList);
    Graph.render(issuesList);
  })
});
