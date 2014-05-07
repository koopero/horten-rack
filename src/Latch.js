var H = require('horten'),
	inherits = require('util').inherits;

inherits( Latch, H.Listener );
module.exports = Latch;

function Latch ( opt ) {
	if ( this.constructor != Latch )
		return new Latch( opt );

	opt = opt || {};

	var pads = {},
		trigger = [],
		devices = [],
		contexts = [],
		opVal = [];

	var self = this;
	self.trigger = trigger;
	self.selected = -1;

	opt.primitive = true;
	H.Listener.call( self, opt, function onData ( value, path ) {
		//console.warn( "L!!!", value );

		switch ( path[0] ) {
			case 'pad':
				if ( !path[1] )
					break;

				var pad = getPad( path[1] );
				if ( pad ) {
					pad.set( value, path );
				}
		}
	} );

	self.devices = devices;
	self.setActiveTargets = function ( v, p ) {
		for ( var c = 0; c < trigger.length; c++ ) {
			if ( trigger[c] )
				H.Path( opt.target ).append( c ).set( v, p );
		}
	}

	function eachDevice( c, cb ) {
		//console.warn( "devices", devices );
		for ( var di = 0; di < devices.length; di++ ) {
			var device = devices[di],
				dCon = contexts[di],
				context;

			if ( !dCon ) {
				dCon = contexts[di] = [];
			}

			context = dCon[c];
			if ( !context ) {
				context = dCon[c] = {
					c: c,
					target: H.Path( opt.target ).append( c )
				};
			}


			cb( device, context );
		}
	}

	function up ( c ) {
		eachDevice( c, function ( device, context ) {
			apply( context, device.up );
		});
	}

	function down( c ) {
		eachDevice( c, function ( device, context ) {
			apply( context, device.down );
		});
	}

	function apply( context, a ) {
		if ( 'function' == typeof a ) {
			a = a.call( context, context );
			if ( a !== undefined ) {
				H.set( a, context.target )
			}
		} else if ( 'object' == typeof a ) {
			H.set( a, context.target );
		} else if ( ('string' == typeof a ) && a.length > 3 ) {
			var v = H.get( a );
			H.set( v, context.target );
		}
	}



	self.tick = function ( clock ) {
		
		for ( var c = 0; c < trigger.length; c++ ) {
			if ( trigger[c] )
				eachDevice( c, function ( device, context ) {
					apply( context, device.tick );
				});
		}
		
	}

	function compute ( c ) {
		var v = false,
			ovA = opVal[c],
			lv = trigger[c];

		for ( var o = 0; o < ovA.length; o ++ ) {
			var ov = ovA[o];
			v = v ^ ov;
		}

		if ( v == lv )
			return;

		trigger[c] = v;

		if ( v ) {
			up( c );
		} else {
			down( c );
		}
	}

	function setOpValue ( oi, c, value, setPads ) {
		if ( !opVal[c] ) {
			opVal[c] = [];
		}

		opVal[c][oi] = value;
		
		if ( setPads ) {
			for ( var k in pads ) {
				var pad = pads[k];
				pad.setRemote( value, c );
			}
		}

		compute( c );
	}

	function getPad ( id ) {

		return pads[id] || newPad( id );
	}

	function newPad ( id ) {
		//console.warn ( "NEW PAD", id );
		var pad = {
			id: id,
			type: id[0]
		};

		id.replace( /(\w)(\d+)/g, function ( token, key, value ) {
			key = key.toLowerCase();
			value = parseInt( value );
			switch( key ) {
				case 'x':
				case 'y':
				case 'w':
				case 'h':
				case 'o':
				case 'c':
					pad[key] = value;
			}
		} );

		pad.o = pad.o || 0;
		pad.c = pad.c || 0;
		pad.k = pad.w * pad.h;

		pad.set = function ( value, path ) {
			if ( path[2] == 'all' ) {
				for ( var c = pad.c; c < pad.k + pad.c; c ++  ) {
					setOpValue( pad.o, c, value, true );
				}
				return;
			}


			var px = parseInt( path[2] ) - 1;
			var py = parseInt( path[3] ) - 1;
			
			var c = pad.c + px + py * pad.w;
			value = !!value;

			

			if ( value ) {
				self.selected = c;
	 			
				if ( pad.type == 'S' ) {
					var k = trigger.length;
					
					for ( var i = 0; i < k; i++ ) {
						if ( c == i )
							continue;

						setOpValue( pad.o, i, false, true );
					}
				}
			} else {
				if ( self.selected == c )
					self.selected = -1;
			}

			setOpValue( pad.o, c, value );
				
		}

		pad.setRemote = function ( value, c ) {

			c -= pad.c;

			if ( c < 0 )
				return;

			var px = c % pad.w;
			var py = Math.floor( c / pad.w );

			if ( px >= pad.w || py >= pad.h )
				return;

			var path = H.Path('pad', pad.id, px + 1, py + 1 );

			self.set( value, path );
		}

		pads[id] = pad;

		return pad;
	}



	self.push();

	return self;

}