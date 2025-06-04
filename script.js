// Battery drawing function
function drawBattery(ctx, level) {
    const x = 130;  // Position from right
    const y = 5;    // Position from top
    const width = 20;
    const height = 10;
    
    // Battery outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Battery tip
    ctx.fillRect(x + width, y + 2, 2, height - 4);
    
    // Battery level
    const fillWidth = (width - 2) * (level / 100);
    ctx.fillStyle = level > 20 ? '#fff' : '#ff0000';
    ctx.fillRect(x + 1, y + 1, fillWidth, height - 2);
}

// Power button drawing function
function drawPowerButton(ctx, isHighlighted = false) {
    const x = 140;  // Position from right
    const y = 40;   // Center vertically
    const width = 5;
    const height = 20;
    
    // Draw button background
    ctx.fillStyle = isHighlighted ? '#ff0000' : '#000000';
    ctx.fillRect(x, y - height/2, width, height);
    
    // Draw button border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - height/2, width, height);
}

// Power button animation function
function drawPowerButtonAnimation(ctx, frame, isPressed = false, isHighlighted = false) {
    const x = 140;  // Position from right
    const y = 40;   // Center vertically
    const arrowLength = 15;
    const arrowWidth = 2;
    const baseLineHeight = 20;  // Base height when not pressed
    
    // Calculate breathing effect for the line opacity only
    const lineOpacity = Math.abs(Math.sin(frame * 0.02)) * 0.5 + 0.3;
    
    // Calculate bouncing effect for the arrow - much slower
    const bounceOffset = Math.abs(Math.sin(frame * 0.05)) * 10; // Reduced speed
    const arrowOpacity = 0.8;
    
    // Calculate line height - grow when pressed
    const lineHeight = isPressed ? baseLineHeight * 1.5 : baseLineHeight;
    
    // Draw vertical line (power button) with dynamic height
    ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
    ctx.lineWidth = arrowWidth;
    ctx.beginPath();
    ctx.moveTo(x + 5, y - lineHeight/2);
    ctx.lineTo(x + 5, y + lineHeight/2);
    ctx.stroke();
    
    // Draw bouncing arrow
    ctx.strokeStyle = `rgba(255, 255, 255, ${arrowOpacity})`;
    ctx.beginPath();
    // Start position of arrow (further left)
    const startX = x - arrowLength - 20;
    // Current position with bounce
    const currentX = startX + bounceOffset;
    
    ctx.moveTo(currentX, y);
    ctx.lineTo(currentX + arrowLength, y);
    ctx.lineTo(currentX + arrowLength - 5, y - 5);
    ctx.moveTo(currentX + arrowLength, y);
    ctx.lineTo(currentX + arrowLength - 5, y + 5);
    ctx.stroke();
    
    // Draw physical power button
    drawPowerButton(ctx, isHighlighted);
}

// Shutdown countdown animation
function drawShutdownCountdown(ctx, remainingTime) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 160, 80);
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    
    // Draw countdown text with whole seconds
    ctx.fillText('Shutting down', 80, 30);
    ctx.fillText(Math.ceil(remainingTime), 80, 50);
}

