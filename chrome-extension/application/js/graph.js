var Graph = (function () {

  // todo optimise http://js.cytoscape.org/#performance/optimisations
  // todo implement jqueryui features: https://jqueryui.com/download/#!version=1.12.1&components=100100000000001000000000010000001000000000000010&zThemeParams=5d000001001406000000000000003d8888d844329a8dfe02723de3e5701dc2cb2be0d98fe676bb46e85f3b85ff2d347a9c5170a6c17a4a3d926b08b9d199c4e573fcbf9cc1a2dd092a9d80b6fda5395ff84763f9e74d6cee21250c8f33243ef1589abab919cf7e8298f8769fec181781bf142e5e800e171d39cdf17e9a71fa3f781e8d76766b23c44b6d7f1e75c1abeef4410d820c31ef0620d79195b33d4cfc1e768094ce05fee304b2ad41db26904aed74c8c374ce1ff1c0a5c42f56dac08ad8961127638038b61b2703209b4091d7fb93a47a1d3e43a67c5a94b7e29c959f13c24559cb1a76b1bec1a71f1949db710f4557f3d1da2d39f90aff28f2b6ba8dd96ed5f5a0015166ef5567f70537d248d57b05c70e4fcc5845d9e1610b45d0d394c32ba0d5f992c00dca92aefe65863782767fcedea56a04e59e78457e74c5f1b23fdcd98c0b6bf4dbbe623d93fcb961477a3b6ff6f49245a0d75647ac7dcf1c860ed9882370de9a120924b3eaa4d72b858c41bd8bfbc944508a9fda3a42ff055dfa6e2ef96330dff48fe7a403db64306e0229493b498532edda2985338cbfd2dca06a59153f6300753623a533e25248b8dca8c2261083a9ebf73103a260168b2f957d138e17a4c80b5a901f1b748cff996db44f467265f09d1234456b9819fee221715dc98870f7e120db924d76acd66a3c270b2ee627140195c5c9e869d89c5acdf9330a84af5ae2c6c31792faa3aa55240bbecb844cb72dc1718194fff63506a7

  // http://js.cytoscape.org/#layouts/preset

  function render(issuesList, options) {
    let nodes = [], edges = [];
    for (let issue of issuesList) {

      let node = {
        data: {
          label: issue.field.summary.value,
          id: issue.id,
          depthLevel: issue.depthLevel,
          issueData: issue,
          display: "element"
          // todo make labels clickable http://js.cytoscape.org/#style/events
        },
        classes: 'bottom-center multiline-auto'
      };
      nodes.push(node);

      for (let link of issue.field.links.value) {
        let edgeData = {
          linkType: link.type,
          // fixme when youtrack adds 'direction'
          source: issue.id,
          target: link.value
        };

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
        let nodeSize = getNodeSize(parseInt(node.data.issueData.field.votes.value));
        node.data.width = nodeSize;
        node.data.height = nodeSize;

        if (node.data.issueData.field.resolved) {
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
        switch (edge.data.linkType) {
          default:
            console.log("Unknown link type: " + edge.data.linkType);
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
      container: Main.$dom.graphContainer,

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
    // cy.ready(function(){});


    cy.on('tap', Main.bindings.cy.tap);
    cy.on('doubleTap', Main.bindings.cy.doubleTap);
    document.onkeyup = Main.bindings.document.onkeyup;
    document.onkeydown = Main.bindings.document.onkeydown;

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
      commands: Main.bindings.cy.cxtmenu.node_commands
    });
    cy.cxtmenu({
      selector: 'edge',
      commands: Main.bindings.cy.cxtmenu.core_commands
    });
    cy.cxtmenu({
      selector: 'core',
      commands: Main.bindings.cy.cxtmenu.core_commands
    });

    cy.on('mouseover', 'node', () => Main.$dom.graphContainer.addClass('mouseover'));
    cy.on('mouseout', 'node', () => Main.$dom.graphContainer.removeClass('mouseover'));
  }

  return {
    render: render,
    node: {
      select: function(node) {
        node.addClass("selected");
      },
      unselect: function(node) {
        if (node) {
          node.removeClass("selected");
        }
      },
      center: function(node) {
        cy.animate({
          center: {
            eles: node
          },
          easing: Settings.defaults.animation.center.easing,
          zoom: Settings.defaults.animation.center.zoom
        }, {
          duration: Settings.defaults.animation.center.duration
        });
      },
    }
  }
})();