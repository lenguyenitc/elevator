class ElevatorSystem {
    constructor() {
        this.SHOWLOGS = false; // Add the flag at class level
        this.toggleLogs(this.SHOWLOGS); // Initialize logs visibility
        this.elevators = Array.from(document.querySelectorAll('.elevator')).map(elevator => ({
            element: elevator,
            currentFloor: 0,  // Already set to 0 (Ground floor)
            isMoving: false,
            queue: []
        }));
        
        this.callQueue = [];
        this.floorHeight = 600 / 10; // Total height divided by number of floors
        this.totalFloors = 10; // Total number of floors
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.querySelectorAll('.call-button').forEach(button => {
            button.addEventListener('click', (e) => this.handleCallButton(e));
        });
    }

    handleCallButton(event) {
        const button = event.target;
        const floor = parseInt(button.dataset.floor);
        const waitTimeElement = button.closest('.floor-info').querySelector('.wait-time');
        
        if (button.classList.contains('waiting') || button.classList.contains('arrived')) {
            return;
        }
    
        button.classList.add('waiting');
        button.textContent = 'Waiting';
        
        // Calculate expected duration based on closest elevator
        const availableElevator = this.findClosestAvailableElevator(floor);
        let expectedDuration;
        
        if (availableElevator) {
            const floorsToTravel = Math.abs(availableElevator.currentFloor - floor);
            expectedDuration = floorsToTravel; // 1 second per floor
        } else {
            // If no elevator available, estimate longer wait
            expectedDuration = 10; // Default max wait time in seconds
        }
        
        // Start the countdown timer
        const startTime = Date.now();
        const updateTimer = () => {
            const elapsedTime = (Date.now() - startTime) / 1000;
            const remainingTime = Math.max(0, expectedDuration - elapsedTime).toFixed(1);
            waitTimeElement.textContent = `${remainingTime}s left`;
            
            if (remainingTime <= 0) {
                waitTimeElement.textContent = 'Arriving...';
            }
        };
        
        const timerId = setInterval(updateTimer, 100);
        updateTimer(); // Initial update
        
        this.log(`Floor ${floor === 0 ? 'G' : floor} called an elevator`);
        this.assignElevator(floor, timerId, waitTimeElement);
    }

    assignElevator(targetFloor, timerId, waitTimeElement) {
        const availableElevator = this.findClosestAvailableElevator(targetFloor);
        
        if (availableElevator) {
            this.moveElevator(availableElevator, targetFloor, timerId, waitTimeElement);
        } else {
            this.callQueue.push({
                floor: targetFloor,
                timerId: timerId,
                waitTimeElement: waitTimeElement
            });
            this.log(`All elevators busy. Added floor ${targetFloor === 0 ? 'G' : targetFloor} to queue`);
        }
    }

    findClosestAvailableElevator(targetFloor) {
        return this.elevators
            .filter(elevator => !elevator.isMoving && elevator.queue.length === 0)
            .reduce((closest, current) => {
                if (!closest) return current;
                const currentDistance = Math.abs(current.currentFloor - targetFloor);
                const closestDistance = Math.abs(closest.currentFloor - targetFloor);
                return currentDistance < closestDistance ? current : closest;
            }, null);
    }

    moveElevator(elevator, targetFloor, timerId, waitTimeElement) {
        elevator.isMoving = true;
        elevator.element.classList.add('moving');
        
        const startTime = Date.now();
        const startFloor = elevator.currentFloor;
        const totalFloors = Math.abs(targetFloor - startFloor);
        // Fix: Make movement duration match the actual time display
        const duration = totalFloors * 1000; // 1 second per floor
        
        this.log(`Elevator ${elevator.element.dataset.elevator} moving from floor ${startFloor === 0 ? 'G' : startFloor} to ${targetFloor === 0 ? 'G' : targetFloor}`);
        
        // Fixed position calculation
        const newPosition = targetFloor * this.floorHeight;
        elevator.element.style.transform = `translateY(-${newPosition}px)`;
        
        // Add transition duration dynamically based on floor distance
        elevator.element.style.transition = `transform ${duration/1000}s ease`;
        
        setTimeout(() => {
            elevator.isMoving = false;
            elevator.currentFloor = targetFloor;
            elevator.element.classList.remove('moving');
            elevator.element.classList.add('arrived');
            
            // Clear the timer
            clearInterval(timerId);
            waitTimeElement.textContent = 'Arrived!';
            
            const travelTime = ((Date.now() - startTime) / 1000).toFixed(1);
            this.log(`Elevator ${elevator.element.dataset.elevator} arrived at floor ${targetFloor === 0 ? 'G' : targetFloor} (Travel time: ${travelTime}s)`);
            
            this.playArrivalSound();
            this.updateButtonState(targetFloor, 'arrived');
            
            setTimeout(() => {
                elevator.element.classList.remove('arrived');
                this.updateButtonState(targetFloor, 'default');
                waitTimeElement.textContent = ''; // Clear the wait time display
                
                if (this.callQueue.length > 0) {
                    const nextCall = this.callQueue.shift();
                    this.assignElevator(nextCall.floor, nextCall.timerId, nextCall.waitTimeElement);
                }
            }, 2000);
        }, duration);
    }

    updateButtonState(floor, state) {
        const button = document.querySelector(`.call-button[data-floor="${floor}"]`);
        
        switch (state) {
            case 'waiting':
                button.classList.add('waiting');
                button.textContent = 'Waiting';
                break;
            case 'arrived':
                button.classList.remove('waiting');
                button.classList.add('arrived');
                button.textContent = 'Arrived';
                break;
            case 'default':
                button.classList.remove('waiting', 'arrived');
                button.textContent = 'Call';
                break;
        }
    }

    playArrivalSound() {
        // Create and play a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    toggleLogs(show) {
        const logsSection = document.querySelector('.logs');
        if (logsSection) {
            logsSection.style.display = show ? 'block' : 'none';
        }
    }

    log(message) {
        if (!this.SHOWLOGS) return;
        
        const logContainer = document.getElementById('log-container');
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        console.log(message);
    }

    // To toggle logs, you can use:
    // elevatorSystem.SHOWLOGS = !elevatorSystem.SHOWLOGS;
    // elevatorSystem.toggleLogs(elevatorSystem.SHOWLOGS);
}

// Initialize the elevator system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ElevatorSystem();
});