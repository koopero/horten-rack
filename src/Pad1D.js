var H = require('horten');
var _ = require('underscore');

module.exports = Pad1D;

function Pad1D ( opt ) {
	var self = this;

	if ( !(self instanceof Pad1D ) )
		return new Pad1D ( opt );

	opt = opt || {};
	opt.primitive = true;
	opt.name = opt.name || 'Pad1D'

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
		//console.warn ( "Pad1D.onData", v, String( p ) );
		switch ( p[0] ) {
			default:
				var x = pathToX( p );
				onPadData( v, x );
		}
	}

	function onPadData( v, x ) {
		console.warn ( "Pad1D.onPadData", v, String( x ) );

		if ( 'function' == typeof self.onRemote )
			self.onRemote( v, x );
	}

	function pathToX ( path ) {
		var px = parseInt( path[0] ) - 1;
		var py = parseInt( path[1] ) - 1;

		switch ( geom.r ) {
			case 1:
				var swap = geom.h - px - 1;
				px = py;
				py = swap;
			break;
		}
		
		var x = geom.c + px + py * geom.w;

		return x;
	}


	self.onlyX = function ( x, upValue, downValue ) {
		//console.log( 'Pad.setSelected', x, geom );
		upValue = H.valueToNumber( upValue, 1 );
		downValue = H.valueToNumber( downValue, 0 );

		if ( Array.isArray ( x ) ) {
			for ( var i = geom.c; i < ( geom.k + geom.c ); i ++ ) {
				self.setPad( i, x.indexOf( i ) != -1 ? upValue : downValue )
			}
		} else {
			x = parseInt( x );
			for ( var i = geom.c; i < ( geom.k + geom.c ); i ++ ) {
				self.setPad( i, i == x ? upValue : downValue )
			}
		}

	}

	self.setPad = function ( x, value ) {
		x -= geom.c;

		if ( x < 0 )
			return;

		var px = geom.w ? x % geom.w : x;
		var py = Math.floor( x / geom.w );

		if ( px >= geom.w || py >= geom.h )
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

Pad1D.isValidId = function ( id ) {
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