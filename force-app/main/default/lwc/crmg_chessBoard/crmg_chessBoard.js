import { LightningElement, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import JQUERY from '@salesforce/resourceUrl/jquery';
import CHESSBOARD_JS from '@salesforce/resourceUrl/chessboardjs';
import CHESSBOARD_CSS from '@salesforce/resourceUrl/chessboardcss';
import CHESS_PIECE_IMAGES from '@salesforce/resourceUrl/chesspieceimages';
import CHESS_JS from '@salesforce/resourceUrl/chessjs';

export default class ChessBoard extends LightningElement {
    board1; // Instance of Chessboard.js
    game; // Instance of chess.js
    isChessboardJsInitialized = false; // Flag to track initialization
    jqueryJsLoaded = false; // Flag to track jQuery loading
    chessJsLoaded = false; // Flag to track Chess.js loading

    /**
     * Lifecycle hook called when the component is rendered.
     * Initializes resources and the chessboard if not already done.
     */
    async renderedCallback() {
        if (this.isChessboardJsInitialized) {
            return;
        }

        try {
            await this.loadResources();
            this.createBoardElement();
            this.createControlButtons();
            this.createTurnIndicator();
            this.initializeChessBoard();
            this.isChessboardJsInitialized = true;
        } catch (error) {
            console.error('Error loading resources or initializing Chessboard:', error);
        }
    }

    /**
     * Loads required JavaScript and CSS resources.
     */
    async loadResources() {
        try {
            await loadScript(this, JQUERY);
            this.jqueryJsLoaded = true;
            await loadScript(this, CHESSBOARD_JS);
            await loadScript(this, CHESS_JS);
            await loadStyle(this, CHESSBOARD_CSS);
            this.chessJsLoaded = true;
        } catch (error) {
            console.error('Error loading resources', error);
            throw error;
        }
    }

    /**
     * Creates and appends the chessboard element to the container.
     */
    createBoardElement() {
        const boardContainer = this.template.querySelector('lightning-card');

        if (boardContainer) {
            const boardElement = document.createElement('div');
            boardElement.id = 'board1';
            boardElement.style.width = '600px';
            boardElement.style.height = '600px';
            boardElement.style.margin = '20px auto';
            boardElement.style.border = '1px solid #000';
            boardContainer.appendChild(boardElement);
        } else {
            console.error('Cannot find lightning-card container');
        }
    }

    /**
     * Creates and appends control buttons (Clear Board, Start Position, Flip Board) to the container.
     */
    createControlButtons() {
        const boardContainer = this.template.querySelector('lightning-card');

        if (boardContainer) {
            // Clear Board Button
            const clearBoardBtn = document.createElement('button');
            clearBoardBtn.id = 'clearBoardInstantBtn';
            clearBoardBtn.innerText = 'Clear Board Instant';
            clearBoardBtn.style.margin = '10px';
            clearBoardBtn.addEventListener('click', () => {
                if (this.board1) {
                    this.board1.clear(false);
                    this.game.reset();
                    this.updateTurnIndicator();
                }
            });
            boardContainer.appendChild(clearBoardBtn);

            // Start Position Button
            const startPositionBtn = document.createElement('button');
            startPositionBtn.id = 'startPositionBtn';
            startPositionBtn.innerText = 'Start Position';
            startPositionBtn.style.margin = '10px';
            startPositionBtn.addEventListener('click', () => {
                if (this.board1) {
                    this.board1.start();
                    this.game.reset();
                    this.updateTurnIndicator();
                }
            });
            boardContainer.appendChild(startPositionBtn);

            // Flip Board Button
            const flipBtn = document.createElement('button');
            flipBtn.id = 'flipBtn';
            flipBtn.innerText = 'Flip Board';
            flipBtn.style.margin = '10px';
            flipBtn.addEventListener('click', () => {
                if (this.board1) {
                    this.board1.flip();
                }
            });
            boardContainer.appendChild(flipBtn);
        } else {
            console.error('Cannot find lightning-card container');
        }
    }

    /**
     * Creates and appends the turn indicator element to the container.
     */
    createTurnIndicator() {
        const boardContainer = this.template.querySelector('lightning-card');

        if (boardContainer) {
            const turnIndicator = document.createElement('div');
            turnIndicator.id = 'turnIndicator';
            turnIndicator.style.margin = '10px';
            turnIndicator.style.fontSize = '18px';
            turnIndicator.innerText = "White's turn";
            boardContainer.appendChild(turnIndicator);
        } else {
            console.error('Cannot find lightning-card container');
        }
    }

    /**
     * Initializes the chessboard and game instances.
     */
    initializeChessBoard() {
        if (!this.jqueryJsLoaded || !this.chessJsLoaded || typeof Chessboard === 'undefined') {
            console.error('jQuery, Chessboard.js or chess.js is not available globally');
            return;
        }

        const pieceThemeUrl = `${CHESS_PIECE_IMAGES}/img/chesspieces/wikipedia/{piece}.png`;

        try {
            const boardElement = this.template.querySelector('#board1');
            if (!boardElement) {
                console.error('DOM element #board1 not found');
                return;
            }

            this.game = new Chess();

            this.board1 = Chessboard(boardElement, {
                position: 'start',
                pieceTheme: pieceThemeUrl,
                draggable: true,
                dropOffBoard: 'snapback',
                sparePieces: false,
                moveSpeed: 'slow',
                snapbackSpeed: 500,
                snapSpeed: 100,
                onDragStart: this.onDragStart.bind(this),
                onDrop: this.onDrop.bind(this),
                onMouseoutSquare: this.onMouseoutSquare.bind(this),
                onMouseoverSquare: this.onMouseoverSquare.bind(this),
                onSnapEnd: this.onSnapEnd.bind(this),
            });

            console.log('Chessboard initialized successfully');
            this.updateTurnIndicator();
        } catch (error) {
            console.error('Error initializing Chessboard:', error);
        }
    }

    /**
     * Removes the grey background from all highlighted squares.
     */
    removeGreySquares() {
        const squares = this.template.querySelectorAll('.square-55d63');
        squares.forEach(square => {
            square.style.background = '';
        });
    }

    /**
     * Applies a grey background to the specified square.
     * @param {string} square - The square to highlight (e.g., 'e2').
     */
    greySquare(square) {
        const squareElement = this.template.querySelector(`.square-${square}`);
        if (squareElement) {
            const background = squareElement.classList.contains('black-3c85d') ? '#696969' : '#a9a9a9';
            squareElement.style.background = background;
        }
    }

    /**
     * Handles the event when a piece is dragged.
     * Prevents dragging if the game is over or if it's not the player's turn.
     * @param {string} source - The square from which the piece is being dragged.
     * @param {string} piece - The piece being dragged.
     */
    onDragStart(source, piece) {
        if (this.game.game_over()) return false;

        if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    }

    /**
     * Handles the event when a piece is dropped.
     * Makes the move using chess.js and updates the board position.
     * @param {string} source - The square from which the piece was dragged.
     * @param {string} target - The square to which the piece is dropped.
     */
    onDrop(source, target) {
        this.removeGreySquares();

        const move = this.game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (move === null) return 'snapback';

        this.board1.position(this.game.fen());
        this.updateTurnIndicator();
    }

    /**
     * Handles the event when the mouse hovers over a square.
     * Highlights the hovered square and its legal moves.
     * @param {string} square - The square being hovered over.
     * @param {string} piece - The piece on the square (optional).
     */
    onMouseoverSquare(square, piece) {
        this.removeGreySquares(); // Clear previous highlights

        // Get list of legal moves for the piece on the square
        const moves = this.game.moves({
            square: square,
            verbose: true
        });

        if (moves.length === 0) return;

        this.greySquare(square);

        // Highlight only the legal move squares for the piece
        for (const move of moves) {
            if (move.from === square) {
                this.greySquare(move.to);
            }
        }
    }

    /**
     * Handles the event when the mouse leaves a square.
     * Removes the highlights from the square.
     * @param {string} square - The square that the mouse left.
     * @param {string} piece - The piece on the square (optional).
     */
    onMouseoutSquare(square) {
        this.removeGreySquares();
    }

    /**
     * Handles the event when a move has been completed (piece is in final position).
     * Updates the board position to reflect the current game state.
     */
    onSnapEnd() {
        this.board1.position(this.game.fen());
    }

    /**
     * Updates the turn indicator element to reflect the current turn.
     */
    updateTurnIndicator() {
        const turnIndicator = this.template.querySelector('#turnIndicator');
        if (turnIndicator) {
            const moveColor = this.game.turn() === 'b' ? 'Black' : 'White';
            turnIndicator.innerText = `${moveColor}'s turn`;
        } else {
            console.error('Turn indicator element not found');
        }
    }
}
