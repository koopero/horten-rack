/** 
	A simple Horten implementation of a colour, which reacts to changes to RGB and HSV
	values.
*/

var H = require ( 'horten' ),
	util = require ('util');

util.inherits( Colour, H.Listener );

module.exports = Colour;

function Colour ( config ) {
	var self = this;

	if ( !(self instanceof Colour) )
		return new Colour ( config );

	var _colour = {
		r: 0,
		g: 0,
		b: 0,
		a: 0,
		h: 0,
		s: 0,
		v: 0
	};

	H.Listener.call( self, config, onData );

	self.primitive = true;
	self.name = self.name || 'Colour';
	self.attach ();	
	self.push();

	function onData ( value, path ) {
		if ( path.length == 1 && path[0].length == 1 ) {
			setChannel( path[0], value );
		} 
	}

	function setChannel( channel, value ) {
		switch ( channel ) {
			case 'r':		setRGB		( value, null, null );	break;
			case 'g':		setRGB		( null, value, null );	break;
			case 'b':		setRGB		( null, null, value );	break;
			
			case 'a':		setAlpha	( value );				break;

			case 'h':		setHSV		( value, null, null );	break;
			case 's':		setHSV		( null, value, null );	break;
			case 'v':		setHSV		( null, null, value );	break;	
		}
	}

	function setAlpha ( a ) {
		a = parseFloat( a );
		if ( isNaN( a ) )
			return;

		_colour.a = a;
		self.set( a, 'a' );
		return a; 
	}

	function setRGB ( r, g, b ) {
		r = _colour.r = isNaN( r ) || r == null ? _colour.r : r;
		g = _colour.g = isNaN( g ) || g == null ? _colour.g : g;
		b = _colour.b = isNaN( b ) || b == null ? _colour.b : b;

		//	Shamelessly ganked from http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
		// 	The big difference in this implementation is that h and s values are left untouched
		//	when they are made irrelevant. 

		var max = Math.max(r, g, b), 
			min = Math.min(r, g, b);
		
		_colour.v = max;

		var d = max - min;

		if ( max != 0) {
			_colour.s = d / max;
		}

		if ( max != min ){
			switch ( max ) {
				case r: _colour.h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: _colour.h = (b - r) / d + 2; break;
				case b: _colour.h = (r - g) / d + 4; break;
			}

			_colour.h /= 6;
		}

		self.set ( _colour );
		setPads ( _colour );
	}


	function setPads ( val ) {
		/*if ( pads ) {
			for ( var pi = 0; pi < pads.length; pi ++ ) {
				var pad = pads[pi];
				for ( var i = 0; i < pad.length; i ++ ) {
					var k = pad[i];
					if ( k in val ) 
						self.set( val[k], pad + '/' + i );
				}
			}
		}*/
	}


	function setHSV ( h, s, v ) {
		h = _colour.h = isNaN( h ) || h == null ? _colour.h : h;
		s = _colour.s = isNaN( s ) || s == null ? _colour.s : s;
		v = _colour.v = isNaN( v ) || v == null ? _colour.v : v;

		//	Shamelessly ganked from http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript

		var i = Math.floor(h * 6);
		var f = h * 6 - i;
		var p = v * Math.max(0, 1 - s);
		var q = v * Math.max(0, 1 - f * s);
		var t = v * Math.max(0, 1 - (1 - f) * s);

		switch(i % 6){
			case 0: _colour.r = v, _colour.g = t, _colour.b = p; break;
			case 1: _colour.r = q, _colour.g = v, _colour.b = p; break;
			case 2: _colour.r = p, _colour.g = v, _colour.b = t; break;
			case 3: _colour.r = p, _colour.g = q, _colour.b = v; break;
			case 4: _colour.r = t, _colour.g = p, _colour.b = v; break;
			case 5: _colour.r = v, _colour.g = p, _colour.b = q; break;
		}

		self.set ( _colour );
		setPads ( _colour );
	}
}
