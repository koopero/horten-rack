/** 
	A simple Horten implementation of a colour, which reacts to changes to RGB and HSV
	values.
*/

var H = require ( 'horten' ),
	util = require ('util');

util.inherits( Coord, H.Listener );

module.exports = Coord;

function Coord ( config ) {
	var self = this;

	if ( !(self instanceof Coord) )
		return new Coord ( config );

	var _coord = {
		x: 0,
		y: 0,
		z: 0,
		w: 0
	};

	H.Listener.call( self, config, onData );

	self.primitive = true;
	self.name = self.name || 'Coord';
	self.attach ();	
	self.push();

	function onData ( value, path ) {
		var set;

		var numVal = parseFloat( value );

		if ( path.length == 1 && path[0].length == 1 ) {
			if ( !isNaN( numVal ) ) {
				set = {};

				switch ( path[0] ) {
					case '0': 	 
					case 'x': 
						set.x = numVal; break;

					case '1': 	 
					case 'y': 
						set.y = numVal; break;

					case '2': 	 
					case 'z': 
						set.z = numVal; break;

					case '3': 	 
					case 'w': 
						set.w = numVal; break;
				}
			}
		} else if ( path.length == 2 && isNumeric( path[1] ) && path[0].length == 2 && !isNaN( numVal ) ) {
			var axis = path[0][parseInt(path[1])];
			switch ( axis ) {
				case 'X': set = { x: 1 - numVal }; break;
				case 'x': set = { x: numVal }; break;
				case 'Y': set = { y: 1 - numVal }; break;
				case 'y': set = { y: numVal }; break;
				case 'Z': set = { z: 1 - numVal }; break;
				case 'z': set = { z: numVal }; break;

			}
		}

		if ( set )
			self.set( set );
	}


	function isNumeric( v ) {
		return !isNaN( parseFloat( v ) )
	}



}
