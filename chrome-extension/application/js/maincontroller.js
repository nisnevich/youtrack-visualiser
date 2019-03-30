var Main = (function () {

  let $dom = {
    sidebar: $(".sidebar"),
    sidebarTemplate: $("#sidebar-template"),
    graphContainer: $("#graph")
  };

  let options = {
    layout: Settings.layoutType.cose,
  };

  // fixme
  $dom.sidebar.resizable({
    handles: 'e'
  });

  let keyDown = {
    leftShift: false
  };

  function loadIssues(rootId, depth) {
    YouTrack.loadIssues(rootId, depth, function (issuesList) {
      console.log(`Loaded ${issuesList.length} issues`);
      console.log(issuesList);
      options.rootId = rootId;
      Graph.render(issuesList, options);
    });
  }

  function toggleResolvedVisibility() {
    let activeNodes = [];
    cy.nodes().forEach(function (node) {
      if (node.data().issueData.field.resolved) {
        let isDisplayed = node.data("display");
        node.data("display", isDisplayed === "none" ? "element" : "none");
      } else {
        activeNodes.push(node);
      }
    });
    setTimeout(function () {
      cy.fit(cy.$("node[display = 'element']"), 30);
    }, 100);
  }

  function showSidePanel(issueData) {
    if (!Main.$dom.sidebar.data("visible")) {
      Main.$dom.sidebar.data("visible", true);
      Main.$dom.sidebar.toggle("slide");
    }

    Main.$dom.sidebar.html(sidebarTemplate(issueData));
    Main.$dom.sidebar.removeClass("resolved unresolved");
    Main.$dom.sidebar.addClass(issueData.field.resolved ? "resolved" : "unresolved");
  }

  let sidebarTemplate = Handlebars.compile($dom.sidebarTemplate.html());
  let tappedBefore, tappedTimeout;
  let selectedNode = null;

  $(function () {
    let depthLevel = parseInt(window.location.hash.substr(1));
    loadIssues(Settings.getRootIssueId(), depthLevel ? depthLevel : 1);
  });

  return {
    $dom: $dom,
    bindings: {
      document: {
        onkeyup: function (e) {
          if (e.code === "KeyD") {
            toggleResolvedVisibility();
            cy.layout(options.layout).run();
          }
          if (e.code.startsWith("Digit")) {
            let depthLevel = parseInt(e.code.replace(/\D/g, ''));
            window.location.hash = depthLevel;
            loadIssues(Settings.getRootIssueId(), depthLevel);
          }
          if (e.code === "Space") {
            // todo select last when history implemented
            if (selectedNode) {
              Graph.node.center(selectedNode);
              showSidePanel(selectedNode.data().issueData);
            }
          }
          if (e.code === "ShiftLeft") {
            keyDown.leftShift = false;
          }
        },
        onkeydown: function(e) {
          if (e.code === "ShiftLeft") {
            keyDown.leftShift = true;
          }
          if (keyDown.leftShift && e.code === "Tab" || e.code === "Escape") {
            // todo implement nodes history
            // if ($dom.sidebar.data("visible")) {
            //   Graph.node.unselect(selectedNode);
            // } else {
            //   Graph.node.select(selectedNode);
            // }
            $dom.sidebar.data("visible", !$dom.sidebar.data("visible"));
            $dom.sidebar.toggle("slide");
          }
        }
      },
      cy: {
        tap: function (event) {
          Graph.node.unselect(selectedNode);
          selectedNode = null;

          let target = event.target;
          if (target.isNode && target.isNode()) {
            Graph.node.select(target);
            selectedNode = target;

            showSidePanel(target.data().issueData);
          } else {
            if ($dom.sidebar.data("visible")) {
              $dom.sidebar.data("visible", false);
              $dom.sidebar.toggle("slide");
            }
          }
          // double tab event is missing in default set
          if (tappedTimeout && tappedBefore) {
            clearTimeout(tappedTimeout);
          }
          if (tappedBefore === target) {
            this.trigger('doubleTap', target);
            tappedBefore = null;
          } else {
            tappedTimeout = setTimeout(function () {
              tappedBefore = null;
            }, Settings.defaults.doubleClickTimeout);
            tappedBefore = target;
          }
        },
        doubleTap: function(event, target) {
          if (event) {
            Graph.node.center(target);
          }
        },
        cxtmenu: {
          node_commands: [
            {
              content: '<span class="fa fa-flash fa-2x">YouTrack</span>',
              select: function (ele) {
                window.open("https://youtrack.jetbrains.com/issue/" + ele.id());
              }
            },

            {
              content: '<span class="fa fa-star fa-2x">Log Info</span>',
              select: function (ele) {
                console.log(ele.data());
              },
              enabled: true
            },

            {
              content: 'Load in new tab',
              select: function (ele) {
                Settings.setRootIssueId(ele.data().id);
                window.open("index.html");
              }
            }
          ],
          core_commands: [
            {
              content: 'Find selected',
              select: function (ele) {
                if (selectedNode)
                  Graph.node.center(selectedNode);
              }
            },
            {
              content: 'Find root',
              select: function (ele) {
                Graph.node.center(ele.filter("node.central"));
              }
            }
          ]
        }
      }
    }
  }
})();
