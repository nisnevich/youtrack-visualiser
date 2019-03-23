var Graph = (function () {

  // todo optimise http://js.cytoscape.org/#performance/optimisations

  // http://js.cytoscape.org/#layouts/preset

  function render(issuesList, options) {
    let nodes = [], edges = [];
    for (let key in issuesList) {
      let issue = issuesList[key];

      let node = {
        data: {
          label: issue.summary,
          name: issue.project.shortName + '-' + issue.numberInProject,
          id: issue.id,
          depthLevel: issue.depthLevel,
          issueData: issue,
          display: "element"
        },
        classes: 'bottom-center multiline-auto'
      };
      nodes.push(node);

      for (let key in issue.links) {
        let link = issue.links[key];
        if (link.issues.length === 0) continue;

        for (let key in link.issues) {
          let linkedIssue = link.issues[key];

          let edgeData = {
            direction: link.direction,
            linkType: link.linkType
          };
          if (link.direction === "OUTWARD") {
            edgeData.source = linkedIssue.id;
            edgeData.target = issue.id;
          } else {
            // either not directed or "OUTWARD"
            edgeData.source = issue.id;
            edgeData.target = linkedIssue.id;
          }

          let duplicateEdge = false;
          for (let edge of edges) {
            let t = edge.data.source === edgeData.source
                && edge.data.target === edgeData.target
                || edge.data.source === edgeData.target
                && edge.data.target === edgeData.source;
            if (t) {
              duplicateEdge = true;
            }
          }
          let existingSource = false, existingTarget = false;
          for (let node of nodes) {
            if (node.data.id === edgeData.source) {
              existingSource = true;
            }
            if (node.data.id === edgeData.target) {
              existingTarget = true;
            }
          }
          if (!duplicateEdge && existingSource && existingTarget) {
            edges.push({data: edgeData});
          }
        }
      }
    }

    {
      function getNodeSize(votesCount) {
        if (votesCount === 0) {
          return Settings.defaults.minNodeSize;
        }
        if (votesCount > Settings.defaults.maxVotesMatter) {
          votesCount = Settings.defaults.maxVotesMatter;
        }
        let multiplier = 3; // 2, 3 or 4
        let number = Math.round(Math.log(votesCount) * multiplier);
        let nodeSizeDiff = Settings.defaults.maxNodeSize - Settings.defaults.minNodeSize;

        let denominator = (Math.log(Settings.defaults.maxVotesMatter) * multiplier);
        return Math.floor(number * nodeSizeDiff / denominator) + Settings.defaults.minNodeSize;
      }

      function interpolateColors(color1, color2, steps) {
        let interpolateColor = function (color1, color2, factor) {
          let result = color1.slice();
          for (let i = 0; i < 3; i++) {
            result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
          }
          return result;
        };
        let stepFactor = 1 / (steps - 1), colors = [];
        color1 = color1.match(/\d+/g).map(Number);
        color2 = color2.match(/\d+/g).map(Number);

        for (let i = 0; i < steps; i++) {
          let color = interpolateColor(color1, color2, stepFactor * i);
          colors.push(`rgb(${color[0]},${color[1]},${color[2]})`);
        }
        return colors;
      }

      let colors = interpolateColors(Settings.defaults.colorMin, Settings.defaults.colorMax,
          Settings.defaults.maxNodeSize - Settings.defaults.minNodeSize + 1);

      for (let node of nodes) {
        let nodeSize = getNodeSize(node.data.issueData.votes);
        node.data.width = nodeSize;
        node.data.height = nodeSize;

        if (node.data.issueData.resolved) {
          node.classes += " resolved";
        } else {
          node.data.color = colors[nodeSize - Settings.defaults.maxNodeSize + Settings.defaults.minNodeSize];
          console.log(nodeSize - Settings.defaults.maxNodeSize + Settings.defaults.minNodeSize);
        }

        if (node.data.id === options.rootId) {
          node.classes += " central";
        }
      }

      for (let edge of edges) {
        // http://js.cytoscape.org/#style/edge-line
        // http://js.cytoscape.org/#style/edge-arrow
        switch (edge.data.linkType.name) {
          default:
            console.log("Unknown link type: " + name);
            // TODO link types
          case "Relates":
          case "Folllowed":
          case "Reused in":
          case "Leads to":
            break;
          case "Depend":
            break;
          case "Duplicate":
            edge["classes"] = "duplicate";
            break;
          case "Subtask":
            // edge.data["target-arrow-shape"] = "diamond";
            break;
          case "Similar":

            break;
          case "Cause": // fixed by/also fixes

            break;
        }
      }
    }

    // http://js.cytoscape.org/#init-opts/container
    window.cy = cytoscape({
      container: document.getElementById('graph'),

      layout: options.layout,

      style: fetch('css/cy-style.json').then(function (res) {
        return res.json();
      }),

      elements: {
        nodes: nodes,
        edges: edges
      },
      boxSelectionEnabled: true,
      // enable if performance needed:
      hideEdgesOnViewport: false,
      textureOnViewport: false,
      motionBlur: false,
      motionBlurOpacity: 0.5,
    });

    // TODO make nodes hidden by default
    // cy.ready(onGraphLoaded);

    // cy.on('tap', 'node', function () {
    //   let nodes = this;
    //   let basicDepth = this.data.depthLevel;
    //
    //   let tapped = nodes;
    //   let food = [];
    //
    //   nodes.addClass('eater');
    //
    //   for (; ;) {
    //     let connectedEdges = nodes.connectedEdges(function (el) {
    //       return !el.target().anySame(nodes);
    //     });
    //
    //     let connectedNodes = connectedEdges.targets('node[depthLevel=]');
    //
    //     Array.prototype.push.apply(food, connectedNodes);
    //
    //     nodes = connectedNodes;
    //
    //     if (nodes.empty()) {
    //       break;
    //     }
    //   }
    //
    //   let delay = 0;
    //   let duration = 500;
    //   for (let i = food.length - 1; i >= 0; i--) {
    //     (function () {
    //       let thisFood = food[i];
    //       let eater = thisFood.connectedEdges(function (el) {
    //         return el.target().same(thisFood);
    //       }).source();
    //
    //       thisFood.delay(delay, function () {
    //         eater.addClass('eating');
    //       }).animate({
    //         position: eater.position(),
    //         css: {
    //           'width': 10,
    //           'height': 10,
    //           'border-width': 0,
    //           'opacity': 0
    //         }
    //       }, {
    //         duration: duration,
    //         complete: function () {
    //           thisFood.remove();
    //         }
    //       });
    //
    //       delay += duration;
    //     })();
    //   }
    // });

    cy.cxtmenu({
      selector: 'node, node[label]',

      commands: [
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
          content: 'Text',
          select: function (ele) {
            console.log(ele.position());
          }
        }
      ]
    });

    cy.cxtmenu({
      selector: 'core',

      commands: [
        {
          content: 'bg1',
          select: function () {
            console.log('bg1');
          }
        },

        {
          content: 'bg2',
          select: function () {
            console.log('bg2');
          }
        }
      ]
    });

  }

  return {
    render: render
  }
})();