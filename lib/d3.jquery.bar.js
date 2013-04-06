(function($) {
  "use strict"; // jshint ;_;

  var namespace = "d3.bar";


  //----------------------------------------------------------------------------
  //
  // Class Definition
  //
  //----------------------------------------------------------------------------

  var BarChart = function(element, options) {
    // Setup defaults.
    options = $.extend(true, {
      margin: {top:20, bottom:20, left:20, right:20},
      aspectRatio: 1.618,
      axes: {
        x:{ scale:"ordinal" },
        y:{ scale:"linear" },
      },
      bars:this.noop(),
      data:[],
    }, options);
    
    // Validation.
    if(!options.xField) $.error("$.bar.xField required.");
    if(!options.yField) $.error("$.bar.yField required.");

    // Initialize properties.
    this.element = element;
    this.margin = options.margin;
    this.aspectRatio = options.aspectRatio;
    this.axes = options.axes;
    this.bars = options.bars;
    this.xField = (typeof(options.xField) == "function" ? options.xField : function(d) { return d[options.xField]; });
    this.yField = (typeof(options.yField) == "function" ? options.yField : function(d) { return d[options.yField]; });
    this.data = options.data;

    // Attach event listeners.
    var $this = this;
    $(window).resize(function() { $this.update(); });
    
    this.update();
  }


  //----------------------------------------------------------------------------
  //
  // Methods
  //
  //----------------------------------------------------------------------------

  BarChart.prototype = {

  //------------------------------------
  // Refresh
  //------------------------------------

  // Updates the display of the visualization.
  update: function() {
    var $this = this;
    var element = this.element;
    var data = this.data;
    var margin = this.margin;
    
    var root = d3.select(element);
    var width = $(element).width(), height = $(element).width() / this.aspectRatio;

    var scales = {
      x: this.getScale(this.axes.x.scale, [0, width-margin.left-margin.right], this.xField),
      y: this.getScale(this.axes.y.scale, [height-margin.top-margin.bottom, 0], this.yField),
    };
    var axes = {
      x: d3.svg.axis().scale(scales.x).orient("bottom"),
      y: d3.svg.axis().scale(scales.y).orient("left")
    };

    // Initialize the chart.
    var svg = root.selectAll("svg").data([{}]).call(function(svg) {
      svg.enter().append("svg")
      svg.attr("width", width).attr("height", height);
    });

    // Draw the canvas where the visualization will go.
    var g = svg.selectAll("g.canvas").data([{}]).call(function(g) {
      g.enter().append("g").attr("class", "canvas");
      g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
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
      enter.append("rect").attr("class", "bar")
        .call($this.bars.entering)
        .call($this.bars.entered);
      bars
        .call($this.bars.updating)
        .attr("x", function(d) { return scales.x($this.xField(d)); })
        .attr("width", scales.x.rangeBand())
        .attr("y", function(d) { return scales.y($this.yField(d)); })
        .attr("height", function(d) { return height - scales.y($this.yField(d)) - margin.top - margin.bottom; })
        .call($this.bars.updated);
      exit
        .call($this.bars.exiting)
        .call($this.bars.exited)
        .remove();
    });
  },

  //------------------------------------
  // Events
  //------------------------------------

  // Returns an object that represents a no-op for enter/exit/update.
  noop: function() {
    return {
      entering:function(){},
      entered:function(){},
      exiting:function(){},
      exited:function(){},
      updating:function(){},
      updated:function(){},
    };
  },
  
  //------------------------------------
  // Scales
  //------------------------------------

  // Creates a scale based on a type (e.g. "linear", "ordinal", etc), a range
  // and a function that extracts the domain value.
  getScale: function(type, range, domainFunction) {
    if(typeof(type) == "function") return type.range(range).domain([0, d3.max(this.data, domainFunction)]);
    
    switch(type) {
      case "ordinal": {
        return d3.scale.ordinal().rangeRoundBands(range, .1).domain(this.data.map(domainFunction));
      }
      case "linear": {
        return d3.scale.linear().range(range).domain([0, d3.max(this.data, domainFunction)]);
      }
      case "log": {
        return d3.scale.log().range(range).domain([0, d3.max(this.data, domainFunction)]);
      }
    }
    $.error("Invalid scale: " + type);
  },
  
  }

  //----------------------------------------------------------------------------
  //
  // Plugin Definition
  //
  //----------------------------------------------------------------------------

  $.fn.bar = function(options) {
    return this.each(function () {
      var $this = $(this);
      var chart = $this.data(namespace);
      if (!chart) $this.data(namespace, (chart = new BarChart(this, options)))
      if (typeof options == 'string') chart[options]()
    })
  }
})(jQuery);