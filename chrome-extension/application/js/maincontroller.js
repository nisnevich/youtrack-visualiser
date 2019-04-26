var Main = (function () {

  let $dom = {
    sidebar: {
      panel: $(".sidebar"),
      content: $(".sidebar > .content"),
      resizer: $(".sidebar > .resizer")
    },
    sidebarTemplate: $("#sidebarTemplate"),
    graphContainer: $("#graph"),
    search: {
      container: $(".searchContainer"),
      field: $(".searchContainer").find("input[type='text']"),
      resultsContainer: $(".searchResultsContainer"),
      resultsTemplate: $("#searchResultTemplate")
    }
  };

  let options = {
    layout: Settings.renderNodeLabels() ? Settings.layoutType.coseBilkent.usual : Settings.layoutType.coseBilkent.noLabels,
  };

  let keyDown = {
    ctrl: false,
  };

  function loadIssues(rootId, depth) {
    YouTrack.loadIssues(rootId, depth, function (issuesList) {
      console.log(`Loaded ${issuesList.length} issues`);
      console.log(issuesList);
      options.issuesList = issuesList;
      options.rootId = rootId;
      options.depth = depth;
      Graph.render(options);
    });
  }

  function toggleResolvedVisibility() {
    Settings.setRenderClosedIssues(!Settings.renderClosedIssues());
    Graph.render(options);
  }

  function toggleLabels() {
    Settings.setRenderNodeLabels(!Settings.renderNodeLabels());
    cy.nodes().forEach(function (node) {
      node.data("label", Settings.renderNodeLabels() ? node.data().issueData.field.summary.value : "");
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

  $dom.sidebar.resizer.mousedown(function (e) {
    let resize = function (e) {
      let left = $dom.sidebar.panel.get(0).getBoundingClientRect().left;
      $dom.sidebar.panel.css("width", e.pageX - left + 'px');
      $("body").css("cursor", "col-resize");
    };
    let stopResize = function () {
      window.removeEventListener('mousemove', resize);
      $("body").css("cursor", "auto");
    };
    e.preventDefault();
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
  });

  let sidebarTemplate = Handlebars.compile($dom.sidebarTemplate.html());
  let searchTemplate = Handlebars.compile($dom.search.resultsTemplate.html());
  let windowKeyListener = new window.keypress.Listener();
  let nonTypingKeyListener = new window.keypress.Listener();
  let tappedBefore, tappedTimeout;
  let selectedNode = null;
  let watchingNode = null;

  $(function () {
    let depthLevel = parseInt(window.location.hash.substr(1));
    loadIssues(Settings.getRootIssueId(), depthLevel ? depthLevel : 1);
  });

  // doc: http://dmauro.github.io/Keypress/
  // key names: https://github.com/dmauro/Keypress/blob/master/keypress.coffee#L757-864
  windowKeyListener.register_many([
    {
      "keys": "ctrl r",
      "on_keyup": function (event) {
        toggleResolvedVisibility();
      }
    },
    {
      "keys": "ctrl l",
      "on_keyup": function (event) {
        toggleLabels();
        options.layout = Settings.renderNodeLabels() ? Settings.layoutType.coseBilkent.usual : Settings.layoutType.coseBilkent.noLabels;
        cy.layout(options.layout).run();
      }
    },
    {
      "keys": "escape",
      "prevent_default": true,
      "on_keyup": function (event) {
        toggleSidePanel();
      }
    },
    {
      "keys": "shift tab",
      "prevent_default": true,
      "on_keyup": function (event) {
        toggleSidePanel();
      }
    },
    {
      "keys": "meta shift right",
      is_unordered: true,
      "on_keydown": function (event) {
        let width = parseInt($dom.sidebar.panel.css("width"));
        $dom.sidebar.panel.css("width", width + Settings.defaults.resizeOffset + 'px');
      }
    },
    {
      "keys": "meta shift left",
      is_unordered: true,
      "on_keydown": function (event) {
        let width = parseInt($dom.sidebar.panel.css("width"));
        $dom.sidebar.panel.css("width", width - Settings.defaults.resizeOffset + 'px');
      }
    },
    {
      "keys": "control",
      "on_keydown": function (event) {
        keyDown.ctrl = true;
      },
      "on_keyup": function (event) {
        keyDown.ctrl = false;
      },
    }
  ]);

  windowKeyListener.register_many([
    {
      "keys": "down",
      "prevent_default": true,
      "on_keydown": function (event) {
        // todo implement custom scrollbars, and scrolling will reset on container update
        $dom.sidebar.panel.scrollTop(-$dom.sidebar.content.offset().top + Settings.defaults.scrollOffset.usual);
      }
    },
    {
      "keys": "up",
      "prevent_default": true,
      "on_keydown": function (event) {
        $dom.sidebar.panel.scrollTop(-$dom.sidebar.content.offset().top - Settings.defaults.scrollOffset.usual);
      }
    },
    {
      "keys": "alt down",
      "prevent_default": true,
      "on_keydown": function (event) {
        $dom.sidebar.panel.animate({
          scrollTop: -$dom.sidebar.content.offset().top + Settings.defaults.scrollOffset.fast
        }, 200);
      }
    },
    {
      "keys": "alt up",
      "prevent_default": true,
      "on_keydown": function (event) {
        $dom.sidebar.panel.animate({
          scrollTop: -$dom.sidebar.content.offset().top - Settings.defaults.scrollOffset.fast
        }, 200);
      }
    },
    {
      "keys": "command down",
      "prevent_default": true,
      "on_keydown": function (event) {
        $dom.sidebar.panel.scrollTop(parseInt($dom.sidebar.content.css("height")));
      }
    },
    {
      "keys": "command up",
      "prevent_default": true,
      "on_keydown": function (event) {
        $dom.sidebar.panel.scrollTop(0);
      }
    }
  ]);

  nonTypingKeyListener.register_many([
    {
      "keys": "right",
      "on_keyup": function (event) {
        switchToRelated(true);
      }
    },
    {
      "keys": "left",
      "on_keyup": function (event) {
        switchToRelated(false);
      }
    },
    {
      "keys": "space",
      "on_keyup": function (event) {
        // todo select last when history implemented
        if (selectedNode) {
          Graph.node.center(selectedNode);
          showSidePanel(selectedNode.data().issueData);
        }
      }
    },
    {
      "keys": "backspace",
      "prevent_default": true,
      "on_keydown": function (event) {
        if ($dom.search.container.is(":visible")) {
          $dom.search.field.val(function (i, val) {
            return val.substr(0, val.length - 1);
          });
          $dom.search.field.focus();
          search();
        }
      }
    }
  ]);

  $dom.search.field.focus(function () {
    nonTypingKeyListener.stop_listening()
  });

  $dom.search.field.focusout(function () {
    nonTypingKeyListener.listen();
  });

  $dom.search.field.on('input', function(e) {
    search();
  });

  function search() {
    let inputValue = Main.$dom.search.field.val();
    if (inputValue.length === 0) {
      Main.$dom.search.container[Settings.defaults.animation.searchShowing.type](Settings.defaults.animation.searchShowing.options);
    }
    let fuse = new Fuse(options.issuesList, Settings.defaults.searchOptions);
    let searchResult = fuse.search(inputValue);
    Main.$dom.search.resultsContainer.html(searchTemplate(searchResult));
  }

  function switchToRelated(clockWise) {
    let getConnectedNode = function (edge, node) {
      return edge.filter("node[display = 'element'][id != '" + node.data().id + "']");
    };

    if (!selectedNode) return;
    let connectedEdges = selectedNode.connectedEdges("edge:visible");
    for (let i = 0; i < connectedEdges.length; i++) {
      let nodes = connectedEdges[i].connectedNodes();
      let connectedNode = getConnectedNode(nodes, selectedNode);
      if (!watchingNode) {
        watchingNode = connectedNode;
        Graph.node.select(watchingNode);
        Graph.node.center(watchingNode);
        showSidePanel(watchingNode.data().issueData);
        break;
      } else if (watchingNode.data().id === connectedNode.data().id) {
        let index;
        if (clockWise) {
          index = i + 1 === connectedEdges.length ? 0 : i + 1;
        } else {
          index = i - 1 === -1 ? connectedEdges.length - 1 : i - 1;
        }
        Graph.node.unselect(watchingNode);
        watchingNode = getConnectedNode(connectedEdges[index].connectedNodes(), selectedNode);
        Graph.node.select(watchingNode);
        Graph.node.center(watchingNode);
        showSidePanel(watchingNode.data().issueData);
        break;
      }
    }
  }

  return {
    $dom: $dom,
    bindings: {
      document: {
        onkeyup: function (e) {
          if (keyDown.ctrl && e.code.startsWith("Digit")) {
            let depthLevel = parseInt(e.code.replace(/\D/g, ''));
            window.location.hash = depthLevel;
            loadIssues(Settings.getRootIssueId(), depthLevel);
          } else if (e.key.length === 1 && !$dom.search.field.is(":focus")) {
            // TODO investigate quick typing problem; focus is gained to the input normally!
            $dom.search.field.val(function (i, val) {
              return val + e.key;
            });
            if (!$dom.search.container.is(":visible")) {
              $dom.search.container[Settings.defaults.animation.searchShowing.type](Settings.defaults.animation.searchShowing.options);
            }
            $dom.search.field.focus();
            search();
          }
        }
      },
      cy: {
        tap: function (event) {
          Graph.node.unselect(selectedNode);
          Graph.node.unselect(watchingNode);
          selectedNode = null;
          watchingNode = null;

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
        doubleTap: function (event, target) {
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
