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

// Power button animation function
function drawPowerButtonAnimation(ctx, frame) {
    const x = 140;  // Position from right
    const y = 40;   // Center vertically
    const arrowLength = 15;
    const arrowWidth = 2;
    const lineHeight = 20;  // Fixed height
    
    // Calculate breathing effect for the line opacity only
    const lineOpacity = Math.abs(Math.sin(frame * 0.02)) * 0.5 + 0.3;
    
    // Calculate bouncing effect for the arrow - much slower
    const bounceOffset = Math.abs(Math.sin(frame * 0.05)) * 10; // Reduced speed
    const arrowOpacity = 0.8;
    
    // Draw vertical line (power button) with fixed height
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
                ctx.fillText('Welcome!', 10, 40);
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
                ctx.fillText('> Settings', 10, 30);
                ctx.fillText('  Status', 10, 50);
                ctx.fillText('  Connect', 10, 70);
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
                ctx.fillText('Status:', 10, 30);
                ctx.fillText('Battery: 85%', 10, 50);
                ctx.fillText('Signal: Good', 10, 70);
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
                ctx.fillText('Standby', 10, 30);
                ctx.fillText('Ready to pair', 10, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'on', color: 'blue' }
        },
        {
            title: "Pairing Mode",
            explanation: "Device is in pairing mode, waiting for app.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.fillText('Pairing Mode', 10, 30);
                ctx.fillText('Active', 10, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'breathing', color: 'blue' }
        },
        {
            title: "Scanning",
            explanation: "Device is scanning for nearby companion apps.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.fillText('Scanning', 10, 30);
                ctx.fillText('for app...', 10, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'breathing', color: 'blue' },
            onEnter: () => {
                // Clear the canvas first
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Create a container for the Lottie animation
                const lottieContainer = document.createElement('div');
                lottieContainer.style.position = 'absolute';
                lottieContainer.style.top = '50%';
                lottieContainer.style.left = '50%';
                lottieContainer.style.transform = 'translate(-50%, -50%)';
                lottieContainer.style.width = '80px';
                lottieContainer.style.height = '80px';
                lottieContainer.style.filter = 'brightness(0) invert(1)'; // This will make black elements white
                canvas.parentElement.appendChild(lottieContainer);
                
                // Load and play the wifi animation
                const animation = lottie.loadAnimation({
                    container: lottieContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: 'Lotties/wifi.json',
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid slice',
                        progressiveLoad: true
                    }
                });

                // Set the animation color to white
                animation.addEventListener('DOMLoaded', () => {
                    const svgElement = lottieContainer.querySelector('svg');
                    if (svgElement) {
                        svgElement.style.fill = '#fff';
                        svgElement.style.stroke = '#fff';
                        // Apply white color to all paths
                        const paths = svgElement.querySelectorAll('path');
                        paths.forEach(path => {
                            path.style.fill = '#fff';
                            path.style.stroke = '#fff';
                        });
                    }
                    animation.play();
                });

                return {
                    animation,
                    container: lottieContainer
                };
            },
            onExit: (data) => {
                if (data) {
                    if (data.animation) {
                        data.animation.destroy();
                    }
                    if (data.container) {
                        data.container.remove();
                    }
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
                ctx.fillText('App Found!', 10, 30);
                ctx.fillText('Confirm in app', 10, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'breathing', color: 'blue' }
        },
        {
            title: "Connecting",
            explanation: "Establishing secure connection with the companion app.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.fillText('Connecting', 10, 30);
                ctx.fillText('to app...', 10, 50);
                drawBattery(ctx, 85);
            },
            led: { state: 'breathing', color: 'blue' }
        },
        {
            title: "Connected",
            explanation: "Successfully connected to the companion app.",
            draw: (ctx) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.fillText('Connected!', 10, 30);
                ctx.fillText('App ready', 10, 50);
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
                ctx.fillText('Error', 10, 30);
                ctx.fillText('Try again', 10, 50);
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
                ctx.fillText('Error: Connection', 10, 30);
                ctx.fillText('Failed', 10, 50);
                ctx.fillText('Try again', 10, 70);
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
                ctx.fillText('Error: Low Battery', 10, 30);
                ctx.fillText('Please charge', 10, 50);
                ctx.fillText('device', 10, 70);
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
                ctx.fillText('Error: No App', 10, 30);
                ctx.fillText('Found', 10, 50);
                ctx.fillText('Check app status', 10, 70);
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
                ctx.textAlign = 'left';
                ctx.fillText('Error: Pairing', 10, 30);
                ctx.fillText('Failed', 10, 50);
                ctx.fillText('Restart device', 10, 70);
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame);
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
                ctx.textAlign = 'left';
                ctx.fillText('System Error', 10, 30);
                ctx.fillText('Code: E001', 10, 50);
                ctx.fillText('Restart device', 10, 70);
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame);
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
                ctx.textAlign = 'left';
                
                if (isShuttingDown) {
                    const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
                    const remainingTime = Math.max(0, 2 - elapsedTime);
                    
                    ctx.fillText('Shutting down', 10, 30);
                    ctx.fillText(Math.ceil(remainingTime), 10, 50);
                } else {
                    ctx.fillText('Press and hold', 10, 30);
                    ctx.fillText('power button', 10, 50);
                    ctx.fillText('to shutdown', 10, 70);
                }
                
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame);
            },
            led: { state: 'on', color: 'white' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Power Button Press") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
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
    ],
    powerOn: [
        {
            title: "Power On",
            explanation: "Device is powering on with logo fade in.",
            draw: (ctx, frame) => {
                // Calculate fade in opacity
                const fadeDuration = 240; // 4 seconds at 60fps
                const opacity = Math.min(1, frame / fadeDuration);
                
                // Clear canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw DS logo with fading opacity
                const img = new Image();
                img.src = 'DS LOGO.png';
                
                // Calculate dimensions to maintain aspect ratio
                const maxWidth = 120; // Leave some margin
                const scale = maxWidth / img.width;
                const width = img.width * scale;
                const height = img.height * scale;
                
                // Center the logo
                const x = (160 - width) / 2;
                const y = (80 - height) / 2;
                
                ctx.globalAlpha = opacity;
                ctx.drawImage(img, x, y, width, height);
                ctx.globalAlpha = 1;
            },
            led: { state: 'on', color: 'white' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Power On") {
                        currentState.draw(ctx, frame++);
                        if (frame < 240) { // Continue animation until fade is complete (4 seconds)
                            requestAnimationFrame(animate);
                        } else {
                            // After fade in completes, move to welcome screen
                            currentFlow = 'welcome';
                            currentStateIndex = 0;
                            updateDisplay();
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
    if (currentAnimation) {
        if (typeof currentAnimation === 'object' && currentAnimation.animation) {
            currentAnimation.animation.stop();
            currentAnimation.animation.destroy();
            if (currentAnimation.container && currentAnimation.container.parentNode) {
                currentAnimation.container.parentNode.removeChild(currentAnimation.container);
            }
        } else if (currentAnimation.destroy) {
            currentAnimation.destroy();
        }
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
        if (currentState.led.state === 'on') {
            ledLight.classList.add('on');
        }
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

// Add power button event listeners
const powerButton = document.getElementById('powerButton');
let powerPressTimeout = null;
let isShuttingDown = false;
let shutdownStartTime = 0;
let countdownInterval = null;
let isPoweredOff = true; // Track power state

function startShutdownCountdown() {
    if (isShuttingDown) return; // Prevent multiple triggers
    
    isShuttingDown = true;
    shutdownStartTime = Date.now();
    
    // Switch to power down flow
    currentFlow = 'powerDown';
    currentStateIndex = 0;
    updateDisplay();
    
    // Start countdown animation
    countdownInterval = setInterval(() => {
        const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
        const remainingTime = Math.max(0, 2 - elapsedTime);
        
        if (remainingTime <= 0) {
            // Complete shutdown
            clearInterval(countdownInterval);
            currentStateIndex = 1; // Move to shutdown complete state
            updateDisplay();
            isPoweredOff = true; // Set power state to off
        }
    }, 50); // Update every 50ms for smooth animation
}

function startPowerOn() {
    if (!isPoweredOff) return; // Only power on if currently off
    
    isPoweredOff = false;
    currentFlow = 'powerOn';
    currentStateIndex = 0;
    updateDisplay();
}

function cancelShutdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    isShuttingDown = false;
    
    // Return to previous flow
    currentFlow = 'welcome';
    currentStateIndex = 0;
    updateDisplay();
}

powerButton.addEventListener('mousedown', () => {
    if (isPoweredOff) {
        startPowerOn();
    } else {
        startShutdownCountdown();
    }
});

powerButton.addEventListener('mouseup', () => {
    if (isShuttingDown) {
        const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
        if (elapsedTime < 2) {
            // If not held for 2 seconds, cancel shutdown
            cancelShutdown();
        }
    }
});

powerButton.addEventListener('mouseleave', () => {
    if (isShuttingDown) {
        const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
        if (elapsedTime < 2) {
            // If not held for 2 seconds, cancel shutdown
            cancelShutdown();
        }
    }
});

// Add touch event handlers
powerButton.addEventListener('touchstart', () => {
    if (isPoweredOff) {
        startPowerOn();
    } else {
        startShutdownCountdown();
    }
});

powerButton.addEventListener('touchend', () => {
    if (isShuttingDown) {
        const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
        if (elapsedTime < 2) {
            // If not held for 2 seconds, cancel shutdown
            cancelShutdown();
        }
    }
});

powerButton.addEventListener('touchcancel', () => {
    if (isShuttingDown) {
        const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
        if (elapsedTime < 2) {
            // If not held for 2 seconds, cancel shutdown
            cancelShutdown();
        }
    }
});

// Initialize the display
updateDisplay(); 