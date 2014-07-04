

var Sequencer = require('../src/Sequencer');
var Pad2D = require('../src/Pad2D');

var pattern = Pad2D( {
	path: 'pattern/Tr1w16h6',
	id: 'Tr1w16h6'
});



var seq = Sequencer( {
	path: '/sequencer'
});

seq.step();
if ( false )
setInterval( function () {
	seq.step();
}, 3000 );