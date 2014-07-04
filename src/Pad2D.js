var H = require('horten');
var _ = require('underscore');

module.exports = Pad2D;

function Pad2D ( opt ) {
	var self = this;

	if ( !(self instanceof Pad2D ) )
		return new Pad2D ( opt );

	opt = opt || {};
	opt.primitive = true;
	opt.name = opt.name || 'Pad2D'

	H.Listener.call( self, opt, onData );

	var geom = {};

	if ( opt.id ) {
		geom = _.extend( geom, geomFromString( opt.id ) );
		normalizeGeom();
	}

	function normalizeGeom () {
		geom.c = parseFloat( geom.c ) || 0;
		geom.w = parseFloat( geom.w ) || 0;
		geom.h = parseFloat( geom.h ) || 0;

		geom.k = geom.w * geom.h;

	}

	function geomFromString ( id ) {
		var geom = {};

		id.replace( /(\w)(\d+)/g, function ( token, key, value ) {
			key = key.toLowerCase();
			value = parseInt( value );
			switch( key ) {
				case 'r':
				case 'x':
				case 'y':
				case 'w':
				case 'h':
				case 'o':
				case 'c':
					geom[key] = value;
			}
		} );

		return geom;
	}



	function onData ( v, p ) {
		//console.warn ( "Pad2D.onData", v, String( p ) );
		switch ( p[0] ) {
			default:
				var coord = pathToXY( p );
				if ( coord ) {
					onPadData( v, coord[0], coord[1] );
				}

				
		}
	}

	function onPadData( v, x, y ) {
		console.warn ( "Pad2D.onPadData", v, x, y );
		//self.setColSelected( x, y );
		self.setRowSelected( x, y );
		
	}

	function pathToXY ( path ) {
		var px = parseInt( path[0] ) - 1;
		var py = parseInt( path[1] ) - 1;

		switch ( geom.r ) {
			case 1:
				var swap = geom.h - px - 1;
				px = py;
				py = swap;
			break;
		}
		return [ px, py ];
	}

	self.eachXY = function ( cb ) {
		for ( var y = 0; y < geom.h; y ++ )
		for ( var x = 0; x < geom.w; x ++ )
			cb( x, y ); 
	}

	self.eachX = function ( cb ) {
		for ( var x = 0; x < geom.w; x ++ )
			cb( x ); 
	}

	self.eachY = function ( cb ) {
		for ( var y = 0; y < geom.h; y ++ )
			cb( y ); 
	}

	self.setColSelected = function ( x, y, upValue, downValue ) {
		//console.log( 'Pad.setSelected', x, geom );
		upValue = H.valueToNumber( upValue, 1 );
		downValue = H.valueToNumber( downValue, 0 );

		if ( Array.isArray ( x ) ) {
			self.eachX( function ( px ) {
				self.setPad( x.indexOf( px ) != -1 ? upValue : downValue, px, y )
			});
		} else {
			x = parseInt( x );
			self.eachX( function ( px ) {
				self.setPad( px == x ? upValue : downValue, px, y )
			});
		}
	}

	self.setRowSelected = function ( x, y, upValue, downValue ) {
		//console.log( 'Pad.setSelected', x, geom );
		upValue = H.valueToNumber( upValue, 1 );
		downValue = H.valueToNumber( downValue, 0 );

		if ( Array.isArray ( y ) ) {
			self.eachY( function ( py ) {
				self.setPad( y.indexOf( py ) != -1 ? upValue : downValue, x, py )
			});
		} else {
			y = parseInt( y );
			self.eachY( function ( py ) {
				self.setPad( py == y ? upValue : downValue, x, py )
			});
		}
	}


	self.setPad = function ( value, px, py ) {
		px = parseInt( px );
		py = parseInt( py );

		if ( px < 0 
			|| px >= geom.w 
			|| py < 0
			|| py >= geom.h 
		)
			return;

		switch ( geom.r ) {
			case 1:
				var swap = px;
				px = geom.h - py - 1;
				py = swap;
			break;
		}
		

		var path = H.Path( px + 1, py + 1 );
		self.set( value, path );		
	}


}

Pad2D.isValidId = function ( id ) {
	id = String( id );
	
	if ( !id.length )
		return false;

	switch ( id[0] ) {
		case 'T':
		case 'P':
			return true;
	}

	return false;
}