// Flow definitions
const flows = {
    welcome: [
        {
            title: "Welcome Screen",
            explanation: "This is the initial welcome screen of the device.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Welcome!', 80, 40);
                drawBattery(ctx, 85);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Menu Screen",
            explanation: "The main menu showing available options.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('> Settings', 80, 30);
                ctx.fillText('  Status', 80, 50);
                ctx.fillText('  Connect', 80, 70);
                drawBattery(ctx, 85);
            },
            led: { state: 'on', color: 'white' }
        },
        {
            title: "Status Screen",
            explanation: "Displaying current device status.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Status:', 80, 30);
                ctx.fillText('Battery: 85%', 80, 50);
                ctx.fillText('Signal: Good', 80, 70);
                drawBattery(ctx, 85);
            },
            led: { state: 'on', color: 'green' }
        }
    ],
    connection: [
        {
            title: "Standby",
            explanation: "Device is in standby mode, ready to connect.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Standby', 80, 30);
                ctx.fillText('Ready to pair', 80, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Pairing Mode",
            explanation: "Device is in pairing mode, waiting for app.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Pairing Mode', 80, 30);
                ctx.fillText('Active', 80, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'blink', color: 'yellow' }
        },
        {
            title: "Scanning",
            explanation: "Device is scanning for nearby companion apps.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Scanning', 80, 30);
                ctx.fillText('for app...', 80, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'blink', color: 'yellow' },
            onEnter: () => {
                // Clear the canvas first
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Load and play the scanning animation
                const animation = lottie.loadAnimation({
                    container: canvas,
                    renderer: 'canvas',
                    loop: true,
                    autoplay: true,
                    path: 'scanning-animation.json',
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid slice',
                        progressiveLoad: true
                    }
                });

                // Ensure the animation is visible
                animation.addEventListener('DOMLoaded', () => {
                    animation.play();
                });

                return animation;
            },
            onExit: (animation) => {
                if (animation) {
                    animation.destroy();
                }
            }
        },
        {
            title: "App Found",
            explanation: "Companion app detected. Waiting for user confirmation.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('App Found!', 80, 30);
                ctx.fillText('Confirm in app', 80, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'blink', color: 'green' }
        },
        {
            title: "Connecting",
            explanation: "Establishing secure connection with the companion app.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Connecting', 80, 30);
                ctx.fillText('to app...', 80, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'blink', color: 'yellow' }
        },
        {
            title: "Connected",
            explanation: "Successfully connected to the companion app.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Connected!', 80, 30);
                ctx.fillText('App ready', 80, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Error",
            explanation: "Connection failed. Please try again.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Error', 80, 30);
                ctx.fillText('Try again', 80, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'blink', color: 'red' }
        }
    ],
    error: [
        {
            title: "Connection Error",
            explanation: "Failed to establish connection with the app.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Error: Connection', 80, 30);
                ctx.fillText('Failed', 80, 50);
                ctx.fillText('Try again', 80, 70);
                drawBattery(ctx, 85);
            },
            led: { state: 'blink', color: 'red' }
        },
        {
            title: "Low Battery",
            explanation: "Device battery is critically low.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Error: Low Battery', 80, 30);
                ctx.fillText('Please charge', 80, 50);
                ctx.fillText('device', 80, 70);
                drawBattery(ctx, 15);
            },
            led: { state: 'blink', color: 'red' }
        },
        {
            title: "App Not Found",
            explanation: "No compatible app detected nearby.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Error: No App', 80, 30);
                ctx.fillText('Found', 80, 50);
                ctx.fillText('Check app status', 80, 70);
                drawBattery(ctx, 85);
            },
            led: { state: 'blink', color: 'red' }
        },
        {
            title: "Pairing Failed",
            explanation: "Failed to pair with the app.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Error: Pairing', 80, 30);
                ctx.fillText('Failed', 80, 50);
                ctx.fillText('Restart device', 80, 70);
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame, isShuttingDown, true);
            },
            led: { state: 'blink', color: 'red' },
            onEnter: () => {
                let frame = 0;
                let isShuttingDown = false;
                let shutdownStartTime = 0;
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Pairing Failed") {
                        if (isShuttingDown) {
                            const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
                            const remainingTime = Math.max(0, 2 - elapsedTime);
                            
                            if (remainingTime > 0) {
                                drawShutdownCountdown(ctx, remainingTime);
                                requestAnimationFrame(animate);
                            } else {
                                // Reset to initial state after shutdown
                                isShuttingDown = false;
                                currentState.draw(ctx, frame++);
                                requestAnimationFrame(animate);
                            }
                        } else {
                            currentState.draw(ctx, frame++);
                            requestAnimationFrame(animate);
                        }
                    }
                };
                
                // Add power button press handler
                const handlePowerPress = (e) => {
                    if (e.type === 'mousedown' || e.type === 'touchstart') {
                        isShuttingDown = true;
                        shutdownStartTime = Date.now();
                    }
                };
                
                canvas.addEventListener('mousedown', handlePowerPress);
                canvas.addEventListener('touchstart', handlePowerPress);
                
                animate();
                
                return () => {
                    canvas.removeEventListener('mousedown', handlePowerPress);
                    canvas.removeEventListener('touchstart', handlePowerPress);
                };
            }
        },
        {
            title: "System Error",
            explanation: "Internal system error occurred.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('System Error', 80, 30);
                ctx.fillText('Code: E001', 80, 50);
                ctx.fillText('Restart device', 80, 70);
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame, isShuttingDown, true);
            },
            led: { state: 'blink', color: 'red' },
            onEnter: () => {
                let frame = 0;
                let isShuttingDown = false;
                let shutdownStartTime = 0;
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "System Error") {
                        if (isShuttingDown) {
                            const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
                            const remainingTime = Math.max(0, 2 - elapsedTime);
                            
                            if (remainingTime > 0) {
                                drawShutdownCountdown(ctx, remainingTime);
                                requestAnimationFrame(animate);
                            } else {
                                // Reset to initial state after shutdown
                                isShuttingDown = false;
                                currentState.draw(ctx, frame++);
                                requestAnimationFrame(animate);
                            }
                        } else {
                            currentState.draw(ctx, frame++);
                            requestAnimationFrame(animate);
                        }
                    }
                };
                
                // Add power button press handler
                const handlePowerPress = (e) => {
                    if (e.type === 'mousedown' || e.type === 'touchstart') {
                        isShuttingDown = true;
                        shutdownStartTime = Date.now();
                    }
                };
                
                canvas.addEventListener('mousedown', handlePowerPress);
                canvas.addEventListener('touchstart', handlePowerPress);
                
                animate();
                
                return () => {
                    canvas.removeEventListener('mousedown', handlePowerPress);
                    canvas.removeEventListener('touchstart', handlePowerPress);
                };
            }
        }
    ],
    powerDown: [
        {
            title: "Power Button Press",
            explanation: "Press and hold the power button to initiate shutdown.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Press and hold', 80, 30);
                ctx.fillText('power button', 80, 50);
                ctx.fillText('to shutdown', 80, 70);
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame, isShuttingDown, true);
            },
            led: { state: 'on', color: 'white' },
            onEnter: () => {
                let frame = 0;
                let isShuttingDown = false;
                let shutdownStartTime = 0;
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Power Button Press") {
                        if (isShuttingDown) {
                            const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
                            const remainingTime = Math.max(0, 2 - elapsedTime);
                            
                            if (remainingTime > 0) {
                                drawShutdownCountdown(ctx, remainingTime);
                                requestAnimationFrame(animate);
                            } else {
                                // Move to next state after countdown
                                currentStateIndex = 1;
                                updateDisplay();
                            }
                        } else {
                            currentState.draw(ctx, frame++);
                            requestAnimationFrame(animate);
                        }
                    }
                };
                
                // Add power button press handler
                const handlePowerPress = (e) => {
                    if (e.type === 'mousedown' || e.type === 'touchstart') {
                        isShuttingDown = true;
                        shutdownStartTime = Date.now();
                    }
                };
                
                canvas.addEventListener('mousedown', handlePowerPress);
                canvas.addEventListener('touchstart', handlePowerPress);
                
                animate();
                
                return () => {
                    canvas.removeEventListener('mousedown', handlePowerPress);
                    canvas.removeEventListener('touchstart', handlePowerPress);
                };
            }
        },
        {
            title: "Shutdown Complete",
            explanation: "Device has been powered off.",
            draw: (ctx, frame) => {
                // Calculate fade out opacity
                const fadeDuration = 30; // frames for fade out
                const opacity = Math.max(0, 1 - (frame / fadeDuration));
                
                // Clear canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw text with fading opacity
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Device', 80, 30);
                ctx.fillText('Powered Off', 80, 50);
            },
            led: { state: 'off', color: 'none' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Shutdown Complete") {
                        currentState.draw(ctx, frame++);
                        if (frame < 30) { // Continue animation until fade is complete
                            requestAnimationFrame(animate);
                        }
                    }
                };
                animate();
            }
        }
    ]
};

