class Cell {

    y = -1;
    x = -1;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getX = () => {
        return this.x;
    }

    getY = () => {
        return this.y;
    }

    equals = (other) => {
        if (this === other) return true;
        if (this.constructor !== other.constructor) return false;
        return this.x == other.getX() && this.y == other.getY();
    }
}

class SnakeGame {
    // display options
    rows = 20;
    columns = 20;
    squareSize = 20;

    // game variables
    scoreCounter = 0;
    direction = 0;
    inGame = false;
    fruit;
    snake = [];
    pause = false;

    timer;
    timerInterval = 150;

    // game colors
    snakeColor = "#5F9EA0";
    fruitColor = "#FF6347";
    bgColor = "#000000";

    statLabel;
    gameOverLabel;
    newGameButton;




    constructor(gameDisplayParent, statLabel, gameOverLabel, newGameButton) {
        const { rows, columns, squareSize, bgColor } = this;
        console.log(gameDisplayParent);
        this.gameDisplay = new SquareGrid(rows, columns, squareSize, gameDisplayParent);
        this.gameDisplay.setDefaultColor(bgColor);
        this.gameDisplay.setGridColor(false);
        this.gameDisplay.setAutoRedraw(false);

        this.statLabel = statLabel;
        this.gameOverLabel = gameOverLabel;
        this.newGameButton = newGameButton;

        document.body.addEventListener('keydown', (e) => {
            if (this.inGame) {
                this.keyPressed(e);
            }
        });

        this.newGameButton.addEventListener('click', () => {
            this.start();
        });
    }

    keyPressed = (e) => {
        if (e.key === " ") {
            this.pause = !this.pause;
            if (this.pause) {
                this.clearTimer();
            } else {
                this.attachTimer(this.timerInterval);
            }
        } else if (!this.pause) {
            if (e.key === "ArrowUp") {
                this.up();
            } else if (e.key === "ArrowLeft") {
                this.left();
            } else if (e.key === "ArrowRight") {
                this.right();
            } else if (e.key === "ArrowDown") {
                this.down();
            }
        }
    }

    start = () => {
        this.createSnake(5, 5);
        this.createFruit();
        this.direction = 0;
        this.scoreCounter = 0;
        this.gameOverLabel.innerText = "";
        this.inGame = true;
        this.attachTimer(this.timerInterval);
        this.newGameButton.disabled = true;
    }

    gameOver = () => {
        this.clearTimer();
        this.gameOverLabel.innerText = "GAME OVER!";
        this.inGame = false;
        this.newGameButton.disabled = false;
    }

    tick = () => {
        this.updateStats();
        this.move();
        this.refresh();
    }

    attachTimer = (millis) => {
        this.clearTimer();
        this.timer = setInterval(this.tick, millis);
        this.timerInterval = millis;
    }

    clearTimer = () => {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    refresh = () => {
        this.gameDisplay.clearGrid();
        this.drawSnake();
        this.drawFruit();
        this.gameDisplay.redraw();
    }

    drawFruit = () => {
        const { gameDisplay, fruit, fruitColor } = this;
        gameDisplay.setCellColor(fruit.getY(), fruit.getX(), fruitColor);
    }

    drawSnake = () => {
        const { gameDisplay, snake, snakeColor } = this;
        snake.forEach((segment) => gameDisplay.setCellColor(segment.getY(), segment.getX(), snakeColor));
    }

    updateStats = () => {
        const { statLabel, scoreCounter, snake } = this;
        statLabel.innerHTML = `Length: ${snake.length}, score: ${scoreCounter}`;
    }

    createFruit = () => {
        const { rows, columns } = this;
        let success = false;
        let x = 0, y = 0;
        while (!success) {
            // don't spawn the fruit in the corners
            x = this.getRandomInt(1, columns);
            y = this.getRandomInt(1, rows);
            if (this.withinSnake(x, y)) continue;
            success = true;
        }
        this.fruit = new Cell(x, y);
    }

    createSnake = (x, y) => {
        const snake = [];
        snake.push(new Cell(x, y));
        snake.push(new Cell(x - 1, y));
        snake.push(new Cell(x - 2, y));
        this.snake = snake;
    }

    right = () => {
        if (this.direction != 2) { // can't turn 180 degrees
            this.direction = 0;
            this.move();
        }
    }

    down = () => {
        if (this.direction != 3) { // can't turn 180 degrees
            this.direction = 1;
            this.move();
        }
    }

    left = () => {
        if (this.direction != 0) { // can't turn 180 degrees
            this.direction = 2;
            this.move();
        }
    }

    up = () => {
        if (this.direction != 1) { // can't turn 180 degrees
            this.direction = 3;
            this.move();
        }
    }

    move = () => {
        const { rows, columns, fruit, snake, direction } = this;
        let nextX = snake[0].getX();
        let nextY = snake[0].getY();
        switch (direction) {
            case 0:
                nextX += 1;
                break;
            case 1:
                nextY += 1;
                break;
            case 2:
                nextX -= 1;
                break;
            case 3:
                nextY -= 1;
        }

        if (nextX == 0 || nextY == 0 || nextX == columns || nextY == rows) {
            this.gameOver();
            return;
        }

        if (nextX == fruit.getX() && nextY == fruit.getY()) {
            this.grow();
            this.scoreCounter += 100;
            this.createFruit();
        }
        this.selfCollision(nextX, nextY);
        snake.unshift(new Cell(nextX, nextY));
        snake.pop();
        this.refresh();

    }

    grow = () => {
        const { snake, direction } = this;
        let size = snake.length;
        const ultimateX = snake[size - 1].getX();
        const ultimateY = snake[size - 1].getY();
        if (size > 1) {
            let penultimateX = snake[size - 2].getX();
            let penultimateY = snake[size - 2].getY();
            const dx = ultimateX - penultimateX;
            const dy = ultimateY - penultimateY;
            snake.push(new Cell(ultimateX + dx, ultimateY + dy));
        } else {
            switch(direction) {
            case 0:
                snake.push(new Cell(ultimateX - 1, ultimateY));
                break;
            case 1:
                snake.push(new Cell(ultimateX, ultimateY - 1));
                break;
            case 2:
                snake.add(new Cell(ultimateX + 1, ultimateY));
                break;
            case 3:
                snake.add(new Cell(ultimateX, ultimateY + 1));
            }
        }
    }

    selfCollision = (x, y) => {
        const { snake } = this;
        if (x < 0 || y < 0) return;
        let collision = -1;
        collision = snake.findIndex(({ x: xx, y: yy }) => xx == x && yy == y);
        if (collision != -1) {
            snake.splice(collision);
            this.scoreCounter = Math.max(this.scoreCounter - 1000, 0);
        }
    }

    withinSnake = (x, y) => {
        return this.snake.find(({ x: xx, y: yy }) => xx == x && yy == y);
    }

    // returns a random value between min and max (exclusive)
    getRandomInt = (min, max) => {
        return min + Math.floor(Math.random() * (max - min));
    }

}
