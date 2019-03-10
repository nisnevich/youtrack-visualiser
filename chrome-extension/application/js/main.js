// perm:QXJzZW5peS5OaXNuZXZpY2g=.TGluayBWaXN1YWxpc2F0aW9u.rSpdZZ5hwZsVbzXc5EZ07gMCcQlNT9
$(function () {

  YOUTRACK.loadIssues(localStorage["rootIssueId"] || "IDEA-106716", function(issuesList) {
    // FIXME sometimes called twice when reloading page
    console.log(issuesList);
    GRAPH.render(issuesList);
  })
});