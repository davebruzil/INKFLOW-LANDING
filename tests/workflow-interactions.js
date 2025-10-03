// Enhanced Workflow Interactions
class WorkflowManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.init();
    }

    init() {
        this.setupTimelineInteractions();
        this.setupStepInteractions();
        this.setupScrollAnimations();
    }

    // Timeline Click Interactions
    setupTimelineInteractions() {
        const timelineSteps = document.querySelectorAll('.timeline-step');
        
        timelineSteps.forEach((step, index) => {
            step.addEventListener('click', () => {
                this.navigateToStep(index + 1);
            });
        });
    }

    // Navigate to specific step
    navigateToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > this.totalSteps) return;
        
        this.currentStep = stepNumber;
        this.updateTimeline();
        this.scrollToStep(stepNumber);
    }

    // Update timeline progress and active state
    updateTimeline() {
        const timelineSteps = document.querySelectorAll('.timeline-step');
        const progressBar = document.querySelector('.timeline-progress');
        
        // Update step states
        timelineSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Update progress bar (RTL - right to left)
        const progressWidth = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        if (progressBar) {
            progressBar.style.setProperty('--progress-width', `${progressWidth}%`);
        }
    }

    // Smooth scroll to specific step
    scrollToStep(stepNumber) {
        const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
        if (targetStep) {
            targetStep.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // Step Interaction Setup
    setupStepInteractions() {
        const workflowSteps = document.querySelectorAll('.workflow-step');
        
        workflowSteps.forEach((step) => {
            // Click to expand/collapse step details
            step.addEventListener('click', (e) => {
                // Don't trigger if clicking on learn-more button
                if (e.target.classList.contains('learn-more-btn')) return;
                
                this.toggleStepDetails(step);
            });
            
            // Learn more button interactions
            const learnMoreBtn = step.querySelector('.learn-more-btn');
            if (learnMoreBtn) {
                learnMoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleLearnMore(step);
                });
            }
        });
    }

    // Toggle step details visibility
    toggleStepDetails(step) {
        const isExpanded = step.classList.contains('expanded');
        
        // Close all other steps first
        document.querySelectorAll('.workflow-step.expanded').forEach(otherStep => {
            if (otherStep !== step) {
                otherStep.classList.remove('expanded');
            }
        });
        
        // Toggle current step
        step.classList.toggle('expanded', !isExpanded);
        
        // Update timeline to reflect current step
        const stepNumber = parseInt(step.dataset.step);
        if (stepNumber) {
            this.currentStep = stepNumber;
            this.updateTimeline();
        }
    }

    // Handle learn more button clicks
    handleLearnMore(step) {
        const stepNumber = parseInt(step.dataset.step);
        const stepTitles = {
            1: 'WhatsApp אוטומציה',
            2: 'CRM מתקדם', 
            3: 'ניהול תמונות',
            4: 'לוח בקרה'
        };
        
        // Simple alert for demo - replace with modal or detailed view
        alert(`${stepTitles[stepNumber]}: פה תהיה הסבר מפורט על התכונה`);
    }

    // Scroll-triggered animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const step = entry.target;
                    const stepNumber = parseInt(step.dataset.step);
                    
                    if (stepNumber && stepNumber !== this.currentStep) {
                        this.currentStep = stepNumber;
                        this.updateTimeline();
                    }
                    
                    // Add visible class for additional animations
                    step.classList.add('in-view');
                }
            });
        }, observerOptions);

        // Observe all workflow steps
        document.querySelectorAll('.workflow-step[data-step]').forEach(step => {
            observer.observe(step);
        });
    }

    // Public method to go to next step
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.navigateToStep(this.currentStep + 1);
        }
    }

    // Public method to go to previous step
    prevStep() {
        if (this.currentStep > 1) {
            this.navigateToStep(this.currentStep - 1);
        }
    }
}

// Initialize workflow manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const workflowManager = new WorkflowManager();
    
    // Optional: Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            workflowManager.nextStep();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            workflowManager.prevStep();
        }
    });
    
    // Make workflowManager globally accessible for debugging
    window.workflowManager = workflowManager;
});

// Add some additional CSS animations via JavaScript
const additionalStyles = `
    .workflow-step.in-view {
        animation: highlightStep 0.6s ease-out;
    }
    
    .timeline-step:hover .timeline-dot {
        transform: scale(1.1);
        box-shadow: 0 3px 12px rgba(232, 196, 196, 0.5);
    }
    
    .workflow-step:hover .step-number {
        transform: scale(1.1) rotate(5deg);
    }
    
    @keyframes highlightStep {
        0% { background-color: transparent; }
        50% { background-color: rgba(232, 196, 196, 0.1); }
        100% { background-color: transparent; }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);