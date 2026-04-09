// NutriForge - Premium SaaS Diet Plan Generator
// Production-Ready Validation System with Analytics and Funnel Tracking

class NutriForge {
    constructor() {
        this.currentPlan = null;
        this.isPremium = false;
        this.countdownInterval = null;

        // Analytics and tracking
        this.funnel = {
            step1_landing: false,
            step2_form: false,
            step3_result: false,
            step4_unlock_click: false,
            step5_email_submit: false
        };

        this.analytics = {
            events: [],
            userId: this.generateUserId(),
            sessionId: this.generateSessionId()
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSavedPlans();
        this.loadUserStatus();
        this.startCountdown();
        this.initScrollEffects();
        this.trackUserBehavior();

        // Initialize analytics
        this.trackEvent('page_view', { page: 'landing' });
        this.updateFunnel('step1_landing');

        // Check for admin route
        this.checkAdminRoute();
    }

    bindEvents() {
        const form = document.getElementById('diet-form');
        const upgradeBtn = document.getElementById('upgrade-btn');
        const saveBtn = document.getElementById('save-btn');
        const exportBtn = document.getElementById('export-btn');
        const paymentBtn = document.getElementById('payment-btn');

        if (form) form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        if (upgradeBtn) upgradeBtn.addEventListener('click', () => this.showEmailModal());
        if (saveBtn) saveBtn.addEventListener('click', () => this.savePlan());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportPDF());
        if (paymentBtn) paymentBtn.addEventListener('click', () => this.handlePayment());

        // Modal events
        const closeModal = document.getElementById('close-modal');
        const emailModal = document.getElementById('email-modal');
        const emailForm = document.getElementById('email-form');

        if (closeModal) closeModal.addEventListener('click', () => this.hideEmailModal());
        if (emailModal) {
            emailModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    this.hideEmailModal();
                }
            });
        }
        if (emailForm) emailForm.addEventListener('submit', (e) => this.handleEmailSubmit(e));

        // Make scrollToForm globally available
        window.scrollToForm = this.scrollToForm.bind(this);

        // Enhanced form interactions
        this.addFormEnhancements();
    }

    addFormEnhancements() {
        // Real-time form validation
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Dynamic calorie recommendations
        const goalSelect = document.getElementById('goal');
        const caloriesInput = document.getElementById('calories');

        if (goalSelect) {
            goalSelect.addEventListener('change', () => {
                this.updateCalorieRecommendation(goalSelect.value, caloriesInput);
            });
        }
    }

    validateField(field) {
        if (!field) return true;
        const value = field.value.trim();
        const errorElement = field.parentNode.querySelector('.field-error') || this.createErrorElement(field);

        if (field.hasAttribute('required') && !value) {
            errorElement.textContent = 'This field is required';
            errorElement.style.display = 'block';
            field.style.borderColor = 'var(--error-color)';
            return false;
        }

        if (field.type === 'number') {
            const num = parseInt(value);
            const min = parseInt(field.min) || 0;
            const max = parseInt(field.max) || Infinity;

            if (num < min || num > max) {
                errorElement.textContent = `Please enter a value between ${min} and ${max}`;
                errorElement.style.display = 'block';
                field.style.borderColor = 'var(--error-color)';
                return false;
            }
        }

        errorElement.style.display = 'none';
        field.style.borderColor = 'var(--border-color)';
        return true;
    }

    createErrorElement(field) {
        const error = document.createElement('div');
        error.className = 'field-error';
        error.style.cssText = `
            color: var(--error-color);
            font-size: 0.85rem;
            margin-top: 4px;
            display: none;
        `;
        field.parentNode.appendChild(error);
        return error;
    }

    clearFieldError(field) {
        if (!field) return;
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
            field.style.borderColor = 'var(--border-color)';
        }
    }

    updateCalorieRecommendation(goal, caloriesInput) {
        if (!caloriesInput) return;
        const recommendations = {
            'weight-loss': { min: 1500, max: 2000, default: 1800 },
            'weight-gain': { min: 2500, max: 3500, default: 2800 },
            'maintenance': { min: 2000, max: 2500, default: 2200 },
            'muscle-building': { min: 2500, max: 3500, default: 3000 }
        };

        const rec = recommendations[goal];
        if (rec) {
            const small = caloriesInput.parentNode.querySelector('small');
            if (small) {
                small.textContent = `Recommended: ${rec.min}-${rec.max} calories for ${this.capitalize(goal)}`;
            }
            if (!caloriesInput.value) {
                caloriesInput.value = rec.default;
            }
        }
    }

    startCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;

        // Set countdown to 24 hours from now
        const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);

        this.countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(this.countdownInterval);
                countdownElement.textContent = 'EXPIRED';
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    scrollToForm() {
        const formSection = document.getElementById('input-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    initScrollEffects() {
        // Add scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all major sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }

    trackUserBehavior() {
        // Additional event listeners for analytics (main events tracked in methods)

        // Track pricing clicks
        document.querySelectorAll('.pricing-button.primary').forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackEvent('pricing_clicked', { plan: 'premium' });
            });
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const inputs = document.querySelectorAll('#diet-form input, #diet-form select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showMessage('error', 'Please fill in all required fields correctly.');
            return;
        }

        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData);

        // Track form submission
        this.trackEvent('form_submit', {
            goal: userData.goal,
            calories: userData.calories,
            lifestyle: userData.lifestyle,
            dietType: userData.dietType
        });
        this.updateFunnel('step2_form');

        this.showLoadingSection();
        this.simulateAIGeneration(userData);
    }

    showLoadingSection() {
        const inputSection = document.getElementById('input-section');
        const resultSection = document.getElementById('result-section');
        const paymentSection = document.getElementById('payment-section');
        const loadingSection = document.getElementById('loading-section');

        if (inputSection) inputSection.classList.add('hidden');
        if (resultSection) resultSection.classList.add('hidden');
        if (paymentSection) paymentSection.classList.add('hidden');
        if (loadingSection) loadingSection.classList.remove('hidden');

        // Scroll to loading section
        if (loadingSection) loadingSection.scrollIntoView({ behavior: 'smooth' });
    }

    simulateAIGeneration(userData) {
        const steps = [
            'Scanning your profile for metabolic patterns',
            'Designing your food strategy',
            'Personalizing meal timing and macros',
            'Finalizing your premium nutrition roadmap'
        ];

        let currentStep = 0;
        const progressFill = document.getElementById('progress-fill');
        const loadingText = document.querySelector('.loading-text');
        const progressPercent = document.getElementById('progress-percentage');

        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                if (loadingText) loadingText.textContent = steps[currentStep];
                const percent = Math.round(((currentStep + 1) / steps.length) * 100);
                if (progressFill) progressFill.style.width = `${percent}%`;
                if (progressPercent) progressPercent.textContent = `${percent}%`;
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    this.generatePlan(userData);
                }, 500);
            }
        }, 800);
    }

    generatePlan(userData) {
        const plan = this.createEnhancedPlan(userData);
        this.currentPlan = plan;
        this.displayPlan(plan);
    }

    createEnhancedPlan(userData) {
        const { goal, calories, lifestyle, dietType } = userData;
        const baseCalories = parseInt(calories);

        // Enhanced meal database with variety
        const mealDatabase = {
            'weight-loss': {
                breakfast: [
                    { name: 'Greek Yogurt Parfait', quantity: '200g yogurt + berries', calories: 220, protein: 18, carbs: 25 },
                    { name: 'Oatmeal with Almonds', quantity: '½ cup oats + 10 almonds', calories: 280, protein: 8, carbs: 35 },
                    { name: 'Egg White Omelette', quantity: '4 egg whites + veggies', calories: 120, protein: 15, carbs: 8 }
                ],
                lunch: [
                    { name: 'Grilled Chicken Salad', quantity: '150g chicken + mixed greens', calories: 280, protein: 35, carbs: 12 },
                    { name: 'Turkey Wrap', quantity: '100g turkey + lettuce wrap', calories: 220, protein: 28, carbs: 15 },
                    { name: 'Quinoa Bowl', quantity: '½ cup quinoa + vegetables', calories: 240, protein: 9, carbs: 38 }
                ],
                dinner: [
                    { name: 'Baked Salmon', quantity: '150g salmon + broccoli', calories: 320, protein: 35, carbs: 8 },
                    { name: 'Lean Beef Stir Fry', quantity: '120g beef + mixed veggies', calories: 280, protein: 32, carbs: 15 },
                    { name: 'Grilled Turkey Breast', quantity: '150g turkey + sweet potato', calories: 260, protein: 38, carbs: 18 }
                ],
                snacks: [
                    { name: 'Apple with Almond Butter', quantity: '1 apple + 1 tbsp almond butter', calories: 180, protein: 4, carbs: 22 },
                    { name: 'Protein Shake', quantity: '1 scoop protein powder', calories: 120, protein: 25, carbs: 3 },
                    { name: 'Greek Yogurt', quantity: '150g plain yogurt', calories: 100, protein: 15, carbs: 6 }
                ]
            },
            'weight-gain': {
                breakfast: [
                    { name: 'Protein Pancakes', quantity: '3 pancakes + peanut butter', calories: 450, protein: 25, carbs: 45 },
                    { name: 'Breakfast Burrito', quantity: 'Whole wheat tortilla + eggs + cheese', calories: 520, protein: 28, carbs: 38 },
                    { name: 'Avocado Toast Deluxe', quantity: '2 slices bread + avocado + eggs', calories: 480, protein: 18, carbs: 35 }
                ],
                lunch: [
                    { name: 'Chicken Rice Bowl', quantity: '200g chicken + 1 cup rice + veggies', calories: 650, protein: 45, carbs: 65 },
                    { name: 'Pasta with Meat Sauce', quantity: '200g pasta + 150g ground beef', calories: 720, protein: 38, carbs: 75 },
                    { name: 'Tuna Sandwich Meal', quantity: '2 sandwiches + fruit + nuts', calories: 580, protein: 35, carbs: 55 }
                ],
                dinner: [
                    { name: 'Steak Dinner', quantity: '200g steak + potatoes + salad', calories: 680, protein: 50, carbs: 45 },
                    { name: 'Salmon with Quinoa', quantity: '200g salmon + 1 cup quinoa + veggies', calories: 650, protein: 42, carbs: 55 },
                    { name: 'Chicken Parmesan', quantity: '200g chicken + pasta + sauce', calories: 720, protein: 48, carbs: 60 }
                ],
                snacks: [
                    { name: 'Trail Mix', quantity: '½ cup mixed nuts and dried fruit', calories: 350, protein: 12, carbs: 25 },
                    { name: 'Protein Bar + Banana', quantity: '1 bar + 1 banana', calories: 320, protein: 20, carbs: 45 },
                    { name: 'Cheese and Crackers', quantity: '2 oz cheese + 10 crackers', calories: 380, protein: 15, carbs: 30 }
                ]
            },
            'maintenance': {
                breakfast: [
                    { name: 'Balanced Breakfast Bowl', quantity: 'Oats + fruit + nuts + yogurt', calories: 380, protein: 15, carbs: 50 },
                    { name: 'Veggie Omelette', quantity: '3 eggs + mixed vegetables + toast', calories: 350, protein: 22, carbs: 28 },
                    { name: 'Smoothie Bowl', quantity: 'Fruit + yogurt + granola', calories: 320, protein: 12, carbs: 55 }
                ],
                lunch: [
                    { name: 'Mediterranean Salad', quantity: 'Grilled chicken + feta + olives + pita', calories: 450, protein: 35, carbs: 35 },
                    { name: 'Turkey Club Sandwich', quantity: 'Turkey + bacon + avocado + bread', calories: 480, protein: 32, carbs: 38 },
                    { name: 'Stir Fry Bowl', quantity: 'Tofu/chicken + rice + vegetables', calories: 420, protein: 28, carbs: 52 }
                ],
                dinner: [
                    { name: 'Grilled Fish Dinner', quantity: '180g fish + quinoa + asparagus', calories: 420, protein: 38, carbs: 35 },
                    { name: 'Pasta Primavera', quantity: '180g pasta + vegetables + chicken', calories: 480, protein: 32, carbs: 58 },
                    { name: 'Beef Tacos', quantity: '150g beef + 2 tortillas + toppings', calories: 450, protein: 35, carbs: 32 }
                ],
                snacks: [
                    { name: 'Mixed Nuts', quantity: '¼ cup almonds and walnuts', calories: 200, protein: 7, carbs: 8 },
                    { name: 'Fruit and Cheese', quantity: '1 apple + 1 oz cheese', calories: 180, protein: 8, carbs: 20 },
                    { name: 'Yogurt with Berries', quantity: '150g yogurt + ½ cup berries', calories: 150, protein: 12, carbs: 18 }
                ]
            },
            'muscle-building': {
                breakfast: [
                    { name: 'Muscle Builder Omelette', quantity: '6 egg whites + 2 yolks + spinach', calories: 320, protein: 32, carbs: 8 },
                    { name: 'Protein Packed Smoothie', quantity: '2 scoops protein + banana + peanut butter', calories: 480, protein: 45, carbs: 45 },
                    { name: 'Chicken Sausage Scramble', quantity: '150g chicken sausage + eggs + veggies', calories: 420, protein: 38, carbs: 12 }
                ],
                lunch: [
                    { name: 'Power Protein Bowl', quantity: '200g chicken + rice + broccoli + sweet potato', calories: 650, protein: 55, carbs: 65 },
                    { name: 'Tuna Steak Salad', quantity: '200g tuna + mixed greens + quinoa', calories: 520, protein: 48, carbs: 35 },
                    { name: 'Beef and Rice Plate', quantity: '200g lean beef + 1.5 cups rice + veggies', calories: 680, protein: 52, carbs: 70 }
                ],
                dinner: [
                    { name: 'Salmon Power Dinner', quantity: '200g salmon + couscous + asparagus', calories: 580, protein: 45, carbs: 45 },
                    { name: 'Turkey Meatballs', quantity: '200g turkey + pasta + marinara', calories: 620, protein: 48, carbs: 55 },
                    { name: 'Grilled Chicken Breast', quantity: '250g chicken + potatoes + green beans', calories: 550, protein: 65, carbs: 35 }
                ],
                snacks: [
                    { name: 'Whey Protein Shake', quantity: '1 scoop whey + water', calories: 120, protein: 25, carbs: 2 },
                    { name: 'Greek Yogurt with Whey', quantity: '200g yogurt + ½ scoop protein', calories: 220, protein: 30, carbs: 12 },
                    { name: 'Cottage Cheese Bowl', quantity: '200g cottage cheese + fruit', calories: 180, protein: 25, carbs: 15 }
                ]
            }
        };

        const goalMeals = mealDatabase[goal] || mealDatabase['maintenance'];

        // Randomly select meals for variety
        const getRandomMeal = (mealArray) => mealArray[Math.floor(Math.random() * mealArray.length)];

        const meals = {
            breakfast: [getRandomMeal(goalMeals.breakfast)],
            lunch: [getRandomMeal(goalMeals.lunch)],
            dinner: [getRandomMeal(goalMeals.dinner)],
            snacks: [
                getRandomMeal(goalMeals.snacks),
                getRandomMeal(goalMeals.snacks)
            ]
        };

        return {
            userName: userData.name ? userData.name.trim() : 'You',
            goal,
            calories: baseCalories,
            lifestyle,
            dietType,
            meals,
            totalCalories: this.calculateTotalCalories(meals),
            macros: this.calculateMacros(meals),
            createdAt: new Date().toISOString()
        };
    }

    calculateTotalCalories(meals) {
        let total = 0;
        Object.values(meals).forEach(mealArray => {
            mealArray.forEach(item => total += item.calories);
        });
        return total;
    }

    calculateMacros(meals) {
        let totalProtein = 0, totalCarbs = 0, totalFat = 0;

        Object.values(meals).forEach(meal => {
            meal.forEach(item => {
                totalProtein += item.protein || 0;
                totalCarbs += item.carbs || 0;
                // Estimate fat based on remaining calories
                const estimatedFat = Math.round((item.calories - (item.protein * 4) - (item.carbs * 4)) / 9);
                totalFat += Math.max(0, estimatedFat);
            });
        });

        return { protein: totalProtein, carbs: totalCarbs, fat: totalFat };
    }

    displayPlan(plan) {
        const loadingSection = document.getElementById('loading-section');
        const resultSection = document.getElementById('result-section');

        if (loadingSection) loadingSection.classList.add('hidden');
        if (resultSection) resultSection.classList.remove('hidden');

        // Add success animation
        if (resultSection) resultSection.classList.add('result-appear');

        const resultTitle = document.getElementById('result-title');
        const resultSubtitle = document.getElementById('result-subtitle');
        const resultMetrics = document.getElementById('result-metrics');
        const planContent = document.getElementById('plan-content');

        if (resultTitle) resultTitle.innerHTML = `<i class="fas fa-check-circle"></i> ${plan.userName}, your AI has finished analyzing you`;
        if (resultSubtitle) resultSubtitle.textContent = `Fine-tuned for ${this.capitalize(plan.goal)} | ${this.capitalize(plan.dietType)} | ${this.capitalize(plan.lifestyle)}`;

        if (resultMetrics) {
            resultMetrics.innerHTML = `
                <div class="metric-card starting-point">
                    <strong>${plan.calories}</strong>
                    <span>Your daily calorie target</span>
                    <div class="micro-value">Your starting point</div>
                </div>
                <div class="metric-card"><strong>${plan.macros.protein}g</strong><span>Protein</span></div>
                <div class="metric-card"><strong>${plan.totalCalories}</strong><span>Preview calories</span></div>
            `;
        }

        if (planContent) planContent.innerHTML = this.renderEnhancedPlanHTML(plan);

        // Track plan generation
        this.trackEvent('plan_generated', {
            goal: plan.goal,
            calories: plan.calories,
            totalCalories: plan.totalCalories,
            macros: plan.macros
        });
        this.updateFunnel('step3_result');

        this.applyFreemiumOverlay();
        if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    renderEnhancedPlanHTML(plan) {
        const macros = plan.macros;
        const mealKeys = Object.keys(plan.meals);

        return `
            <div class="plan-summary">
                <h3>Daily Calorie Target: ${plan.calories} kcal</h3>
                <p>Goal: ${this.capitalize(plan.goal)} | Lifestyle: ${this.capitalize(plan.lifestyle)}</p>
                ${plan.dietType !== 'balanced' ? `<p>Diet Type: ${this.capitalize(plan.dietType)}</p>` : ''}
                <div class="macros-summary">
                    <div class="macro-item">
                        <span class="macro-value">${macros.protein}g</span>
                        <span class="macro-label">Protein</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-value">${macros.carbs}g</span>
                        <span class="macro-label">Carbs</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-value">${macros.fat}g</span>
                        <span class="macro-label">Fat</span>
                    </div>
                </div>
            </div>

            ${mealKeys.map((mealType, index) => {
                const items = plan.meals[mealType];
                const locked = index >= 2;
                return this.renderEnhancedMealCard(mealType, items, locked);
            }).join('')}

            <div class="plan-footer">
                <p><strong>Total Daily Calories: ${plan.totalCalories}</strong></p>
                <p class="disclaimer">* Nutritional values are approximate. Consult a healthcare professional for personalized advice.</p>
            </div>
        `;
    }

    renderEnhancedMealCard(mealType, items, locked = false) {
        const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
        const totalProtein = items.reduce((sum, item) => sum + (item.protein || 0), 0);

        return `
            <div class="meal-card ${locked ? 'locked' : ''}">
                <div class="meal-header">
                    <h4 class="meal-title">
                        <i class="fas fa-utensils"></i>
                        ${this.capitalize(mealType)}
                    </h4>
                    <div class="meal-nutrition">
                        <span class="meal-calories">${totalCalories} kcal</span>
                        <span class="meal-protein">${totalProtein}g protein</span>
                    </div>
                </div>
                <div class="meal-items">
                    ${items.map(item => `
                        <div class="meal-item">
                            <div class="food-info">
                                <span class="food-name">${item.name}</span>
                                <span class="food-quantity">${item.quantity}</span>
                            </div>
                            <div class="food-nutrition">
                                <span class="food-calories">${item.calories} kcal</span>
                                ${item.protein ? `<span class="food-protein">${item.protein}g protein</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${locked ? '<div class="meal-lock"><i class="fas fa-lock"></i> Locked until premium unlock</div>' : ''}
            </div>
        `;
    }

    applyFreemiumOverlay() {
        const blurOverlay = document.getElementById('blur-overlay');
        const exportBtn = document.getElementById('export-btn');

        if (!this.isPremium) {
            if (blurOverlay) blurOverlay.style.display = 'flex';
            if (exportBtn) exportBtn.classList.add('disabled');
        } else {
            if (blurOverlay) blurOverlay.style.display = 'none';
            if (exportBtn) exportBtn.classList.remove('disabled');
        }
    }

    showEmailModal() {
        this.trackEvent('unlock_clicked', { source: 'plan_preview' });
        this.updateFunnel('step4_unlock_click');

        const emailModal = document.getElementById('email-modal');
        const emailInput = document.getElementById('email-input');

        if (emailModal) emailModal.classList.remove('hidden');
        if (emailInput) emailInput.focus();
    }

    hideEmailModal() {
        const emailModal = document.getElementById('email-modal');
        const emailError = document.getElementById('email-error');
        const emailInput = document.getElementById('email-input');

        if (emailModal) emailModal.classList.add('hidden');
        if (emailError) emailError.style.display = 'none';
        if (emailInput) emailInput.value = '';
    }

    async handleEmailSubmit(e) {
        e.preventDefault();
        const emailInput = document.getElementById('email-input');
        const emailError = document.getElementById('email-error');

        if (!emailInput) return;

        const email = emailInput.value.trim();

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (emailError) {
                emailError.textContent = 'Please enter a valid email address';
                emailError.style.display = 'block';
            }
            return;
        }

        // Collect email via API
        const emailData = {
            email: email,
            userGoal: this.currentPlan?.goal || 'unknown',
            calorieInput: this.currentPlan?.calories || 0
        };

        const result = await this.collectEmail(emailData);

        if (!result.success) {
            if (emailError) {
                emailError.textContent = 'Failed to submit email. Please try again.';
                emailError.style.display = 'block';
            }
            return;
        }

        // Track email submission
        this.trackEvent('email_submitted', {
            email: email,
            userGoal: emailData.userGoal,
            calorieInput: emailData.calorieInput
        });
        this.updateFunnel('step5_email_submit');

        // Store email locally for persistence
        localStorage.setItem('nutriForgeEmail', email);

        // Unlock content
        this.isPremium = true;
        this.applyFreemiumOverlay();

        // Hide modal
        this.hideEmailModal();

        // Show success message
        this.showSuccessMessage();

        // Scroll to show unlocked content
        const resultSection = document.getElementById('result-section');
        if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    showSuccessMessage() {
        const successHTML = `
            <div id="success-message" class="success-message">
                <div class="success-content">
                    <i class="fas fa-check-circle"></i>
                    <h3>🎉 You've unlocked your full plan!</h3>
                    <p>Your complete transformation roadmap is now available below.</p>
                    <button onclick="this.parentElement.parentElement.remove()">Continue</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', successHTML);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const successEl = document.getElementById('success-message');
            if (successEl) successEl.remove();
        }, 5000);
    }

    showPaymentSection() {
        const resultSection = document.getElementById('result-section');
        const paymentSection = document.getElementById('payment-section');

        if (resultSection) resultSection.classList.add('hidden');
        if (paymentSection) paymentSection.classList.remove('hidden');

        // Scroll to payment
        if (paymentSection) paymentSection.scrollIntoView({ behavior: 'smooth' });
    }

    handlePayment() {
        // Enhanced payment simulation
        const paymentEmail = document.getElementById('payment-email');

        if (!paymentEmail || !paymentEmail.value) {
            this.showMessage('error', 'Please enter your email address.');
            return;
        }

        // Simulate payment processing
        const paymentBtn = document.getElementById('payment-btn');
        if (paymentBtn) {
            paymentBtn.textContent = 'Processing...';
            paymentBtn.disabled = true;
        }

        setTimeout(() => {
            this.showMessage('success', 'Payment successful! Welcome to Premium. Your PDF is now available.');

            this.isPremium = true;
            this.applyFreemiumOverlay();
            const resultSection = document.getElementById('result-section');
            const paymentSection = document.getElementById('payment-section');

            if (paymentSection) paymentSection.classList.add('hidden');
            if (resultSection) resultSection.classList.remove('hidden');

            // Reset button
            if (paymentBtn) {
                paymentBtn.textContent = 'Pay $9.99 Securely';
                paymentBtn.disabled = false;
            }
        }, 2000);
    }

    savePlan() {
        if (!this.currentPlan) return;

        const savedPlans = this.getSavedPlans();
        const planId = Date.now().toString();
        savedPlans[planId] = this.currentPlan;

        localStorage.setItem('nutriForgePlans', JSON.stringify(savedPlans));
        this.showMessage('success', 'Plan saved successfully! You can access it anytime.');
    }

    exportPDF() {
        if (!this.isPremium || !this.currentPlan) {
            this.showMessage('error', 'Please upgrade to premium to export PDF.');
            return;
        }

        // Enhanced PDF generation
        if (typeof window.jspdf === 'undefined') {
            this.showMessage('error', 'PDF library not loaded. Please refresh and try again.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('NutriForge - Your Premium Diet Plan', 20, 30);

        // Plan details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        let yPosition = 50;

        doc.text(`Goal: ${this.capitalize(this.currentPlan.goal)}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Daily Calories: ${this.currentPlan.calories}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Lifestyle: ${this.capitalize(this.currentPlan.lifestyle)}`, 20, yPosition);
        yPosition += 20;

        // Macros
        const macros = this.currentPlan.macros;
        doc.setFont('helvetica', 'bold');
        doc.text('Daily Macronutrients:', 20, yPosition);
        yPosition += 10;
        doc.setFont('helvetica', 'normal');
        doc.text(`Protein: ${macros.protein}g | Carbs: ${macros.carbs}g | Fat: ${macros.fat}g`, 20, yPosition);
        yPosition += 20;

        // Meals
        Object.entries(this.currentPlan.meals).forEach(([mealType, items]) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(this.capitalize(mealType), 20, yPosition);
            yPosition += 12;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            items.forEach(item => {
                const nutritionText = item.protein ? ` (${item.calories} kcal, ${item.protein}g protein)` : ` (${item.calories} kcal)`;
                doc.text(`• ${item.name} - ${item.quantity}${nutritionText}`, 30, yPosition);
                yPosition += 8;
            });
            yPosition += 10;
        });

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('* This is a computer-generated plan. Consult a healthcare professional for medical advice.', 20, 280);
        doc.text('Generated by NutriForge - Premium AI Diet Planning', 20, 285);

        // Save the PDF
        const fileName = `nutriForge-plan-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        this.showMessage('success', 'PDF downloaded successfully! Check your downloads folder.');
    }

    loadSavedPlans() {
        return this.getSavedPlans();
    }

    loadUserStatus() {
        const email = localStorage.getItem('nutriForgeEmail');
        if (email) {
            this.isPremium = true;
        }
    }

    // Analytics and Tracking Methods
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSessionId() {
        return 'session_' + Date.now();
    }

    trackEvent(eventName, data = {}) {
        const event = {
            event: eventName,
            timestamp: new Date().toISOString(),
            userId: this.analytics.userId,
            sessionId: this.analytics.sessionId,
            data: data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.analytics.events.push(event);
        console.log('Analytics Event:', JSON.stringify(event, null, 2));

        // In production, send to backend
        // this.sendToAnalytics(event);
    }

    updateFunnel(step) {
        this.funnel[step] = true;
        this.trackEvent('funnel_update', { step, funnel: this.funnel });
    }

    // Email Collection API (Mock)
    async collectEmail(emailData) {
        // Mock API call - in production, this would be a real API
        const payload = {
            email: emailData.email,
            timestamp: new Date().toISOString(),
            userGoal: emailData.userGoal,
            calorieInput: emailData.calorieInput,
            deviceType: this.getDeviceType(),
            userId: this.analytics.userId,
            sessionId: this.analytics.sessionId,
            funnel: this.funnel
        };

        console.log('Email Collection Payload:', JSON.stringify(payload, null, 2));

        // Simulate API call
        try {
            // In production: await fetch('/api/collect-email', { method: 'POST', body: JSON.stringify(payload) });
            await this.mockApiCall(payload);
            return { success: true };
        } catch (error) {
            console.error('Email collection failed:', error);
            return { success: false, error };
        }
    }

    async mockApiCall(payload) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Store in localStorage for demo (in production, this would be on server)
        const emails = JSON.parse(localStorage.getItem('nutriForgeEmails') || '[]');
        emails.push(payload);
        localStorage.setItem('nutriForgeEmails', JSON.stringify(emails));

        return { success: true };
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return 'mobile';
        if (/tablet/i.test(ua)) return 'tablet';
        return 'desktop';
    }

    // Admin Panel
    checkAdminRoute() {
        if (window.location.hash === '#admin') {
            this.showAdminPanel();
        }
    }

    showAdminPanel() {
        const adminHTML = `
            <div id="admin-panel" class="admin-panel">
                <h1>NutriForge Analytics Dashboard</h1>
                <div class="admin-stats">
                    <div class="stat-card">
                        <h3>Total Visitors</h3>
                        <div class="stat-number">${this.getTotalVisitors()}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Emails Collected</h3>
                        <div class="stat-number">${this.getEmailsCollected()}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Conversion Rate</h3>
                        <div class="stat-number">${this.getConversionRate()}%</div>
                    </div>
                    <div class="stat-card">
                        <h3>Unlock Clicks</h3>
                        <div class="stat-number">${this.getUnlockClicks()}</div>
                    </div>
                </div>
                <div class="admin-actions">
                    <button onclick="location.hash=''">Back to App</button>
                    <button onclick="console.log(JSON.stringify(app.analytics.events, null, 2))">Export Events</button>
                </div>
            </div>
        `;

        document.body.innerHTML = adminHTML;
        this.addAdminStyles();
    }

    getTotalVisitors() {
        // In production, this would come from backend
        return this.analytics.events.filter(e => e.event === 'page_view').length;
    }

    getEmailsCollected() {
        const emails = JSON.parse(localStorage.getItem('nutriForgeEmails') || '[]');
        return emails.length;
    }

    getConversionRate() {
        const visitors = this.getTotalVisitors();
        const emails = this.getEmailsCollected();
        return visitors > 0 ? Math.round((emails / visitors) * 100) : 0;
    }

    getUnlockClicks() {
        return this.analytics.events.filter(e => e.event === 'unlock_clicked').length;
    }

    addAdminStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .admin-panel { padding: 40px; max-width: 1200px; margin: 0 auto; }
            .admin-panel h1 { color: var(--text-primary); margin-bottom: 40px; }
            .admin-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: var(--surface-color); padding: 30px; border-radius: var(--border-radius-lg); border: 1px solid var(--border-color); text-align: center; }
            .stat-card h3 { color: var(--text-secondary); margin-bottom: 10px; }
            .stat-number { font-size: 2.5rem; font-weight: 800; color: var(--primary-color); }
            .admin-actions { display: flex; gap: 20px; justify-content: center; }
            .admin-actions button { padding: 12px 24px; border: none; border-radius: var(--border-radius); background: var(--gradient-primary); color: white; cursor: pointer; }
        `;
        document.head.appendChild(style);
    }

    // Stripe Preparation (Placeholder)
    handleRealPayment() {
        // Placeholder for future Stripe integration
        console.log('Real payment processing would start here');
        this.showMessage('info', 'Stripe integration coming soon! For now, this is a demo.');

        // Future structure:
        // 1. Load Stripe.js
        // 2. Create payment intent via API
        // 3. Handle payment confirmation
        // 4. Update user status
    }

    getSavedPlans() {
        const saved = localStorage.getItem('nutriForgePlans');
        return saved ? JSON.parse(saved) : {};
    }

    capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ') : '';
    }

    showMessage(type, message) {
        const msg = document.getElementById('global-message');
        if (!msg) return;

        msg.className = `global-message ${type}`;
        msg.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle"></i> ${message}`;
        msg.style.display = 'block';

        setTimeout(() => {
            if (msg) msg.style.display = 'none';
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NutriForge();

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .field-error {
            color: var(--error-color);
            font-size: 0.85rem;
            margin-top: 4px;
            display: none;
        }

        .global-message {
            display: none;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
        }

        .global-message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .global-message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .global-message.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }

        .macros-summary {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
            padding: 15px;
            background: var(--surface-light);
            border-radius: 8px;
        }

        .macro-item {
            text-align: center;
        }

        .macro-value {
            display: block;
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--primary-color);
        }

        .macro-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .meal-nutrition {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
        }

        .meal-protein {
            font-size: 0.8rem;
            color: var(--accent-color);
        }

        .food-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .food-nutrition {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
            font-size: 0.9rem;
        }

        .food-protein {
            color: var(--success-color);
            font-size: 0.8rem;
        }
    `;
    document.head.appendChild(style);
});