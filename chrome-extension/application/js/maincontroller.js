var Main = (function () {

  let $dom = {
    sidebar: {
      panel: $(".sidebar"),
      content: $(".sidebar > .content"),
      resizer: $(".sidebar > .resizer")
    },
    sidebarTemplate: $("#sidebar-template"),
    graphContainer: $("#graph")
  };

  let options = {
    layout: Settings.layoutType.cose,
  };

  let keyDown = {
    shiftLeft: false,
    ctrlLeft: false,
    altLeft: false,
    metaLeft: false,
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
    if (!Main.$dom.sidebar.panel.data("visible")) {
      toggleSidePanel();
    }

    Main.$dom.sidebar.content.html(sidebarTemplate(issueData));
    Main.$dom.sidebar.panel.removeClass("resolved unresolved");
    Main.$dom.sidebar.panel.addClass(issueData.field.resolved ? "resolved" : "unresolved");
  }

  function toggleSidePanel() {
    $dom.sidebar.panel.data("visible", !$dom.sidebar.panel.data("visible"));
    $dom.sidebar.panel.toggle("slide");
  }

  function resize(e) {
    let left = $dom.sidebar.panel.get(0).getBoundingClientRect().left;
    $dom.sidebar.panel.css("width", e.pageX - left + 'px');
    $("body").css("cursor", "col-resize");
  }

  function stopResize() {
    window.removeEventListener('mousemove', resize);
    $("body").css("cursor", "auto");
  }

  $dom.sidebar.resizer.mousedown(function(e) {
    e.preventDefault();
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
  });

  let sidebarTemplate = Handlebars.compile($dom.sidebarTemplate.html());
  let windowKeyListener = new window.keypress.Listener();
  let tappedBefore, tappedTimeout;
  let selectedNode = null;

  $(function () {
    let depthLevel = parseInt(window.location.hash.substr(1));
    loadIssues(Settings.getRootIssueId(), depthLevel ? depthLevel : 1);
  });

  // doc: http://dmauro.github.io/Keypress/
  // key names: https://github.com/dmauro/Keypress/blob/master/keypress.coffee#L757-864
  windowKeyListener.register_many([{
      "keys": "alt r",
      "is_exclusive": true,
      "prevent_default": true,
      "on_keyup": function (event) {
        toggleResolvedVisibility();
        cy.layout(options.layout).run();
      }
    },
    {
      "keys": "space",
      "is_exclusive": true,
      "prevent_default": true,
      "on_keyup": function (event) {
        // todo select last when history implemented
        if (selectedNode) {
          Graph.node.center(selectedNode);
          showSidePanel(selectedNode.data().issueData);
        }
      }
    },
    {
      "keys": "escape",
      "is_exclusive": true,
      "prevent_default": true,
      "on_keyup": function (event) {
        toggleSidePanel();
      }
    },
    {
      "keys": "shift tab",
      "is_exclusive": true,
      "prevent_default": true,
      "on_keyup": function (event) {
        toggleSidePanel();
      }
    }
  ]);

  return {
    $dom: $dom,
    bindings: {
      document: {
        onkeyup: function (e) {
          if (e.code.startsWith("Digit")) {
            let depthLevel = parseInt(e.code.replace(/\D/g, ''));
            window.location.hash = depthLevel;
            loadIssues(Settings.getRootIssueId(), depthLevel);
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
            if ($dom.sidebar.panel.data("visible")) {
              $dom.sidebar.panel.data("visible", false);
              $dom.sidebar.panel.toggle("slide");
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
