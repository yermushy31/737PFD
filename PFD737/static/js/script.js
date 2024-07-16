const horizonImage = document.getElementById('horizonImage');

function getData() {
    const serverAddress = 'ws://127.0.0.1:8080';
    
    // Create a WebSocket instance
    const ws = new WebSocket(serverAddress);
    
    // WebSocket event listeners
    ws.onopen = function() {
        console.log('Connected to WebSocket server');
    };
    
    ws.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('Data received:', data);
            moveHorizon(data.Pitch, data.Roll);
           
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };
    
    ws.onclose = function() {
        console.log('Disconnected from WebSocket server');

        // Reconnect to the WebSocket server
        setTimeout(() => {
            getData();
        }, 3000);
    };
    
    ws.onerror = function(error) {
        console.error('WebSocket error:', error.message);
    };
}

function moveHorizon(pitch, roll) {
    // Apply the transformations for pitch and roll
    horizonImage.style.transform = `translate(-50%, calc(-50% + ${pitch}px)) rotate(${-roll}deg)`;
}


 class horizontalIndicator {
                #canvas;
                #context;
                #backgroundColor;
                #textColor;
                #font;
        
                constructor(target, backgroundColor, textColor, font) {
                    this.#canvas = target;
                    this.#context = target.getContext("2d");
                    this.#backgroundColor = backgroundColor;
                    this.#textColor = textColor;
                    this.#font = font;
                }
        
                render(speed, range) {
                    this.#context.fillStyle = this.#backgroundColor;
                    this.#context.fillRect(0, 0, this.#canvas.width*0.7, this.#canvas.height);
                   
                    this.#context.strokeStyle = this.#textColor;
                    this.#context.lineWidth = 1;
                    this.#context.strokeRect(0, 0, this.#canvas.width * 0.7, this.#canvas.height * 0);
                    this.#context.strokeRect(0, this.#canvas.height, this.#canvas.width * 0.7, this.#canvas.height * 0);
         
                    this.#context.beginPath();
                    this.#context.moveTo(this.#canvas.width*0.7, 0);
                    this.#context.lineTo(this.#canvas.width, this.#canvas.height / 2);
                    this.#context.lineTo(this.#canvas.width*0.7, this.#canvas.height);
                    this.#context.fill();
        
                    this.#context.fillStyle = this.#textColor;
                    this.#context.font = this.#font;
        
                    const spacing = this.#canvas.height / (2 * range);
                    const centerY = this.#canvas.height / 2;
    
                    this.#context.strokeStyle = this.#textColor;
                    this.#context.lineWidth = 1;
                    this.#context.stroke();

                   speed = speed.toFixed(0);
                    this.#context.fillText(speed, this.#canvas.width * 0.2, centerY + 6);
            
        
                   
                }
            }
        
            const mainIndicator = new horizontalIndicator(
                document.getElementById("speedMarker"),
                "rgb(000,000,000)",
                "rgb(255,255,255)",
                "22px Arial"
            );
        
           