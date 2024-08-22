import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import JQUERY from '@salesforce/resourceUrl/jquery';
import CHESSBOARD_JS from '@salesforce/resourceUrl/chessboardjs';
import CHESSBOARD_CSS from '@salesforce/resourceUrl/chessboardcss';
import CHESS_PIECE_IMAGES from '@salesforce/resourceUrl/chesspieceimages';
import CHESS_JS from '@salesforce/resourceUrl/chessjs'

export default class ChessBoard extends LightningElement {
    board1;
    game; // Instance of chess.js
    isChessboardJsInitialized = false;
    jqueryJsLoaded = false;
    chessJsLoaded = false;

    async renderedCallback() {
        if (this.isChessboardJsInitialized) {
            return;
        }

        try {
            await this.loadResources();
            this.createBoardElement();
            this.createControlButtons();
            this.initializeChessBoard();

            this.isChessboardJsInitialized = true;
        } catch (error) {
            console.error('Error loading resources or initializing Chessboard:', error);
        }
    }

    async loadResources() {
        try {
            await loadScript(this, JQUERY);
            this.jqueryJsLoaded = true;
            await loadScript(this, CHESSBOARD_JS);
            await loadScript(this, CHESS_JS); // Load chess.js
            await loadStyle(this, CHESSBOARD_CSS);
            this.chessJsLoaded = true;
        } catch (error) {
            console.error('Error loading resources', error);
            throw error;
        }
    }

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

    createControlButtons() {
        const boardContainer = this.template.querySelector('lightning-card');
        
        if (boardContainer) {
            // Create Clear Board Instant Button
            const clearBoardBtn = document.createElement('button');
            clearBoardBtn.id = 'clearBoardInstantBtn';
            clearBoardBtn.innerText = 'Clear Board Instant';
            clearBoardBtn.style.margin = '10px';
            clearBoardBtn.addEventListener('click', () => {
                if (this.board1) {
                    this.board1.clear(false);
                    this.game.reset(); // Reset chess game state
                    this.updateStatus(); // Update status display
                }
            });
            boardContainer.appendChild(clearBoardBtn);

            // Create Start Position Button
            const startPositionBtn = document.createElement('button');
            startPositionBtn.id = 'startPositionBtn';
            startPositionBtn.innerText = 'Start Position';
            startPositionBtn.style.margin = '10px';
            startPositionBtn.addEventListener('click', () => {
                if (this.board1) {
                    this.board1.start();
                    this.game.reset(); // Reset chess game state
                    this.updateStatus(); // Update status display
                }
            });
            boardContainer.appendChild(startPositionBtn);

            // Create Flip Board Button
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

            // Initialize chess.js
            this.game = new Chess();

            // Initialize Chessboard.js
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
                onSnapEnd: this.onSnapEnd.bind(this),
            });

            console.log('Chessboard initialized successfully');
        } catch (error) {
            console.error('Error initializing Chessboard:', error);
        }
    }

    onDragStart(source, piece, position, orientation) {
        // Prevent piece pick up if game is over
        if (this.game.game_over()) return false;

        // Only allow the current side's pieces to be picked up
        if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    }

    onDrop(source, target) {
        // Make the move with chess.js
        const move = this.game.move({
            from: source,
            to: target,
            promotion: 'q' // Always promote to a queen for simplicity
        });

        // If move is illegal, snap back
        if (move === null) return 'snapback';

        this.board1.position(this.game.fen()); // Update board position
        this.updateStatus(); // Update status display
    }

    onSnapEnd() {
        // Update board position after move
        this.board1.position(this.game.fen());
    }

    updateStatus() {
        let status = '';
        const moveColor = this.game.turn() === 'b' ? 'Black' : 'White';

        if (this.game.in_checkmate()) {
            status = `Game over, ${moveColor} is in checkmate.`;
        } else if (this.game.in_draw()) {
            status = 'Game over, drawn position';
        } else {
            status = `${moveColor} to move`;
            if (this.game.in_check()) {
                status += `, ${moveColor} is in check`;
            }
        }

        // Update status elements (if any)
        this.template.querySelector('#status').innerText = status;
        this.template.querySelector('#fen').innerText = this.game.fen();
        this.template.querySelector('#pgn').innerText = this.game.pgn();
    }
}
