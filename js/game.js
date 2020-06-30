var canvas
var ctx
var fpsGame = 20
var fpsEditor = 60
var fps = fpsGame

var canvasX = 500 // Pixeles ancho 
var canvasY = 500 // Pixeles alto

var tileX, tileY

// Variables relacionadas con el tablero de juego
var board
var rows = 100
var columns = 100

var white = '#FFFFFF'
var black = '#000000'
var red = '#FF0000'

var pause = true

var posX
var posY

var mouseX = 0
var mouseY = 0

const createArray2D = (rows, columns) => {
    var object = new Array(rows)

    for( y = 0; y < rows; y++ ){
       object[y] = new Array(columns) 
    }

    return object
}

// Agente o turmita
var Agent = function(x, y, state){
    
    this.x = x
    this.y = y
    this.state = state           // muerto = 0, vivo = 1 
    this.nextState = this.state  // estado en el siguiente ciclo    

    this.neighbors = []          // guarda sus vecinos


    //Metodo que aniade los vecinos del objeto actual
    this.addNeighbors = () => {
        var xNeighbor
        var yNeighbor

        for( i = -1; i < 2; i++){
            for( j = -1; j < 2; j++){
                
                xNeighbor = (this.x + j + columns) % columns
                yNeighbor = (this.y + i + rows) % rows
                
                // Descartamos el agente actual (yo no puedo ser mi propio vecino)
                if(i != 0 || j != 0){
                    this.neighbors.push(board[yNeighbor][xNeighbor])
                }
            }
        }
    }

    this.render = () => {
        var color
        
        if(this.state == 1){
            color = white
        } else {
            color = black
        }

        ctx.fillStyle = color
        ctx.fillRect(this.x * tileX, this.y * tileY, tileX, tileY)
    }


    // Ponemos las reglas para actualizar el juego
    this.newCicle = () => {
        var sum = 0
        
        // Calculamos la cantidad de vecinos vivos
        for( i = 0; i < this.neighbors.length; i++ ){
            sum += this.neighbors[i].state
        }

        // Aplicamos normas
        this.nextState = this.state     // Por defecto queda igual

        // MUERTE: tiene menos de 2 o mas de 3
        if( sum < 2 || sum > 3 )
            this.nextState = 0
        
        // VIDA/REPRODUCCION: tiene exactamente 3 vecinos
        if( sum == 3 )
            this.nextState = 1
    }

    this.mutate = () => this.state = this.nextState

    this.change = () => {
        if(this.state == 1){
            this.state = 0
        } else {
            this.state = 1
        }
    }

    this.renderState = (newState) => this.state = newState

}

const inicializeBoard = (board) => {
    var state = 0

    for( y = 0; y < rows; y++ ){
        for( x = 0; x < columns; x++ ){
            //state = Math.floor(Math.random()*2)
            board[y][x] = new Agent(x, y, state)
        }
    }

    for( y = 0; y < rows; y++ ){
        for( x = 0; x < columns; x++ ){
            board[y][x].addNeighbors()
        }
    }
}

const inicialize = () => {
    console.log('Loading')

    // Asocianmos el canvas
    canvas = document.getElementById('screen')
    ctx = canvas.getContext('2d')

    // Ajustamos el tamanio
    canvas.width = canvasX;
    canvas.height = canvasY;

    // Calculamos el tamanio de los tiles
    tileX = Math.floor(canvasX / rows)
    tileY = Math.floor(canvasX / columns)

    console.log('X', tileX)
    console.log('Y', tileY)

    //Mouse
    canvas.addEventListener('mousedown', clickMouse, false)
    canvas.addEventListener('mouseup', letClick, false)
    canvas.addEventListener('mousemove', mousePosition, false)

    //Teclado
    document.addEventListener('keydown', (key) => {
        console.log(key.keyCode)
    })

    document.addEventListener('keyup', (key) => {
        //ESPACIO: pause
        if(key.keyCode == 32){
            controlPause()
            console.log('pause', pause)
        }

        //R: reiniciar tablero  
        if(key.keyCode == 82){
            inicializeBoard(board)
            console.log('reinicio tablero')
        }

        //Q: aumento FPS
        if(key.keyCode == 81){
            gainFPS()
        }

        //W: bajo FPS
        if(key.keyCode == 87){
            loseFPS()
        }
    })

    // Creamos el tablero  
    board = createArray2D(rows, columns)

    // Inicializamos table
    inicializeBoard(board)

    // Ejecutamos el bucle principal
    setInterval( () => main(), 1000 / fps)
}

const renderBoard = (board) => {

    // Dibuja los agentes
    for( y = 0; y < rows; y++ ){
        for( x = 0; x < columns; x++ ){
            board[x][y].render()
        }
    }

    if(pause == false){
        nextCicle(board)
    }

    // Dibujamos el mouse
    if(pause == true){
        posX = Math.floor(mouseX / tileX) - 1
        posY = Math.floor(mouseY / tileY) - 1

        ctx.fillStyle = red
        ctx.fillRect(posX * tileX, posY * tileY, tileX, tileY)
    }
}

const nextCicle = (board) => {
    
    // Calcula el siguiente ciclo
    for( y = 0; y < rows; y++ ){
        for( x = 0; x < columns; x++ ){
            board[x][y].newCicle()
        }
    }
    
    // Aplica la mutacion
     for( y = 0; y < rows; y++ ){
        for( x = 0; x < columns; x++ ){
            board[x][y].mutate()
        }
    }
}

const gainFPS = () => {
    if(fpsGame < 70)
        fpsGame += 10
    fps = fpsGame
}

const loseFPS = () => {
    if(fpsGame > 10)
        fpsGame-=10
    fps = fpsGame
}

const clickMouse = (e) => {
    console.log(mouseX + ' ' + mouseY)
}

const letClick = (e) => {
    console.log('Let mouse')
    changeMouse()
}

const mousePosition = (e) => {
    mouseX = e.pageX
    mouseY = e.pageY
}

const changeMouse = () => {
	board[posY][posX].change();
}

const controlPause = () => {
    if(pause){
        pause = false
        fps = fpsGame
    } else {
        pause = true
        fps = fpsEditor
    }
}

const deleteCanvas = () => {
    canvas.width = canvas.width
    canvas.height = canvas.height   
}


const main = () => {
    // console.log('fotograma')
    deleteCanvas()
    renderBoard(board)
}