(function($) {
  "use strict"; // jshint ;_;

  var namespace = "d3.bar";
  var defaults = {
    "margin": {top:20, bottom:20, left:20, right:20},
    "aspectRatio": 1.618,
  };


  //----------------------------------------------------------------------------
  //
  // Methods
  //
  //----------------------------------------------------------------------------

  var methods = {

  //------------------------------------
  // Initialization
  //------------------------------------

  init: function(options) {
    this.each(function() {
      var $this = $(this), data = $this.data(namespace);
      if(!data) {
        $this.data(namespace, $.extend(defaults, options));
        $(window).resize(function() { $this.bar("update"); });
      }
    });
  },

  //------------------------------------
  // Refresh
  //------------------------------------

  update: function() {
    return this.each(function() {
      var $chart = $(this).data(namespace);
      var data = $chart.data;
      var margin = $chart.margin;

      var root = d3.select(this);
      var width = $(this).width(), height = $(this).width() / $chart.aspectRatio;
      
      var scales = {
        x: d3.scale.ordinal().rangeRoundBands([0, width-margin.left-margin.right], .1),
        y: d3.scale.linear().range([height-margin.top-margin.bottom, 0])
      };
      var axes = {
        x: d3.svg.axis().scale(scales.x).orient("bottom"),
        y: d3.svg.axis().scale(scales.y).orient("left")
      };

      // Adjust the scale.
      scales.x.domain(data.map(function(d) { return d.letter; }));
      scales.y.domain(d3.extent(data, function(d) { return d.frequency; }));

      // Initialize the chart.
      var svg = root.selectAll("svg").data([{}]).call(function(svg) {
        svg.enter().append("svg")
        svg.attr("width", width).attr("height", height);
      });

      // Draw the canvas where the visualization will go.
      var g = svg.selectAll("g.canvas").data([{}]).call(function(g) {
        g.enter().append("g").attr("class", "canvas");
        g.attr("transform", "translate(" + margin.left + "," + $chart.margin.top + ")");
      });

      // Setup the X axis.
      var gx = svg.selectAll("g.x.axis").data([{}]).call(function(gx) {
        gx.enter().append("g").attr("class", "x axis");
        gx.attr("transform", "translate(" + margin.left + "," + (height-margin.bottom) + ")").call(axes.x);
      });
      
      // Setup the Y axis.
      var gy = svg.selectAll("g.y.axis").data([{}]).call(function(gy) {
        gy.enter().append("g").attr("class", "y axis");
        gy.attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(axes.y);
      });
      
      // Draw the visualization.
      var bars = g.selectAll(".bar").data(data).call(function(bars) {
        var enter = bars.enter(), exit = bars.exit();
        enter.append("rect").attr("class", "bar");
        bars
          .attr("x", function(d) { return scales.x(d.letter); })
          .attr("width", scales.x.rangeBand())
          .attr("y", function(d) { return scales.y(d.frequency); })
          .attr("height", function(d) { return height - scales.y(d.frequency) - margin.top - margin.bottom; });
        exit.remove();
      });
    });
  },

  //------------------------------------
  // Axes
  //------------------------------------

  xAxis: function(value) {
    return this.each(function() {
      if(typeof(value) == "string") 
      this.data(namespace).xAxis = value;
    });
  },

  yAxis: function(value) {
    return this.each(function() {
      this.data(namespace).yAxis = value;
    });
  },

  }

  //----------------------------------------------------------------------------
  //
  // Plugin Definition
  //
  //----------------------------------------------------------------------------

  $.fn.bar = function(method) {
    if(methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('$.bar. ' +  method + '() does not exist.');
    }    
  }
})(jQuery);