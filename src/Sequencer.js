var H = require ( 'horten' );
var Path = H.Path;

var PadSet = require( './PadSet' );


module.exports = Sequencer;

function Sequencer ( opt )
{
	var self = this;

	if ( !(self instanceof Sequencer ) )
		return new Sequencer ( opt );

	opt = opt || {};
	opt.primitive = true;

	H.Listener.call( self, opt );


	var path = self.path;

	self.x = NaN;
	self.loopIn = 0;
	self.loopOut = 16;


	var stepPad = PadSet( {
		path: Path( self.path ).append( 'step' )
	});

	stepPad.onRemote = function ( v, x ) {
		self.step( x );
	}


	self.step = function ( x ) {
		
		x = parseFloat( x );
		if ( isNaN( x ) ) {
			self.x = parseFloat( self.x );
			if ( isNaN( self.x ) )
				x = 0
			else
				x = self.x + 1;
		}

		if ( !isNaN( self.loopIn ) && x < self.loopIn ) {

		}

		x = x % 16;

		self.x = x;


		stepPad.setSelected( self.x );


	}


};


exports.Sequencer = Sequencer;