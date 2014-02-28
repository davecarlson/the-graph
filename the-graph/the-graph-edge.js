(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  // Const
  var CURVE = TheGraph.nodeSize;


  // Edge view

  TheGraph.Edge = React.createClass({
    mixins: [
      TheGraph.mixins.Tooltip,
      TheGraph.mixins.SavePointer
    ],
    componentWillMount: function() {
    },
    componentDidMount: function () {
      // Context menu
      this.getDOMNode().addEventListener("pointerdown", this.stopPropagationSecondary);
      this.getDOMNode().addEventListener("pointerup", this.stopPropagationSecondary);
      this.getDOMNode().addEventListener("contextmenu", this.showContext);
      this.getDOMNode().addEventListener("hold", this.showContext);
    },
    stopPropagationSecondary: function (event) {
      // HACK to not tap graph
      if (event.buttons && event.buttons===2) {
        event.stopPropagation();
      }
    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      var x = event.clientX;
      var y = event.clientY;

      if (x === undefined) {
        x = this.pointerX;
        y = this.pointerY;
      }

      var contextEvent = new CustomEvent('the-graph-context-show', { 
        detail: {
          element: this,
          type: (this.props.export ? (this.props.isIn ? "graphInport" : "graphOutport") : "edge"),
          x: x,
          y: y
        }, 
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(contextEvent);
    },
    getContext: function (x, y, menu) {
      // If this edge represents an export
      if (this.props.export) {
        return TheGraph.Menu({
          graph: this.props.graph,
          label: this.props.exportKey,
          menu: menu,
          itemKey: this.props.exportKey,
          item: this.props.export,
          x: x,
          y: y
        });
      }

      return TheGraph.Menu({
        graph: this.props.graph,
        item: this.props.edge,
        menu: menu,
        label: this.props.label,
        iconColor: this.props.route,
        x: x,
        y: y
      });
    },
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if changed
      return (
        nextProps.sX !== this.props.sX || 
        nextProps.sY !== this.props.sY ||
        nextProps.tX !== this.props.tX || 
        nextProps.tY !== this.props.tY ||
        nextProps.route !== this.props.route
      );
    },
    getTooltipTrigger: function () {
      return this.refs.touch.getDOMNode();
    },
    shouldShowTooltip: function () {
      return true;
    },
    componentDidUpdate: function (prevProps, prevState) {
      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      var c = "edge-fg stroke route"+this.props.route;
      this.refs.route.getDOMNode().setAttribute("class", c);
    },
    render: function () {
      var sourceX = this.props.sX;
      var sourceY = this.props.sY;
      var targetX = this.props.tX;
      var targetY = this.props.tY;

      var c1X, c1Y, c2X, c2Y;
      if (targetX-5 < sourceX) {
        if (Math.abs(targetY-sourceY) < TheGraph.nodeSize/2) {
          // Loopback
          c1X = sourceX + CURVE;
          c1Y = sourceY - CURVE;
          c2X = targetX - CURVE;
          c2Y = targetY - CURVE;
        } else {
          // Stick out some
          c1X = sourceX + CURVE;
          c1Y = sourceY + (targetY > sourceY ? CURVE : -CURVE);
          c2X = targetX - CURVE;
          c2Y = targetY + (targetY > sourceY ? -CURVE : CURVE);
        }
      } else {
        // Controls halfway between
        c1X = sourceX + (targetX - sourceX)/2;
        c1Y = sourceY;
        c2X = c1X;
        c2Y = targetY;
      }

      var path = [
        "M",
        sourceX, sourceY,
        "C",
        c1X, c1Y,
        c2X, c2Y,
        targetX, targetY
      ].join(" ");

      return (
        React.DOM.g(
          {
            className: "edge route",
            title: this.props.label
          },
          React.DOM.path({
            className: "edge-bg",
            d: path
          }),
          React.DOM.path({
            ref: "route",
            className: "edge-fg stroke route"+this.props.route,
            d: path
          }),
          React.DOM.path({
            className: "edge-touch",
            ref: "touch",
            d: path
          })
        )
      );
    }
  });

})(this);