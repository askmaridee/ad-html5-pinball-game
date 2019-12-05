$(function(){
	
	var	b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef,
		b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
    
    var score = 0;
    $("#total").html(score);
    
    var balls = 3;
    var times = 0;
	
	var nua = navigator.userAgent;
    var is_android = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 &&     nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
    
	
	if (is_android) {
		$(".disclaim").css("font-size", "40%");
	}
	
    
    var bumpRAn = 1000, bumpLAn = 2000, bumpTAn = 2000, bumpTRd = 5000, bumpTLd = 10000, bumpTri = 1000;
		
	//b2Game.debug();
    
    Paddle = function(data) {
 
		var angularVelocity = 0,
			maxSpeed = 30;
			 
		this.__proto__ = new b2Game.Pawn({
			id: 'paddle', 
			type: 'dynamic',
			image: data.image,
			width: 60,
			height: 25,
			position: data.position,
			density: 1,
			categoryBits: 1
		});			
		
		b2Game.pawns[this.id] = this;

		var revoluteDef = new b2RevoluteJointDef;
		revoluteDef.Initialize(this.body, b2Game.world.GetGroundBody(), this.body.GetWorldPoint(data.revolutePos));  
		revoluteDef.enableLimit = true  ; 
		
		/*if (is_android) {
			revoluteDef.upperAngle = .3;  
			revoluteDef.lowerAngle = -.3; 
		} else {*/
			revoluteDef.upperAngle = .3;  
			revoluteDef.lowerAngle = -.3; 
		//}
		 
		b2Game.world.CreateJoint(revoluteDef);  							

		var paddleDef = new b2DistanceJointDef;
		paddleDef.Initialize(this.body, b2Game.world.GetGroundBody(), this.body.GetWorldPoint(data.springPos1), this.body.GetWorldPoint(data.springPos2));  
		paddleDef.frequencyHz = 8;
		paddleDef.dampingRatio = 1;
		
		this.spring = b2Game.world.CreateJoint(paddleDef);  	
		
		this.update = function() {
			
			
			/*if( b2Game.keyPress[data.button] ) {
				this.body.SetAwake(true);
				this.spring.SetLength(1.5)			
			}
			else if( b2Game.keyPress[data.button] === undefined ) {
				this.body.SetAwake(true);
				this.spring.SetLength(3.5)						
			}*/
			
            
            if (this.id == "paddle_1") {
                if ((((b2Game.touchMove.x < 140) && (b2Game.touchMove.x > 50))  && ((b2Game.touchMove.y < 320) && (b2Game.touchMove.y > 240)) ) || b2Game.keyPress[data.button])          {
                    this.body.SetAwake(true);
				    this.spring.SetLength(1.5);
                    if (!b2Game.keyPress[data.button]) {
                        setTimeout(function() {
                            // Do something after 5 seconds
                            b2Game.touchMove.x = 0;
                            b2Game.touchMove.y = 0;
                        }, 300);
                    } else {
                        b2Game.touchMove.x = 0;
                        b2Game.touchMove.y = 0;
                    }           
                } else {
                    this.body.SetAwake(true);
				    this.spring.SetLength(3.5);
                }
            } else {
                if ((((b2Game.touchMove.x < 270) && (b2Game.touchMove.x > 145))  && ((b2Game.touchMove.y < 320) && (b2Game.touchMove.y > 240)) ) || b2Game.keyPress[data.button])         {
                    this.body.SetAwake(true);
				    this.spring.SetLength(1.5);
                    if (!b2Game.keyPress[data.button]) {
                        setTimeout(function() {
                            // Do something after 5 seconds
                            b2Game.touchMove.x = 0;
                            b2Game.touchMove.y = 0;
                        }, 300);
                    } else {
                        b2Game.touchMove.x = 0;
                        b2Game.touchMove.y = 0;
                    }           
                } else {
                    this.body.SetAwake(true);
				    this.spring.SetLength(3.5);
                }
            }
            
            
			
			this.__proto__.update();
		
		}

	}
		
	Ball = function(vector) {
				
		this.__proto__ = new b2Game.Pawn({
			id: 'ball',
			type: 'dynamic',
			image: 'images/pinball/40575.png',
			shape: 'circle',
			radius: 20/(32*2),
			height: 20,
			width: 20,
			density: 2,
			position: vector,
			categoryBits: 2
		});			
		
		b2Game.pawns[this.id] = this;
		
        
        this.update = function() {
		
            
            
          
            if (this.outOfBounds()) {
                
                //b2Game.pause();
				
                if (balls > 1) {
                    var lives = $("#lives").attr("class");
                    if (lives == "threeleft") {
                        $("#lives").removeClass(lives).addClass("twoleft");
                    }
                    if (lives == "twoleft") {
                        $("#lives").removeClass(lives).addClass("oneleft");
                    }
                    balls--;
                } else {
                    var temp = $("#lives").attr("class");
                    $("#lives").removeClass(temp).addClass("threeleft");
                    $("#header").removeClass("game").addClass("again");
                    $("#game-stage").css("display", "none");
                    $("#game-back").css("display", "none");
                    $("#play-again").css("display", "block");
                    $("#lives").css("display", "none");
					$("#score").css("display", "none");
                    $("#clover").css("display", "none");
                    
                    var jack = $(jackpot).html();
                    jack = parseInt(jack.replace(/,/g, ''));
                    if (score < jack) {
                        $("#play-again #inner p").html("nice try! you may not have beat today&rsquo; high jackpot, but you now know the jackpot and that is a reward in itself. Now just imagine all you could do with all those winnings. Like playing pinball in your personal home arcade... all day long.");
                    }
					score = 0;
                    times = 0;
                    balls = 3;
					$("#total").html(score);
					$("#total").digits();
                }
                this.die();
                if (is_android) {
					new Ball({ x: b2Game.stage.width - .9, y: b2Game.stage.height - 4.8 });
				} else {
					new Ball({ x: b2Game.stage.width - 0.7, y: b2Game.stage.height - 5 });
				}
                
            }
            
				
			this.__proto__.update();
		
		}
		
	}
	
	Launcher = function(vector) {
	
		this.__proto__ = new b2Game.Pawn({
			id: 'launcher',
			type: 'dynamic',
			image: 'images/pinball/40576.png',
			width: 24,
			height: 50,
			position: vector,  
			density: 5,
			categoryBits: 2,
			 fixedRotation: true
		});		
		

		b2Game.pawns[this.id] = this;
		
		var launchDef = new b2DistanceJointDef;
		launchDef.Initialize(this.body, b2Game.world.GetGroundBody(), this.body.GetWorldPoint({x:.1, y:0}), this.body.GetWorldPoint({x:.2, y:2.5}));  
		launchDef.frequencyHz = 11;
		launchDef.dampingRatio = 0;

		this.spring = b2Game.world.CreateJoint(launchDef); 

		this.update = function() {
            
            
		
			/*if( b2Game.keyPress[32] ) {
				this.body.SetAwake(true);
				this.spring.SetLength(1);
               // console.log("is not undefined");
			}
			//spring strength
			else if( b2Game.keyPress[32] === undefined ) {
				this.body.SetAwake(true);
				this.spring.SetLength(3);
                //console.log("is undefined");
			}*/
            
           
            if ((((b2Game.touchMove.x < 290) && (b2Game.touchMove.x > 260)) && ((b2Game.touchMove.y < 300) && (b2Game.touchMove.y > 170))) || b2Game.keyPress[32]) {
                times = 1;
                this.body.SetAwake(true);
				this.spring.SetLength(1.4);
                if (!b2Game.keyPress[32]) {
                    console.log("done by touch");
                    setTimeout(function() {
                        // Do something after 5 seconds
                        b2Game.touchMove.x = 0;
                        b2Game.touchMove.y = 0;
                    }, 500);
                } else {
                    b2Game.touchMove.x = 0;
                    b2Game.touchMove.y = 0;
                }
                
                
            } else {
                this.body.SetAwake(true);
				this.spring.SetLength(3);
            }
				
			this.__proto__.update();
		
		}

		
	}
	
	
	Bumper = function(vector, radial, img, size) {
	
		this.__proto__ = new b2Game.Pawn({
			id: 'launcher',
			type: 'dynamic',
			image: img,
			width: size.wt,
			height: size.ht,
			position: vector,
			density: 2,
			categoryBits: 2,
			shape: 'circle',
			radius: radial,
			fixedRotation: true,
			restitution: .2,
            animation: {cooldown: 10}
		});		

		b2Game.pawns[this.id] = this;

		var springDef = new b2DistanceJointDef;
		springDef.Initialize(this.body, b2Game.world.GetGroundBody(), this.body.GetWorldPoint({x:0, y:0}), this.body.GetWorldPoint({x:0, y:0}));
        
		/*springDef.frequencyHz = 8;
		springDef.dampingRatio = 4.2;*/
		springDef.frequencyHz = 11;
		springDef.dampingRatio = 4.2;

		this.spring = b2Game.world.CreateJoint(springDef); 
        
        this.update = function() {
            
            this.__proto__.update();
            
        }

		
	}
	
	Bumps = function(vector, vertices, count) {
	
		this.__proto__ = new b2Game.Pawn({
			id: 'bumps',
            type: 'dynamic',
            image: 'images/pinball/40590.png',
			position: vector,
			shape: 'tri',
			width: 2,
			height: 2,
			density: 2,
			categoryBits: 2,
			fixedRotation: true,
			count: count,
			vertices: vertices
		});		

		b2Game.pawns[this.id] = this;
		
		var springDef = new b2DistanceJointDef;
		springDef.Initialize(this.body, b2Game.world.GetGroundBody(), this.body.GetWorldPoint({x:0, y:0}), this.body.GetWorldPoint({x:0, y:0}));
        
		/*springDef.frequencyHz = 8;
		springDef.dampingRatio = 4.2;*/
		springDef.frequencyHz = 30;
		springDef.dampingRatio = 8;

		this.spring = b2Game.world.CreateJoint(springDef); 
		
		this.update = function() {
            
            this.__proto__.update();
            
        }

		
	}

	b2Game.edge.setProperties({
		friction: 1,
		maskBits: 2
	});
	
	b2Game.edge.create(
		
        //bottom left
		{x: 1.8, y: b2Game.stage.height},
		{x: .2, y: b2Game.stage.height - .6},
		{x: .2, y: 3}, 
		{x: 3, y: .3},
		
        //top of right side
		{x: b2Game.stage.width-2.5, y: .3},
		
		{x: (b2Game.stage.width - 1/30) - 1.3 + Math.cos(Math.PI*(3/10)), y: 1.9 - Math.sin(Math.PI*(3/10))},
		{x: (b2Game.stage.width - 1/30) - 1.2 + Math.cos(Math.PI*(2/10)), y: 2.1 - Math.sin(Math.PI*(2/10))},
		{x: (b2Game.stage.width - 1/30) - 1.1  + Math.cos(Math.PI*(1/10)), y: 2.2 - Math.sin(Math.PI*(1/10))},
        
		//bottom of right side
        {x: (b2Game.stage.width - 1/30)-.2, y: 6},
		{x: (b2Game.stage.width - 1/30)-.2, y: b2Game.stage.height},
        
		//the launch width 
		{x: (b2Game.stage.width - 25/30)-.2, y: b2Game.stage.height},
        
		//the entry crook
        { x: 8.9, y: b2Game.stage.height - 8.1 },
		{ x: 8.5, y: b2Game.stage.height - 9.3 },
        { x: 7.8, y: b2Game.stage.height - 9.7 },
        { x: 7.2, y: b2Game.stage.height - 9.9 },
        { x: 6.4, y: b2Game.stage.height - 10 }
		
	);
    
    //left outcrop
	b2Game.edge.create(
		{ x: .2, y: b2Game.stage.height - 3.5 },
		{ x: 1, y: b2Game.stage.height - 4.5 },
		{ x: 1, y: b2Game.stage.height - 5 },
		{ x: .2, y: b2Game.stage.height - 5.5 }
	);
	
	//right outcrop
	b2Game.edge.create(
		{ x: (b2Game.stage.width - 25/30)-.3, y: b2Game.stage.height - 3.5 },
		{ x: (b2Game.stage.width - 25/30)-1.2, y: b2Game.stage.height - 4.5 },
		{ x: (b2Game.stage.width - 25/30)-1.2, y: b2Game.stage.height - 5 },
		{ x: (b2Game.stage.width - 25/30)-.3, y: b2Game.stage.height - 5.5 }
	);
	
	//left paddle area
	b2Game.edge.create(
		{ x: 2, y: b2Game.stage.height - .9 },
		{ x: 1, y: b2Game.stage.height - 1.2 },
		{ x: 1, y: b2Game.stage.height - 3 }
	);
	
	//right paddle slope
	b2Game.edge.create(
		{ x: (b2Game.stage.width - 25/30)-.2, y: b2Game.stage.height - .6},
		{ x: b2Game.stage.width - 2.6, y: b2Game.stage.height }
	);
	
	//right paddle area
	b2Game.edge.create(
		{ x: b2Game.stage.width - 2.6, y: b2Game.stage.height - .8 },
		{ x: b2Game.stage.width - .7 - 35/30, y: b2Game.stage.height - 1.1 },
		{ x: b2Game.stage.width - .7 - 35/30, y: b2Game.stage.height - 3 }
	);
	
	//left paddle
	b2Game.edge.create(
		{ x: 1, y: b2Game.stage.height - 2.1 },
		{ x: 2.5, y: b2Game.stage.height - 1.5}
	);
	
	//right paddle
	b2Game.edge.create(
		{ x: 8.1, y: b2Game.stage.height - 2.1 },
		{ x: 6.9, y: b2Game.stage.height - 1.5 }
	);
	
	
		
		new Paddle({
			image: 'images/pinball/40577.png',
			button: 37,
			position: {x:2.5, y:9.7},
			revolutePos: {x: -1.7, y: 0},
			springPos1: {x:0.5, y:0},
			springPos2: {x:1, y:-2.5}
		});
	
		new Paddle({
			image: 'images/pinball/40578.png',
			button: 39,
			position: {x: 5.5, y:9.6},
			revolutePos: {x: 1.75, y: 0},
			springPos1: {x:-0.5, y:0},
			springPos2: {x:-1, y:-2.5}
		});
	
	
		
	new Ball({ x: b2Game.stage.width - 1.11, y: b2Game.stage.height - 5 });

	new Launcher({x: b2Game.stage.width - 38/35, y: b2Game.stage.height - 3  });
	new Bumper({ x: 5, y: 4}, .9, 'images/pinball/40579.png', { ht: 45, wt: 47 });
	new Bumper({ x: 2.5, y: 4.5}, .5, 'images/pinball/40580.png', { ht: 26, wt: 26 });
	new Bumper({ x: 3.5, y: 2.3}, .5, 'images/pinball/40581.png', { ht: 24, wt: 26 });
	
	var points = b2Game.b2Vec2([{x: -1.8, y: -1.5},{x: .5, y: -.5},{x: 1, y: .5}]);
	var pointsTop = b2Game.b2Vec2([{x: -2, y: -1},{x: -1.2, y: -1},{x: -4.2, y: 1.5},{x: -4.9, y: 1.8}]);
	var pointsTriL = b2Game.b2Vec2([{x: -1.3, y: -.7},{x:-1, y: -1.4},{x: -.3, y: -.3}]);
	var pointsTriR = b2Game.b2Vec2([{x: -.3, y: -.3},{x:.6, y: -1.4},{x: .8, y: -.7}]);
	
	new Bumps({ x: 8, y: 3},points, points.length);
	new Bumps({ x: 5, y: 1},pointsTop, pointsTop.length);
	new Bumps({ x: 3.1, y:9.2},pointsTriL, pointsTriL.length);
	new Bumps({ x: 6.3, y: 9.1},pointsTriR, pointsTriR.length);

	b2Game.background({ image: 'images/pinball/40800.png' })
	b2Game.run();
    
    $("#start").on("touchstart click", function () {
        console.log("click");
		if (is_android) {
			//$("#position").html("this is android");
			$("#header").removeClass("how").addClass("again");
			$("#how-to").css("display", "none");
			$("#game-stage").css("display", "none");
            $("#game-back").css("display", "none");
			$("#play-again").css("display", "none");
			$("#android").css("display", "block");
			$("#lives").css("display", "none");
			$("#score").css("display", "none");
		} else {
			$("#how-to").css("display", "none");
			$("#game-stage").css("display", "block");
            $("#game-back").css("display", "block");
			$("#lives").css("display", "block");
			$("#score").css("display", "block");
			$("#header").removeClass("how").addClass("game");
		}
        
    });
    
    $("#play").on("touchstart click", function () {
        console.log("click");
        $("#play-again").css("display", "none");
        $("#game-stage").css("display", "block");
        $("#game-back").css("display", "block");
        $("#lives").css("display", "block");
		$("#score").css("display", "block");
        $("#header").removeClass("again").addClass("game");
    });
	
	
    var listener = new Box2D.Dynamics.b2ContactListener;
    listener.BeginContact = function(contact) {
        
        //console.log("Object A: " + contact.GetFixtureA().GetBody().GetUserData().id);
        //console.log("Object B: " + contact.GetFixtureB().GetBody().GetUserData().id);
        
        //console.log(score);
        
        if (contact.GetFixtureB().GetBody().GetUserData().id == "launcher_2") {
            //var bumper = contact.GetFixtureB().GetBody().GetUserData();
            //console.log(contact.GetFixtureB().GetBody().GetPosition().x);
            score = score + bumpRAn;
            //console.log(score);
            //console.log(times);
            $("#total").html(score);
			$("#total").digits();
        }
        if (contact.GetFixtureB().GetBody().GetUserData().id == "launcher_3") {
            score = score + bumpLAn;
            //console.log(score);
            //console.log(times);
             $("#total").html(score);
			 $("#total").digits();
        }
        if (contact.GetFixtureB().GetBody().GetUserData().id == "launcher_4") {
            score = score + bumpTAn;
            //console.log(score);
            //console.log(times);
             $("#total").html(score);
			 $("#total").digits();
        }
		if ((contact.GetFixtureB().GetBody().GetUserData().id == "bumps_1") && (times > 0)) {
            score = score + bumpTRd;
            //console.log(score);
            //console.log(times);
             $("#total").html(score);
			 $("#total").digits();
        }
		if ((contact.GetFixtureB().GetBody().GetUserData().id == "bumps_2") && (times > 0)) {
            score = score + bumpTLd;
            //console.log(score);
            //console.log(times);
             $("#total").html(score);
			 $("#total").digits();
        }
		if ((contact.GetFixtureB().GetBody().GetUserData().id == "bumps_3") && (times > 0)) {
            score = score + bumpTri;
            //console.log(score);
            //console.log(times);
             $("#total").html(score);
			 $("#total").digits();
        }
    }
    
    b2Game.world.SetContactListener(listener);
});