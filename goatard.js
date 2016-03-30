window.onload = function() {

    var game = new Phaser.Game(480, 640, Phaser.AUTO, '', { preload: preload, 
                                                            create: create, 
                                                            update: update,
                                                            render: render }),
        /** Game Objects **/
        platform,
        cliffs,
        cliffsPool = [],
        player,
        cursors,
        ground,

        /** UI **/
        centerText,
        scoreText,
        scoreRecordText,
        tryAgainButton,

        /** Control **/
        maxScore = 0,
        score = 0,
        gameActive,
        falling,
        worldSpeed = 150,
        maxJumpSpeed = 200;
        
    function preload () {
        game.load.image('ground', 'assets/sprites/platform.png');
        game.load.spritesheet('dude', 'assets/sprites/dude.png', 32, 48);
        game.load.image('tryAgain', 'assets/ui/btn-game-cont.png', 50, 50);
    }

    function create () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        gameActive = true;
        
        setupEnv();
        setupCliffs();
        setupPlayer();
        setupUI();
        
        cursors = game.input.keyboard.createCursorKeys();
    }
    
    function update() {
        game.physics.arcade.collide(player, platform);
        game.physics.arcade.collide(player, cliffs, landedOnCliff);
        
        if( !cursors.up.isDown && !falling ) {
            falling = true;
        }
        
        if( player.body.touching.down ) {
            falling = false;
            player.body.velocity.x = worldSpeed;
            if( cursors.up.isDown ) {
                player.body.velocity.x = 0;
                player.body.velocity.y = -50;
            }
        } else {
            if( cursors.up.isDown && !falling ) {
                if( Math.abs(player.body.velocity.y) < maxJumpSpeed ) {
                    player.body.velocity.y -= 50;
                }
            }
        }
    }
    
    function setupEnv() {
        game.stage.backgroundColor = "#81BEF7";
    }
    
    function setupCliffs() {
        platform = game.add.group();
        platform.enableBody = true;
        
        ground = platform.create(0, 0, 'ground');
        ground.scale.setTo(2, 4);
        ground.checkWorldBounds = true;
        ground.outOfBoundsKill = false;
        ground.body.immovable = true;
        
        ground.events.onOutOfBounds.add(function() {
           ground.body.velocity.x = 0; 
        });
        
        groundInitialPosition();
        
        cliffs = game.add.group();
        cliffs.enableBody = true;

        addCliff();
    }
    
    function groundInitialPosition() {  
        ground.x = 0;
        ground.y = game.world.height - 128;
        ground.body.velocity.x = -worldSpeed;        
    }
    
    function addCliff() {
        console.log('cliff pool: ' + cliffsPool.length);
        var cliff = cliffs.create(game.world.width + 150 + (150 * Math.random()), game.world.height - 128, 'ground');
        cliff.scale.setTo(0.01 + (0.1 * Math.random()), 4);
        cliff.checkWorldBounds = true;
        cliff.events.onEnterBounds.add(function() {
           cliff.outOfBoundsKill = true;
           addCliff();
        });
        cliff.events.onKilled.add(function() {
            var deadCliff = cliffsPool.shift();
            deadCliff.events.destroy();
            deadCliff.destroy();
        });
        cliff.body.immovable = true;
        cliff.body.velocity.x = -worldSpeed;
        cliffsPool.push(cliff);
    }
    
    function landedOnCliff(obj1, obj2) {
        if( falling ) {
            score++;
            scoreText.text = '' + score;
            scoreText.visible = true;
        }
    }
    
    function setupPlayer() {
        player = game.add.sprite(0, 0, 'dude');
        game.physics.arcade.enable(player);
        player.checkWorldBounds = true;
        player.events.onOutOfBounds.add(function() {
            player.body.velocity.x = 0;
            player.body.gravity.y = 0;
            gameOver();    
        });
        
        playerInitialPosition();
        
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
        
        falling = false;
    }
    
    function playerInitialPosition() {
        player.x = game.world.width * .25;
        player.y = game.world.height - 200;
        player.body.gravity.y = 900;
        player.body.velocity.x = worldSpeed;        
    }
    
    function tryAgain() {
        gameActive = true;
        
        groundInitialPosition();
        playerInitialPosition();
        toggleGameOverText(false);
        score = 0;
        scoreText.text = '' + score;
        scoreText.visible = false;
        
        for( var i = 0; i < cliffsPool.length; i++  ) {
            cliffsPool[i].events.destroy();
            cliffsPool[i].destroy();
        }
        cliffsPool = [];
        
        addCliff();
    }
    
    function setupUI() {
        scoreText = game.add.text(game.world.centerX, game.world.centerY - 60, '', { font: "80px Arial", fill: "#F78181", align: "center" });
        scoreText.anchor.setTo(0.5, 0.5);
        
        centerText = game.add.text(game.world.centerX, game.world.centerY, '', { font: "40px Arial", fill: "#ffffff", align: "center" });
        centerText.anchor.setTo(0.5, 0.5);
        
        scoreRecordText = game.add.text(game.world.centerX, 0, scoreLabel(), { font: "20px Arial", fill: "#ffffff", align: "center" });
        scoreRecordText.anchor.setTo(0.5, 0.0);
        scoreRecordText.visible = true;
        
        tryAgainButton = game.add.button(game.world.centerX, game.world.centerY + 100, 'tryAgain', tryAgain, this, 2, 1, 0);
        tryAgainButton.anchor.setTo(0.5, 0.5);
        tryAgainButton.visible = false;
        tryAgainButton.events.onInputDown.add(function() {
            tryAgainButton.visible = false;
            tryAgain();
        });
    }
    
    function toggleGameOverText(on) {
        centerText.visible = on;
        tryAgainButton.visible = on;
    }
    
    function render() {
        //game.debug.spriteInfo(player, 32, 32);
        //game.debug.body(player);
    }
    
    function gameOver() {
        centerText.text = 'Game Over';
        toggleGameOverText(true);
        
        if( score >  maxScore ) {
            maxScore = score;
        }
        scoreRecordText.text = scoreLabel();
        
        gameActive = false;
    }
    
    function scoreLabel() {
        return 'SCORE: ' + maxScore;
    }
};