var H = require('horten');
var Path = H.Path;

var Pad = require('./Pad1D')

module.exports = PadSet;

function PadSet ( opt ) {
	var self = this;

	if ( !(self instanceof PadSet ) )
		return new PadSet ( opt );

	opt = opt || {};
	opt.primitive = true;

	H.Listener.call( self, opt, onData );


	var pads = {};

	function resolvePad ( id ) {
		if ( pads[id] !== undefined ) {
			return pads[id];
		}

		if ( !Pad.isValidId( id ) ) {
			return null;
		}

		var padOpt = {
			path: Path( self.path ).append( id ),
			id: id
		};

		var pad = new Pad( padOpt );
		pads[id] = pad;
		
		pad.onRemote = onPadRemote.bind( pad );

		pad.push();

		return pad;
	}

	function onPadRemote( v, x ) {
		if ( 'function' == typeof self.onRemote )
			self.onRemote( v, x );
	}

	function eachPad ( cb ) {
		for ( var k in pads ) {
			var pad = pads[k];
			cb( pad );
		}
	}

	function onData ( v, p ) {
		console.warn ( "PadSet", v, String( p ) );
		switch ( p[0] ) {
			case 'clear':

			break;

			case 'all':

			break;

			default:
				var pad = resolvePad( p[0] );
		}
	}




	self.setSelected = function ( x ) {
		//console.log( 'PadSet.setSelected', x );
		eachPad( function ( pad ) {
			pad.setSelected( x );
		} );
	}

	return self;
}

