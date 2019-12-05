// ---------------------------------------------------- //
//                      Box2DGame                       //
// ---------------------------------------------------- //

$(function() {
	
	$('#game-stage').append('<div id="pawns"></div>');
    
    var times = 1;

	b2Game = new function() {
        

		var timer = 0, // Used for pausing the game
			pawnCount = {}, // Used for generating unique ID's for pawns
			ppm = 30, //ppm === 'pixels per meter'
			
			// Standard approach to defining pointers to useful Box2D methods 
			b2BodyDef = Box2D.Dynamics.b2BodyDef,
			b2Body = Box2D.Dynamics.b2Body,
			b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
			b2Fixture = Box2D.Dynamics.b2Fixture,
			b2World = Box2D.Dynamics.b2World,
			b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
			b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
			b2Vec2 = Box2D.Common.Math.b2Vec2;	
		
		// The Box2D world which contains the physics simulation
		this.world = new b2World(
			{x: 0, y: 10},    //gravity
			true                 //allow sleep
		);
						
		this.fps = 100; // frames per second
		
		//this.b2Vec2 = function (obj1,obj2,obj3,obj4,prams) {
		this.b2Vec2 = function (prams) {
			
			var vertices = [];
			
			/*var ver1 = new b2Vec2( prams[0].x, prams[0].y);
			var ver2 = new b2Vec2( prams[1].x, prams[1].y);
			var ver3 = new b2Vec2( prams[2].x, prams[2].y);*/
			
			for (i = 0; i < prams.length; i++) {
				var vert = new b2Vec2( prams[i].x, prams[i].y);
				vertices.push(vert);
			}
			
			
			
			//vertices.push(ver1, ver2, ver3);
			
			return vertices;
		};
		
		this.keyPress = {}; // Used for detecting user input

		$(document).keydown(function(event) { 
			b2Game.keyPress[event.keyCode] = true;
		});

		$(document).keyup(function(event) { 
			delete b2Game.keyPress[event.keyCode];
		});
        
        this.touchMove = {};
        
       $("#game-stage").on("touchmove touchstart", function (event) {
            //b2Game.touchMove
            var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            //CODE GOES HERE
            //console.log(touch.pageY+' '+touch.pageX);
            var offset = $(this).offset();
            b2Game.touchMove.x = touch.pageX - offset.left;
            b2Game.touchMove.y = touch.pageY - offset.top;
            console.log(b2Game.touchMove.x+' '+b2Game.touchMove.y);
            var posX = $(this).position().left,
            posY = $(this).position().top;
           
           //$("#position").html("x of box is " + posX + " y of box is " + posY + "<br/>x of page is " + touch.pageX + " y of page is " + touch.pageY + "<br/> offset x is " + offset.left + " offset y is " + offset.top);
        });

		// Keeps track of the width and height of the game-stage in units of meters.
		this.stage = {
			width: $('#game-stage').width()/ppm,
			height: $('#game-stage').height()/ppm,
			
			resize: function(width, height) {
				this.width = width;
				this.height = height;
				$('#game-stage').width( this.width*ppm );
				$('#game-stage').height( this.height*ppm );
			}
		}
		
		this.pawns = {}; // A list of pointers to all pawns in the game world.
		
		this.pawnsForRemoval = []; // Used for safetly removing Pawns from the game-stage
		
		// Runs the game by calling the b2Game.update() method each frame
		this.run = function() { 
			timer = setInterval( function(){  b2Game.update() }, 1000/this.fps);
		}	

		// Pauses the game
		this.pause = function() {
			clearTimeout(timer);
		}	

		
		this.update = function() {
			
			this.world.Step(
				1 / this.fps,   //frame-rate
				10,      //velocity iterations
				10      //position iterations
			);
            
            
			
			for( var key in this.pawns ) this.pawns[key].update();
            

			for( var key in this.pawnsForRemoval) this.world.DestroyBody(this.pawnsForRemoval[key]);
			this.pawnsForRemoval.length = 0;

			for( var key in this.updateFunctions ) this.updateFunctions[key]();

			this.world.ClearForces();
													
		}			

		this.updateFunctions = {}; // Used for adding global behavior to the b2Game.update() method
		
		// General purpose method for adding, changing, and scrolling the background image
		this.background = function(properties) {
			
			var x = 0,
				y = 0,
				z = -1;
							
			if( properties.x !== undefined ) x = properties.x;
			if( properties.y !== undefined ) y = properties.y;
			if( properties.z !== undefined ) z = properties.z;

			var style = 'position: absolute; background-image: url(' + properties.image + '); ' + ( properties.noRepeat === undefined ? '' : ' background-repeat: no-repeat;' ) + ' z-index: ' + z + '; height: ' + b2Game.stage.height*ppm + 'px; width:' + b2Game.stage.width*ppm + 'px; background-position: ' + x + 'px ' + y + 'px;';
			
			if( $('#background').length === 0 ) 
				$('#game-stage').append('<div id="background" style="' + style +'"></div>');
			else
				$('#background').attr('style', style);
				
			if( properties.velocity !== undefined ) {
				
				b2Game.updateFunctions.background = function() {
					
					x += properties.velocity.x;
					y += properties.velocity.y;
				
					$('#background').css('background-position', x + 'px ' + y + 'px');
					
											
				}
		
			}

		}

		// Used for creating chains of edges in the game world.
		this.edge = new function() {

			var fixDef = new b2FixtureDef, 
				bodyDef = new b2BodyDef;

			bodyDef.type = b2Body.b2_staticBody;
			bodyDef.userData = {type:'edge'};
			fixDef.shape = new b2PolygonShape;

			this.setProperties = function(parameters) {
				if( parameters.friction ) fixDef.friction = parameters.friction;
				if( parameters.maskBits ) fixDef.filter.maskBits = parameters.maskBits;
			}
			
			this.create = function() {
			
				for( var key in arguments ) {
					var next = (parseInt(key) + 1);	
					
					if( arguments[next] ) {
						fixDef.shape.SetAsEdge(arguments[key], arguments[next]);
						b2Game.world.CreateBody(bodyDef).CreateFixture(fixDef);
					}
					else return
				}

			}
		}	
		
		// Used for viewing the physics simulation by calling the standard Box2D debug draw routines.  
		this.debug = function(option) {

			if( $('#debug-canvas').length === 0 ) { 
				$('#game-stage').append('<canvas id="debug-canvas" width="' + this.stage.width*ppm + '" height="' + this.stage.height*ppm + '"></canvas>');
			}
		
			var b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
				debugDraw = new b2DebugDraw();
				debugDraw.SetSprite(document.getElementById("debug-canvas").getContext("2d"));
				debugDraw.SetDrawScale(ppm);
				debugDraw.SetFillAlpha(0.3);
				debugDraw.SetLineThickness(1.0);
				debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			
			this.world.SetDebugDraw(debugDraw);
						
			this.world.DrawDebugData();		

			switch( option ) {
				
				case 'kill':
					$('#background-1, #pawns').show();
					$('#game-stage').css('background', '')
					$('#debug-canvas').replaceWith('')
					delete this.updateFunctions.debug;
					break;
				
				case 'mixed':
					$('#pawns').show();
					$('#background-1').hide();
					$('#game-stage').css('background', '#00002D')
					this.updateFunctions.debug = function() { b2Game.world.DrawDebugData(); }		
					break;
				
				case undefined:
				default:
					$('#background-1, #pawns').hide();
					$('#game-stage').css('background', '#00002D')
					this.updateFunctions.debug = function() { b2Game.world.DrawDebugData(); }		
					break;
				
			}
		
		}
		
		// Used for creating new types of Pawns.  See the Documentation for more information.
		this.Pawn = function(data) {
		
			// Generate a unique ID for this Pawn.
			if( pawnCount[data.id] === undefined ) pawnCount[data.id] = 1; 
			else ++pawnCount[data.id];

			var id = this.id = data.id + '_' + pawnCount[data.id],
				fixDef = new b2FixtureDef, 
				bodyDef = new b2BodyDef,
				updateFunctions = {},  // Used for adding/removing various behavior to the Pawn
				style = 'style="background-image:url('+data.image+'); position:absolute; height: '+data.height+'px; width: '+data.width+'px; -webkit-transform-origin: ' + data.width/2 + 'px ' + data.height/2 + 'px ; -moz-transform-origin: ' + data.width/2 + 'px ' + data.height/2 + 'px ; transform-origin: ' + data.width/2 + 'px ' + data.height/2 + 'px ; -o-transform-origin: ' + data.width/2 + 'px ' + data.height/2 + 'px ; left: ' + data.position.x*ppm + 'px; top: ' + data.position.y*ppm + 'px;',
				scale = { x:1, y:1 }; // used to set the scaleX/scaleY style property of -webkit-transform
		
			// Set the Box2D fixture definitions for this Pawn
			fixDef.density = ( data.density ) ? data.density : 1.0; 
			fixDef.friction =  ( data.friction ) ? data.friction : 0.5;
			fixDef.restitution =  ( data.restitution ) ? data.restitution : 0.8;
            //console.log(id);
            //console.log(fixDef.density);
			// category and mask bits are used for ignoring collisions between certain bodies, see the Box2D documentation for more information.
			if( data.categoryBits ) fixDef.filter.categoryBits = data.categoryBits; 
			if( data.maskBits ) fixDef.filter.maskBits = data.maskBits;
			
			switch( data.shape ) {
				
				case 'circle':
					fixDef.shape = new b2CircleShape(data.radius);				                 //console.log(data.radius);
					break;
					
				case 'tri':
					//console.log(data.vertices);
					fixDef.shape = new b2PolygonShape;
					//console.log("tried again");
					fixDef.shape.SetAsArray(
						data.vertices,
						data.count
					);	
					/*fixDef.shape.SetAsBox(
						data.width/(2*ppm), 
						data.height/(2*ppm)
					);*/
					break;
									
				case 'box':
				default:
					fixDef.shape = new b2PolygonShape;
					fixDef.shape.SetAsBox(
						data.width/(2*ppm), 
						data.height/(2*ppm)
					);
					break;
			}
			
			// Set the Box2D body definitions for this Pawn
			bodyDef.type = b2Body['b2_' + data.type + 'Body'];
			
			if( data.fixedRotation ) bodyDef.fixedRotation = true;
			
			bodyDef.position.x = data.position.x + data.width/(3*ppm);
			bodyDef.position.y = data.position.y + data.height/(3*ppm);
            //bodyDef.position.y = data.position.y + data.height/2;
            
			
			if( data.velocity ) {
				bodyDef.linearVelocity.x = data.velocity.x;
				bodyDef.linearVelocity.y = data.velocity.y;
			}
			//console.log(bodyDef.position.y);
			if( data.angle ) {
				bodyDef.angle = data.angle;
				
				console.log("got to rotate");
				
				style += '-webkit-transform: rotate('+(180/Math.PI)*data.angle+'deg); -moz-transform: rotate('+(180/Math.PI)*data.angle+'deg); transform: rotate('+(180/Math.PI)*data.angle+'deg); -o-transform: rotate('+(180/Math.PI)*data.angle+'deg);';				
			}

			// Set userData which is used for collision detection
			bodyDef.userData = {
				id:id,
				type: data.id
			};

			// Create the body and fixture for this Pawn, and add it to to the Box2D world.
			var body = this.body = b2Game.world.CreateBody(bodyDef);
			this.fixture = this.body.CreateFixture(fixDef);
			
			// Routine to enable an option maxSpeed parameter
			if( data.maxSpeed ) {
							
				updateFunctions.maxVelocity = function() {
				
					var velocity = body.GetLinearVelocity(),
						ratio = data.maxSpeed/Math.sqrt(velocity.x*velocity.x + velocity.y*velocity.y);
					
					if( ratio < 1 ) {
						body.SetLinearVelocity({
							x: velocity.x*ratio,
							y: velocity.y*ratio
						});
					}					
					
				}
				
			}
			
			// Routines for animated Pawns
			if( data.animation ) {
	           //console.log("animation exists");
				var anchor = { x:-data.width, y: -data.height },
					backgroundPosition = { x:0, y:0 },
					cooldown = data.animation.cooldown, // Sets the initial timer for playing animations
					duration = 0,
					timer = 0,
					
					// method called by updateFunctions.animation when there is an active animation
					animate = function() {
                     
                        console.log("got here");
		
						if( timer < duration*data.animation.cooldown ) {
							if( cooldown > 0 ) cooldown--;
							else {

								cooldown = data.animation.cooldown;
								backgroundPosition.x += anchor.x;

								if( backgroundPosition.x == anchor.x*data.animation.framesWide ) {
									backgroundPosition.x = 0;
									backgroundPosition.y += anchor.y;
								}
								
								$('#'+id).css('background-position', backgroundPosition.x + 'px ' + backgroundPosition.y + 'px');	
							}
							
							timer++;
						}
						else {
							revert(0,0);					
							delete updateFunctions.animation;
						}

					},
					
					// A publically available method which can be used for changing the background-position property
					revert = this.revert = function(x, y) {
									
						cooldown = data.animation.cooldown;
						timer = 0;
					
						backgroundPosition.x = x*anchor.x;
						backgroundPosition.y = y*anchor.y;

						$('#'+id).css('background-position', backgroundPosition.x + 'px ' + backgroundPosition.y + 'px');	

					};
				
				// Method which is used to play animations
				this.playAnimation = function(startFrame, numFrames, newCooldown) {
	
					if( newCooldown !== undefined ) data.animation.cooldown = newCooldown;
					
					duration = numFrames;
					revert(startFrame.x, startFrame.y);
					
					updateFunctions.animation = function() { animate(); }				
				
				}
				
				this.beingAnimated = function() {
                    //console.log("animated");
					return ( updateFunctions.animation ) ? true : false;
				}
							
			
			}

			// Add the Pawn to the game-stage
			$('#pawns').append('<div id="' + id + '" class="' + data.id + ' pawn" ' + style + '"></div');										
			
			// Baseline update method.  Updates the Pawn's position and rotation in the DOM as a result of the Box2D world step, and performs a few other basic tasks as defined by the initial input data
			this.update = function() {

				var position = this.body.GetPosition();
				
				var nua = navigator.userAgent;
var is_android = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 &&     nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
		
				$('#'+id).css('left', position.x*ppm - data.width/2);
				$('#'+id).css('top', position.y*ppm - data.height/2);
				
				//if (this.id != "ball_1") {
				if (this.id.indexOf("ball") == -1) {
					//console.log("there");
					$('#'+id).css('-webkit-transform', 'scaleX(' + scale.x + ') scaleY(' + scale.y + ') rotate('+(180/Math.PI)*this.body.GetAngle()+'deg)');	
				$('#'+id).css('-moz-transform', 'scaleX(' + scale.x + ') scaleY(' + scale.y + ') rotate('+(180/Math.PI)*this.body.GetAngle()+'deg)');
				}
				/*$('#'+id).css('-webkit-transform', 'scaleX(' + scale.x + ') scaleY(' + scale.y + ') rotate('+(180/Math.PI)*this.body.GetAngle()+'deg)');	
				$('#'+id).css('-moz-transform', 'scaleX(' + scale.x + ') scaleY(' + scale.y + ') rotate('+(180/Math.PI)*this.body.GetAngle()+'deg)');	*/
				
				/*console.log(this.id);
				
				if (is_android) {
					$("#position").html("this is android");
				} else {
					$("#position").html("this is NOT android");
				}*/
				
				for( var key in updateFunctions ) updateFunctions[key]();
                
                
                
												
			}

			// Safetly remove this Pawn from the game
			this.die = function() {
			
				
				b2Game.pawnsForRemoval.push(this.body);			

				$('#'+id).replaceWith('');
	
				delete b2Game.pawns[this.id];
                
                
 
			}

			// Simple method to determine if this Pawn is out of bounds of the Game stage
			this.outOfBounds = function() {
				
				var position = this.body.GetPosition();
				
				return ( 
					position.x < 0 || 
					position.y < 0 || 
					position.x > b2Game.stage.width || 
					position.y > b2Game.stage.height 
				);
			}
			
			// Method for setting the scaleX and scaleY properties of the -webkit-transform style property
			this.setScale = function(axis) {
				if( axis.x ) scale.x = axis.x;
				if( axis.y ) scale.y = axis.y;
			}
			
			this.getObjects = function (obj, key, val) {
				var objects = [];
				for (var i in obj) {
					if (!obj.hasOwnProperty(i)) continue;
					if (typeof obj[i] == 'object') {
						objects = objects.concat(getObjects(obj[i], key, val));
					} else if (i == key && obj[key] == val) {
						objects.push(obj);
					}
				}
				return objects;
			}
			
			$.fn.digits = function(){ 
    			return this.each(function(){ 
        			$(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
    			})
			}
			
		}
		
	
		
	}

});
