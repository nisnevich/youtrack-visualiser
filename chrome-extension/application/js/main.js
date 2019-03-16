$(function () {

  YOUTRACK.loadIssues(localStorage["rootIssueId"] || "IDEA-106716", function(issuesList) {
    // FIXME sometimes called twice
    console.log(issuesList);
    GRAPH.render(issuesList);
  })
});
