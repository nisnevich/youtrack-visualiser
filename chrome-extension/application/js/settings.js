var Settings = (function(){
  let renderResolvedNodesLimit = 100;

  let keys = {
    renderResolved: "renderResolved",
    rootIssueId: "rootIssueId",
  };

  return {
    defaults: {
      padding: 30,

      minNodeSize: 30,
      maxNodeSize: 60,
      sidebarRelativeSize: 0.3,
      // colorMin: "#4298CC",
      // colorMax: "#5C38D4",
      colorMin: "rgb(66,152,204)", // #4298CC
      colorMax: "rgb(62,121,227)",
      maxVotesMatter: 100,

      doubleClickTimeout: 600,

      animation: {
        center: {
          duration: 500,
          easing: "ease-out-expo",
          zoom: 0.8
        }
      }
    },
    getRootIssueId: function(){
      return localStorage[keys.rootIssueId];
    },
    setRootIssueId: function (value) {
      localStorage[keys.rootIssueId] = value;
    },
    renderClosedIssues: function () {
      let storageValue = localStorage[keys.renderResolved];
      if (storageValue === undefined || storageValue === null) {
        if (localStorage["nodesAmount"] && localStorage["nodesAmount"] > renderResolvedNodesLimit) {
          console.log("Resolved issues not displayed: too much nodes.");
          return false;
        }
        return false;
      }
      return storageValue !== "false";
    },
    setRenderClosedIssues: function(value) {
      localStorage[keys.renderResolved] = Boolean(value);
    },
    layoutType: {
      euler: {
        name: 'euler',
        randomize: true,
        animate: false,
        springLength: 500
      },
      breadthfirst: { // http://js.cytoscape.org/#style/edge-line
        name: 'breadthfirst',
        fit: true, // whether to fit the viewport to the graph
        padding: 30, // padding on fit
        spacingFactor: 1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm

        grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
        circle: false, // put depths in concentric circles if true, put depths top down if false
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        roots: undefined, // the roots of the trees
        maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
        directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
      },
      cose: {
        name: 'cose',

        // Called on `layoutready`
        ready: function () {
        },

        // Called on `layoutstop`
        stop: function () {
        },

        // Whether to animate while running the layout
        // true : Animate continuously as the layout is running
        // false : Just show the end result
        // 'end' : Animate with the end result, from the initial positions to the end positions
        animate: false,

        // Easing of the animation for animate:'end'
        animationEasing: undefined,

        // The duration of the animation for animate:'end'
        animationDuration: undefined,

        // A function that determines whether the node should be animated
        // All nodes animated by default on animate enabled
        // Non-animated nodes are positioned immediately when the layout starts
        animateFilter: function (node, i) {
          return true;
        },

        // The layout animates only after this many milliseconds for animate:true
        // (prevents flashing on fast runs)
        animationThreshold: 250,

        // Number of iterations between consecutive screen positions update
        refresh: 20,

        // Whether to fit the network view after when done
        fit: true,

        // Padding on fit
        padding: 30,

        // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        boundingBox: undefined,

        // Excludes the label when calculating node bounding boxes for the layout algorithm
        nodeDimensionsIncludeLabels: true,

        // Randomize the initial positions of the nodes (true) or use existing positions (false)
        randomize: false,

        // Extra spacing between components in non-compound graphs
        componentSpacing: 40,

        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: function (node) {
          return 2048;
        },

        // Node repulsion (overlapping) multiplier
        nodeOverlap: 40,

        // Ideal edge (non nested) length
        idealEdgeLength: function (edge) {
          return 20;
        },

        // Divisor to compute edge forces
        edgeElasticity: function (edge) {
          return 100;
        },

        // Nesting factor (multiplier) to compute ideal edge length for nested edges
        nestingFactor: 1.2,

        // Gravity force (constant)
        gravity: 1000,

        // Maximum number of iterations to perform
        numIter: 1000,

        // Initial temperature (maximum node displacement)
        initialTemp: 1000,

        // Cooling factor (how the temperature is reduced between consecutive iterations
        coolingFactor: 0.9,

        // Lower temperature threshold (below this point the layout will end)
        minTemp: 1.0,

        // Pass a reference to weaver to use threads for calculations
        weaver: false
      },
      concentric: {
        name: 'concentric',

        fit: true, // whether to fit the viewport to the graph
        padding: 30, // the padding on fit
        startAngle: 3 / 2 * Math.PI, // where nodes start in radians
        sweep: undefined, // how many radians should be between the first and last node (Settings.defaults to full circle)
        clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
        equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
        minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
        height: undefined, // height of layout area (overrides container height)
        width: undefined, // width of layout area (overrides container width)
        spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        concentric: function (node) { // returns numeric value for each node, placing higher nodes in levels towards the centre
          return node.degree();
        },
        levelWidth: function (nodes) { // the letiation of concentric values in each level
          return nodes.maxDegree() / 4;
        },
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        animateFilter: function (node, i) {
          return true;
        }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position) {
          return position;
        } // transform a given node position. Useful for changing flow direction in discrete layouts
      }
    }
  }
})();