#!/usr/bin/env node

var fs = require( 'fs' ),
    _ = require( 'underscore' ),
    program = require( 'commander' );

var Tootbot,
    tootbot;

program
  .version( '0.1.0' )
  .option( '-t, --tutorial <path>', 'Tutorial file' )
  .parse( process.argv );

Tootbot = function( tutorial ) {
    this.tutorial = tutorial;
    this.pointer = this.tutorial[ 0 ];
    this.initialize();
};

Tootbot.prototype = {
    initialize: function() {
        this.askNextQuestion();
    },

    currentStep: function() {
        var step = this.pointer,
            question = _.keys( step )[ 0 ],
            answers = _.keys( step[ question ] );

        return {
            question: question,
            answers: answers,
        };
    },

    askNextQuestion: function() {
        var step = this.currentStep(),
            promptText;

        if( step.answers.length === 0 ) {
            console.log( '' );
            console.log( step.question );
            process.exit();
        } else {
            console.log( '' );
            console.log( step.question );

            promptText = '';
            for( var i = 0; i < step.answers.length; i++ ) {
                promptText += ( i > 0 ? ', ' : '' ) +
                    step.answers[ i ] +
                    ' [' + ( i + 1 ) + ']';
            }
            promptText += ': ';

            program.prompt(
                promptText,
                this.handleAnswer.bind( this )
            );
        }
    },

    getNextQuestionId: function( answer ) {
        var step = this.currentStep(),
            nextQuestionId;

        if( parseInt( answer, 10 ) == answer ) {
            var j = 1;
            answer = parseInt( answer, 10 );
            for( var i in this.pointer[ step.question ] ) {
                if( answer === j ) {
                    answer = i;
                }
                j++;
            }
        }

        if( this.pointer[ step.question ][ answer ] ) {
            nextQuestionId = this.pointer[ step.question ][ answer ];
            if( _.isNumber( nextQuestionId ) ) {
                return nextQuestionId;
            }
            for( var i = 0; i < this.tutorial.length; i++ ) {
                if( _.keys(this.tutorial[ i ])[0] === nextQuestionId ) {
                    return i;
                }
            }
        }

        return null;
    },

    handleAnswer: function( answer ) {
        var nextQuestionId = this.getNextQuestionId( answer );

        if( nextQuestionId !== null ) {
            this.pointer = this.tutorial[ nextQuestionId ];
        } else {
            console.log( '* Sorry, did not recognise answer "%s"', answer );
        }

        this.askNextQuestion();
    }
};

if( program.tutorial ) {
    fs.readFile( program.tutorial, function ( err, tutorial ) {
        if( err ) throw err; 
        tutorial = JSON.parse( tutorial );
        var tootbot = new Tootbot( tutorial );
    });
} else {
    console.log( 'Please specify a tutorial!' );
}