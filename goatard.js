window.onload = function() {

    var game = new Phaser.Game(480, 640, Phaser.AUTO, '', { preload: preload, 
                                                            create: create, 
                                                            update: update,
                                                            render: render }),
        platforms,
        player,
        cursors,
        ground,
        centerText,
        scoreText,
        cliffsHit = 0,
        
        gameActive,
        falling,
        worldSpeed = 150,
        maxJumpSpeed = 200;
        
    function preload () {
        game.load.image('ground', 'assets/sprites/platform.png');
        game.load.spritesheet('dude', 'assets/sprites/dude.png', 32, 48);
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
        game.physics.arcade.collide(player, platforms);
        
        if( !cursors.up.isDown && !falling ) {
            falling = true;
        }
        
        if( player.body.touching.down ) {
            falling = false;
            player.body.velocity.x = worldSpeed;
            if( cursors.up.isDown ) {
                cliffsHit++;
                scoreText.text = '' + cliffsHit;
                scoreText.visible = true;
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
        platforms = game.add.group();
        platforms.enableBody = true;

        ground = platforms.create(0, game.world.height - 128, 'ground');
        ground.scale.setTo(2, 4);
        ground.checkWorldBounds = true;
        ground.outOfBoundsKill = true;
        ground.body.immovable = true;
        ground.body.velocity.x = -worldSpeed;

        addCliff();        
    }
    
    function addCliff() {
        if( gameActive ) {
            var cliff = platforms.create(game.world.width + 150 + (150 * Math.random()), game.world.height - 128, 'ground');
            cliff.scale.setTo(0.01 + (0.1 * Math.random()), 4);
            cliff.checkWorldBounds = true;
            cliff.events.onEnterBounds.add(function() {
               cliff.outOfBoundsKill = true;
               addCliff();
            });
            cliff.body.immovable = true;
            cliff.body.velocity.x = -worldSpeed;
        }
    }
    
    function setupPlayer() {
        player = game.add.sprite(game.world.width * .25, game.world.height - 180, 'dude');
        game.physics.arcade.enable(player);
        player.body.gravity.y = 600;
        player.body.velocity.x = worldSpeed;
        player.checkWorldBounds = true;
        player.events.onOutOfBounds.add(function() {
            gameOver();    
        });
        
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
        
        falling = false;
    }
    
    function setupUI() {
        scoreText = game.add.text(game.world.centerX, game.world.centerY - 60, '', { font: "80px Arial", fill: "#F78181", align: "center" });
        scoreText.anchor.setTo(0.5, 0.5);
        
        centerText = game.add.text(game.world.centerX, game.world.centerY, '', { font: "40px Arial", fill: "#ffffff", align: "center" });
        centerText.anchor.setTo(0.5, 0.5);
    }
    
    function render() {
        //game.debug.spriteInfo(ground, 32, 32);
    }
    
    function gameOver() {
        console.log('should be game over');
        centerText.text = 'Game Over';
        centerText.visible = true;
        gameActive = true;
    }
};