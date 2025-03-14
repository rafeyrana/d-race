// Commands modal component for displaying keyboard shortcuts

export default class CommandsModal {
    constructor() {
        this.isVisible = false;
        this.createElements();
        this.setupEventListeners();
    }

    createElements() {
        // Create the button
        this.button = document.createElement('button');
        this.button.id = 'commands-button';
        this.button.textContent = 'Commands (K)';
        this.button.classList.add('commands-button');
        
        // Create the modal backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.classList.add('modal-backdrop');
        
        // Create the modal container
        this.modal = document.createElement('div');
        this.modal.classList.add('commands-modal');
        
        // Create modal content
        this.modalContent = document.createElement('div');
        this.modalContent.classList.add('modal-content');
        
        // Add heading
        const heading = document.createElement('h2');
        heading.textContent = 'Keyboard Shortcuts';
        this.modalContent.appendChild(heading);
        
        // Create commands list
        const commandsList = document.createElement('div');
        commandsList.classList.add('commands-list');
        
        // Define all shortcuts
        const shortcuts = [
            { key: 'W', description: 'Accelerate forward' },
            { key: 'S', description: 'Brake/Reverse' },
            { key: 'A', description: 'Turn left' },
            { key: 'D', description: 'Turn right' },
            { key: 'C', description: 'Toggle camera mode (follow/orbit)' },
            { key: 'K', description: 'Toggle commands menu' }
        ];
        
        // Add each shortcut to the list
        shortcuts.forEach(shortcut => {
            const item = document.createElement('div');
            item.classList.add('command-item');
            
            const keySpan = document.createElement('span');
            keySpan.classList.add('key');
            keySpan.textContent = shortcut.key;
            
            const descSpan = document.createElement('span');
            descSpan.classList.add('description');
            descSpan.textContent = shortcut.description;
            
            item.appendChild(keySpan);
            item.appendChild(descSpan);
            commandsList.appendChild(item);
        });
        
        this.modalContent.appendChild(commandsList);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close (K)';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', () => this.hideModal());
        
        this.modalContent.appendChild(closeButton);
        
        // Assemble modal
        this.modal.appendChild(this.modalContent);
        
        // Add elements to the DOM
        document.body.appendChild(this.button);
        document.body.appendChild(this.backdrop);
        document.body.appendChild(this.modal);
        
        // Initially hide the modal and backdrop
        this.hideModal();
    }
    
    setupEventListeners() {
        // Toggle modal when the button is clicked
        this.button.addEventListener('click', () => {
            this.toggleModal();
        });
        
        // Close modal when clicking on backdrop
        this.backdrop.addEventListener('click', () => {
            this.hideModal();
        });
        
        // Listen for 'K' key press
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'k') {
                this.toggleModal();
                e.preventDefault(); // Prevent 'k' from being typed in any input
            } else if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }
    
    toggleModal() {
        if (this.isVisible) {
            this.hideModal();
        } else {
            this.showModal();
        }
    }
    
    showModal() {
        this.backdrop.style.display = 'block';
        this.modal.style.display = 'flex';
        this.isVisible = true;
        
        // Add a small delay before adding the visible class to trigger transition
        setTimeout(() => {
            this.backdrop.classList.add('visible');
            this.modal.classList.add('visible');
        }, 10);
    }
    
    hideModal() {
        this.backdrop.classList.remove('visible');
        this.modal.classList.remove('visible');
        this.isVisible = false;
        
        // Add a delay to wait for transition to complete before hiding
        setTimeout(() => {
            this.backdrop.style.display = 'none';
            this.modal.style.display = 'none';
        }, 300); // Match this with CSS transition time
    }
} 