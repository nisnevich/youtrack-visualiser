$(function () {

  let options = {
    layout: Settings.layoutType.cose,
  };

  function loadIssues(rootId, depth) {
    YouTrack.loadIssues(rootId, depth, function(issuesList) {
      // FIXME sometimes called twice
      console.log(issuesList);

      options.rootId = rootId;
      for (let issue of issuesList) {
        if (rootId === issue.project.shortName + '-' + issue.numberInProject) {
          options.rootId = issue.id;
        }
      }
      Graph.render(issuesList, options);
    });
  }

  loadIssues(Settings.getRootIssueId(), 1);


  document.onkeyup = function (e) {
    console.log(e);
    if (e.code === "KeyD") {
      toggleResolvedVisibility();
      cy.layout(options.layout).run();
    }
    if (e.code.startsWith("Digit")) {
      let depthLevel = parseInt(e.code.replace(/\D/g,''));
      loadIssues(Settings.getRootIssueId(), depthLevel);
    }
  };

  function toggleResolvedVisibility() {
    let activeNodes = [];
    cy.nodes().forEach(function (node) {
      if (node.data().issueData.resolved) {
        let isDisplayed = node.data("display");
        node.data("display", isDisplayed === "none" ? "element" : "none");
      } else {
        activeNodes.push(node);
      }
    });
    setTimeout( function() {
      cy.fit(cy.$("node[display = 'element']"), 30);
    }, 100);
  }

  function onGraphLoaded() {
    // if (!Settings.renderClosedIssues()) {
    //   toggleResolvedVisibility();
    // }
  }
});
