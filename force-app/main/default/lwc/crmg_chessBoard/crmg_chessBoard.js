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
    @track currentPosition;
    @track nextTurnFrom;

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
            this.createTurnIndicator();
            this.createBoardElement();
            this.createControlButtons();
            // this.createTurnIndicator();
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
            // Create a wrapper for the board and buttons
            const wrapper = document.createElement('div');
            wrapper.style.textAlign = 'center'; // Center the content
    
            // Create the board element
            const boardElement = document.createElement('div');
            boardElement.id = 'board1';
            boardElement.style.width = '500px';
            boardElement.style.height = '500px';
            boardElement.style.margin = '20px auto';
    
            // Append board element to the wrapper
            wrapper.appendChild(boardElement);
            boardContainer.appendChild(wrapper);
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
            // Create a container for the buttons
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.textAlign = 'center'; // Center the buttons
            buttonsContainer.style.marginTop = '20px'; // Add space between the buttons and the board
    
            // Button base styles
            const buttonStyle = `
                padding: 10px 20px;
                font-size: 14px;
                font-weight: bold;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin: 5px;
                transition: background-color 0.3s, color 0.3s, transform 0.2s;
                color: #333; /* Text color */
                outline: none;
            `;
    
            // Common button styles for reset and flip buttons
            const commonButtonStyle = `
                ${buttonStyle}
                background-color: #f0f0f0; /* Light grey background */
            `;
    
            // Reset Button
            const resetBtn = document.createElement('button');
            resetBtn.id = 'resetBtn';
            resetBtn.innerText = 'Reset';
            resetBtn.style.cssText = commonButtonStyle;
            resetBtn.addEventListener('click', () => {
                if (this.board1) {
                    this.board1.start();
                    this.game.reset();
                    this.updateTurnIndicator();
                }
            });
    
            // Add hover effect and animation for Reset Button
            resetBtn.addEventListener('mouseover', () => {
                resetBtn.style.backgroundColor = '#e0e0e0'; // Slightly darker grey
                resetBtn.style.transform = 'scale(1.05)'; // Slightly larger
            });
            resetBtn.addEventListener('mouseout', () => {
                resetBtn.style.backgroundColor = '#f0f0f0'; // Return to original color
                resetBtn.style.transform = 'scale(1)'; // Return to original size
            });
    
            // Add click effect for Reset Button
            resetBtn.addEventListener('mousedown', () => {
                resetBtn.style.transform = 'scale(0.95)'; // Slightly smaller on click
            });
            resetBtn.addEventListener('mouseup', () => {
                resetBtn.style.transform = 'scale(1)'; // Return to original size
            });
    
            buttonsContainer.appendChild(resetBtn);
    
            // Flip Board Button
            const flipBtn = document.createElement('button');
            flipBtn.id = 'flipBtn';
            flipBtn.innerText = 'Flip Board';
            flipBtn.style.cssText = commonButtonStyle;
            flipBtn.addEventListener('click', () => {
                if (this.board1) {
                    this.board1.flip();
                }
            });
    
            // Add hover effect and animation for Flip Button
            flipBtn.addEventListener('mouseover', () => {
                flipBtn.style.backgroundColor = '#e0e0e0'; // Slightly darker grey
                flipBtn.style.transform = 'scale(1.05)'; // Slightly larger
            });
            flipBtn.addEventListener('mouseout', () => {
                flipBtn.style.backgroundColor = '#f0f0f0'; // Return to original color
                flipBtn.style.transform = 'scale(1)'; // Return to original size
            });
    
            // Add click effect for Flip Button
            flipBtn.addEventListener('mousedown', () => {
                flipBtn.style.transform = 'scale(0.95)'; // Slightly smaller on click
            });
            flipBtn.addEventListener('mouseup', () => {
                flipBtn.style.transform = 'scale(1)'; // Return to original size
            });
    
            buttonsContainer.appendChild(flipBtn);

            // AI Toggle Button
            const aiToggleBtn = document.createElement('button');
            aiToggleBtn.id = 'aiToggleBtn';
            aiToggleBtn.innerText = 'Toggle AI';
            aiToggleBtn.style.cssText = commonButtonStyle;
            aiToggleBtn.addEventListener('click', () => {
                this.isAiEnabled = !this.isAiEnabled;
                aiToggleBtn.innerText = this.isAiEnabled ? 'Artificial Intelligence On' : 'Artificial Intelligence Off';
            });

            // Add hover effect and animation for AI Toggle 
            aiToggleBtn.addEventListener('mouseover', () => {
                aiToggleBtn.style.backgroundColor = '#e0e0e0'; // Slightly darker grey
                aiToggleBtn.style.transform = 'scale(1.05)'; // Slightly larger
            });
            aiToggleBtn.addEventListener('mouseout', () => {
                aiToggleBtn.style.backgroundColor = '#f0f0f0'; // Return to original color
                aiToggleBtn.style.transform = 'scale(1)'; // Return to original size
            });
    
            // Add click effect for Flip Button
            aiToggleBtn.addEventListener('mousedown', () => {
                aiToggleBtn.style.transform = 'scale(0.95)'; // Slightly smaller on click
            });
            aiToggleBtn.addEventListener('mouseup', () => {
                aiToggleBtn.style.transform = 'scale(1)'; // Return to original size
            });

            buttonsContainer.appendChild(aiToggleBtn);

            // Save Game Button
            const saveGameBtn = document.createElement('button');
            saveGameBtn.id = 'saveGameBtn';
            saveGameBtn.innerText = 'Save Game';
            saveGameBtn.style.cssText = commonButtonStyle;
            saveGameBtn.addEventListener('click', () => {
                console.log('placeholder');
            });

            // Add hover effect and animation for AI Toggle 
            saveGameBtn.addEventListener('mouseover', () => {
                saveGameBtn.style.backgroundColor = '#e0e0e0'; // Slightly darker grey
                saveGameBtn.style.transform = 'scale(1.05)'; // Slightly larger
            });
            saveGameBtn.addEventListener('mouseout', () => {
                saveGameBtn.style.backgroundColor = '#f0f0f0'; // Return to original color
                saveGameBtn.style.transform = 'scale(1)'; // Return to original size
            });
    
            // Add click effect for Flip Button
            saveGameBtn.addEventListener('mousedown', () => {
                saveGameBtn.style.transform = 'scale(0.95)'; // Slightly smaller on click
            });
            saveGameBtn.addEventListener('mouseup', () => {
                saveGameBtn.style.transform = 'scale(1)'; // Return to original size
            });

            buttonsContainer.appendChild(saveGameBtn);
    
            // Append buttons container to the board container
            boardContainer.appendChild(buttonsContainer);
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
            // Create a container for the turn indicator and timers
            const indicatorContainer = document.createElement('div');
            indicatorContainer.style.textAlign = 'center';
            indicatorContainer.style.marginBottom = '15px';
    
            // Create the turn indicator
            const turnIndicator = document.createElement('div');
            turnIndicator.id = 'turnIndicator';
            turnIndicator.style.fontSize = '22px';
            turnIndicator.style.fontWeight = 'bold';
            turnIndicator.innerText = "White's turn";
    
            // // Create timer elements
            // const timerWhite = document.createElement('div');
            // timerWhite.id = 'timerWhite';
            // timerWhite.style.fontSize = '18px';
            // timerWhite.style.marginTop = '10px';
            // timerWhite.innerText = "White Time: 00:00";
    
            // const timerBlack = document.createElement('div');
            // timerBlack.id = 'timerBlack';
            // timerBlack.style.fontSize = '18px';
            // timerBlack.style.marginTop = '10px';
            // timerBlack.innerText = "Black Time: 00:00";
    
            indicatorContainer.appendChild(turnIndicator);
            // indicatorContainer.appendChild(timerWhite);
            // indicatorContainer.appendChild(timerBlack);
    
            // Insert indicator container above the board and buttons wrapper
            boardContainer.insertBefore(indicatorContainer, boardContainer.firstChild);
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
                onMoveEnd: this.onMoveEnd.bind(this)
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

    onMoveEnd(oldPos, newPos) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        this.currentPosition = Chessboard.objToFen(newPos);
        this.nextTurnFrom = this.game.turn() === 'b' ? 'Black to turn next' : 'White to turn next';
        console.log('Next Turn From: ', this.nextTurnFrom)
        console.log('Current position is: ', this.currentPosition);
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        // NOW I NEED TO CONSTRUCT THE POSITION I WILL FEED STOCKFISH, because FEN is incomplete. I currently have only the position, not whose turn it is.
    }
    

    /**
     * Updates the turn indicator element to reflect the current turn.
     */
    updateTurnIndicator() {
        const turnIndicator = this.template.querySelector('#turnIndicator');
        if (turnIndicator) {
            const moveColor = this.game.turn() === 'b' ? 'Black' : 'White';
            turnIndicator.innerText = `${moveColor}'s turn`;
            this.nextTurnFrom = turnIndicator.innerText;
        } else {
            console.error('Turn indicator element not found');
        }
    }


}