// Initialize canvas
const canvas = document.getElementById('lcdCanvas');
const ctx = canvas.getContext('2d');
let currentStateIndex = 0;
let currentFlow = 'welcome';
let currentAnimation = null;

// Navigation elements
const prevButton = document.getElementById('prevStep');
const nextButton = document.getElementById('nextStep');
const explanationText = document.getElementById('stepExplanation');
const currentStepSpan = document.getElementById('currentStep');
const totalStepsSpan = document.getElementById('totalSteps');
const flowSelect = document.getElementById('flowSelect');
const ledLight = document.getElementById('ledLight');

// Function to update the display
function updateDisplay() {
    const currentStates = flows[currentFlow];
    const currentState = currentStates[currentStateIndex];
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Handle animation cleanup
    if (currentAnimation && currentState.onExit) {
        currentState.onExit(currentAnimation);
        currentAnimation = null;
    }
    
    // Handle animation setup
    if (currentState.onEnter) {
        currentAnimation = currentState.onEnter();
    } else {
        // Draw current state if no animation
        currentState.draw(ctx);
    }
    
    // Update LED state
    ledLight.className = 'led-light';
    if (currentState.led) {
        ledLight.classList.add(currentState.led.state);
        ledLight.classList.add(currentState.led.color);
    }
    
    // Update explanation
    explanationText.textContent = currentState.explanation;
    
    // Update step indicator
    currentStepSpan.textContent = currentStateIndex + 1;
    totalStepsSpan.textContent = currentStates.length;
    
    // Update button states
    prevButton.disabled = currentStateIndex === 0;
    nextButton.disabled = currentStateIndex === currentStates.length - 1;
}

// Event listeners for navigation
prevButton.addEventListener('click', () => {
    if (currentStateIndex > 0) {
        currentStateIndex--;
        updateDisplay();
    }
});

nextButton.addEventListener('click', () => {
    if (currentStateIndex < flows[currentFlow].length - 1) {
        currentStateIndex++;
        updateDisplay();
    }
});

// Event listener for flow selection
flowSelect.addEventListener('change', (e) => {
    currentFlow = e.target.value;
    currentStateIndex = 0;
    updateDisplay();
});

// Initialize the display
updateDisplay(); 