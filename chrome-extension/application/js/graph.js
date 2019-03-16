var GRAPH = (function(){

  // http://js.cytoscape.org/#layouts/preset

  var layout = {
  name: 'euler',
      randomize: true,
      animate: false,
      springLength: 500
};

  // var layout = {
  //   name: 'breadthfirst',
  //   fit: true, // whether to fit the viewport to the graph
  //   padding: 30, // padding on fit
  //   spacingFactor: 1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
  //   nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
  //
  //   grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
  //   circle: false, // put depths in concentric circles if true, put depths top down if false
  //   avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  //   roots: undefined, // the roots of the trees
  //   maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
  //   directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
  // };

  function render(issuesList) {
    let nodes = [], edges = [];
    for (let key in issuesList) {
      let issue = issuesList[key];
      let node = {
        data: {
          label: issue.summary,
          name: issue.project.shortName + '-' + issue.numberInProject,
          id: issue.id
        },
        classes: 'bottom-center multiline-auto'
      };
      nodes.push(node);

      for (let key in issue.links) {
        let link = issue.links[key];
        if (link.issues.length === 0) continue;

        for (let key in link.issues) {
          let linkedIssue = link.issues[key];

          let edgeData;
          if (!link.linkType.directed) {
            edgeData = {
              source: issue.id,
              target: linkedIssue.id
            }
          } else if (link.direction === "INWARD") {
            edgeData = {
              source: linkedIssue.id,
              target: issue.id
            }
          } else {
            edgeData = {
              source: issue.id,
              target: linkedIssue.id
            }
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

    console.log(nodes);
    console.log(edges);

    // http://js.cytoscape.org/#init-opts/container
    window.cy = cytoscape({
      container: document.getElementById('graph'),

      boxSelectionEnabled: false,
      autounselectify: true,

      layout: layout,

      style: [
        {
          "selector": "node[label]",
          "style": {
            "label": "data(label)"
          }
        },

        {
          "selector": "edge[label]",
          "style": {
            "label": "data(label)",
            "width": 3
          }
        },

        {
          "selector": ".top-left",
          "style": {
            "text-valign": "top",
            "text-halign": "left"
          }
        },

        {
          "selector": ".top-center",
          "style": {
            "text-valign": "top",
            "text-halign": "center"
          }
        },

        {
          "selector": ".top-right",
          "style": {
            "text-valign": "top",
            "text-halign": "right"
          }
        },

        {
          "selector": ".center-left",
          "style": {
            "text-valign": "center",
            "text-halign": "left"
          }
        },

        {
          "selector": ".center-center",
          "style": {
            "text-valign": "center",
            "text-halign": "center"
          }
        },

        {
          "selector": ".center-right",
          "style": {
            "text-valign": "center",
            "text-halign": "right"
          }
        },

        {
          "selector": ".bottom-left",
          "style": {
            "text-valign": "bottom",
            "text-halign": "left"
          }
        },

        {
          "selector": ".bottom-center",
          "style": {
            "text-valign": "bottom",
            "text-halign": "center"
          }
        },

        {
          "selector": ".bottom-right",
          "style": {
            "text-valign": "bottom",
            "text-halign": "right"
          }
        },

        {
          "selector": ".multiline-manual",
          "style": {
            "text-wrap": "wrap"
          }
        },

        {
          "selector": ".multiline-auto",
          "style": {
            "text-wrap": "wrap",
            "text-max-width": 160
          }
        },

        {
          "selector": ".autorotate",
          "style": {
            "edge-text-rotation": "autorotate"
          }
        },

        {
          "selector": ".background",
          "style": {
            "text-background-opacity": 1,
            "color": "#fff",
            "text-background-color": "#888",
            "text-background-shape": "roundrectangle",
            "text-border-color": "#000",
            "text-border-width": 1,
            "text-border-opacity": 1
          }
        },

        {
          "selector": ".outline",
          "style": {
            "color": "#fff",
            "text-outline-color": "#888",
            "text-outline-width": 3
          }
        }
      ],

      elements: {
        nodes: nodes,
        edges: edges
      }
    });

    cy.on('tap', 'node', function () {
      let nodes = this;
      let tapped = nodes;
      let food = [];

      nodes.addClass('eater');

      for (; ;) {
        let connectedEdges = nodes.connectedEdges(function (el) {
          return !el.target().anySame(nodes);
        });

        let connectedNodes = connectedEdges.targets();

        Array.prototype.push.apply(food, connectedNodes);

        nodes = connectedNodes;

        if (nodes.empty()) {
          break;
        }
      }

      let delay = 0;
      let duration = 500;
      for (let i = food.length - 1; i >= 0; i--) {
        (function () {
          let thisFood = food[i];
          let eater = thisFood.connectedEdges(function (el) {
            return el.target().same(thisFood);
          }).source();

          thisFood.delay(delay, function () {
            eater.addClass('eating');
          }).animate({
            position: eater.position(),
            css: {
              'width': 10,
              'height': 10,
              'border-width': 0,
              'opacity': 0
            }
          }, {
            duration: duration,
            complete: function () {
              thisFood.remove();
            }
          });

          delay += duration;
        })();
      }
    });

    cy.cxtmenu({
      selector: 'node, edge',

      commands: [
        {
          content: '<span class="fa fa-flash fa-2x"></span>',
          select: function(ele){
            console.log( ele.id() );
          }
        },

        {
          content: '<span class="fa fa-star fa-2x"></span>',
          select: function(ele){
            console.log( ele.data('id') );
          },
          enabled: false
        },

        {
          content: 'Text',
          select: function(ele){
            console.log( ele.position() );
          }
        }
      ]
    });

    cy.cxtmenu({
      selector: 'core',

      commands: [
        {
          content: 'bg1',
          select: function(){
            console.log( 'bg1' );
          }
        },

        {
          content: 'bg2',
          select: function(){
            console.log( 'bg2' );
          }
        }
      ]
    });

  }

  return {
    render: render
  }
})();