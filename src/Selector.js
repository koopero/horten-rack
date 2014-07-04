var 
	_ = require ( 'underscore' ),
	H = require ( 'horten' ),
	extend = require( 'extend' ),
	util = require( 'util' );


module.exports = Selector;

function Selector ( opt ) {
	var self = this;

	var _index = 0,
		_length = 0,
		_options,
		_keys,
		_values;


	opt.primitive = true;
	opt.name = opt.name || "Selector";

	self.target = opt.target;

	//console.log ( "Selector", opt );

	H.Listener.call( self, opt, onData );
	self.attach();

	setOptions( opt.options );





	function onData ( value, path ) {
		switch ( String( path ) ) {
			case '/index/': 
				setIndex( value );
			break;

			case '/range/': 
				setRange( value );
			break;

			case '/next/':
				if ( value )
					setIndex ( getIndex() + 1 );
			break;

			case '/prev/':
				if ( value )
					setIndex ( getIndex() + -1 );
			break;


			case '/random/':
				if ( value )
					self.setIndex ( Math.random() * 1000000000 ); // % will take care of it
			break;
		
		}		
	}

	function refreshOptions() {
		if ( 'function' == typeof _options )
			setOptions( _options );
	}

	function setOptions ( v ) {
		_options = v;

		if ( 'function' == typeof v ) {
			v = v();
		}

		if ( Array.isArray( v ) ) {
			v = v.slice();

			_keys 		= v.map( String );
			_values 	= v;
			_length 	= v.length;
		} else if ( 'object' == typeof v ) {
			v = extend( true, v );

			_keys 		= _.keys( v ).map( String );
			_values 	= _.values( v );
			_length 	= _values.length;
		} else if ( v != undefined ) {
			_keys		= [ String(v) ];
			_values		= [ v ];
			_length		= 1;
		} else {
			_keys		= [];
			_values 	= [];
			_length		= 0;
		}


		//setIndex( _index );
	}

	function setLabel ( v ) {
		refreshOptions();

		var ind = _keys.indexOf( String(v) );
		if ( ind == -1 )
			return false;


		setIndex( ind );
	}

	function getLabel () {
		return _keys[_index];
	}



	function setRange ( v ) {
		refreshOptions();

		v = parseFloat( v );
		if ( isNaN(v) )
			return false;

		if ( !_length )
			return false;

		var ind = Math.round ( ( _length - 1 ) * v );
		setIndex ( ind );

		return _index;
	}

	function setIndex ( ind ) {
		refreshOptions();

		ind = parseInt( ind );

		if ( isNaN( ind ) || !_length )
			return false;


		ind = ind % _length;
		if ( ind < 0 )
			ind += _length;

		_index = ind;

		var value = _values[ind];

		self.set( {
			index: _index,
			range: _length ? ( _index + 0 ) / ( _length - 1 ) : 0,
			label: _keys[ind],
			value: value
		});

		if ( 'string' == typeof self.target || self.target instanceof H.Path ) {
			H.set( value, self.target );
		}
		
		return ind;
	}

	function getIndex () {
		return _index;
	}


}









