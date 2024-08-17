import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-dom-confetti';

const GOAL_TYPES = {
    FINANCIAL: 'financial',
    COUNTDOWN: 'countdown',
    DATE_SPECIFIC: 'dateSpecific',
    GENERAL: 'general'
};

const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

function GoalTracker() {
    const [goals, setGoals] = useState([]);
    const [celebratingGoal, setCelebratingGoal] = useState(null);

    const addGoal = (newGoal) => {
        setGoals([...goals, { ...newGoal, id: Date.now() }]);
    };

    const updateGoal = (id, updatedData) => {
        setGoals(goals.map(goal =>
            goal.id === id ? { ...goal, ...updatedData } : goal
        ));

        const updatedGoal = goals.find(goal => goal.id === id);
        if (updatedGoal && updatedGoal.type === GOAL_TYPES.FINANCIAL) {
            if (updatedData.currentAmount >= parseFloat(updatedGoal.targetAmount) && !celebratingGoal) {
                setCelebratingGoal(id);
            }
        }
    };

    const deleteGoal = (id) => {
        setGoals(goals.filter(goal => goal.id !== id));
    };

    useEffect(() => {
        if (celebratingGoal) {
            const timer = setTimeout(() => {
                setCelebratingGoal(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [celebratingGoal]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">🎯 Goal Tracker</h1>
            <GoalForm onSubmit={addGoal} goalTypes={GOAL_TYPES} />
            <div className="mt-8 space-y-4">
                {goals.map((goal) => (
                    <GoalItem
                        key={goal.id}
                        goal={goal}
                        updateGoal={updateGoal}
                        deleteGoal={deleteGoal}
                        isCelebrating={celebratingGoal === goal.id}
                    />
                ))}
            </div>
        </div>
    );
}

function GoalForm({ onSubmit, goalTypes }) {
    const [goal, setGoal] = useState({
        name: '',
        type: '',
        targetAmount: '',
        currentAmount: 0,
        deadline: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(goal);
        setGoal({ name: '', type: '', targetAmount: '', currentAmount: 0, deadline: '', description: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md rounded-lg p-6">
            <input
                type="text"
                value={goal.name}
                onChange={(e) => setGoal({...goal, name: e.target.value})}
                placeholder="Goal Name"
                required
                className="w-full p-2 border rounded"
            />

            <select
                value={goal.type}
                onChange={(e) => setGoal({...goal, type: e.target.value})}
                required
                className="w-full p-2 border rounded"
            >
                <option value="">Select Goal Type</option>
                {Object.entries(goalTypes).map(([key, value]) => (
                    <option key={key} value={value}>{key}</option>
                ))}
            </select>

            {goal.type === GOAL_TYPES.FINANCIAL && (
                <>
                    <input
                        type="number"
                        value={goal.targetAmount}
                        onChange={(e) => setGoal({...goal, targetAmount: e.target.value})}
                        placeholder="Target Amount"
                        required
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="number"
                        value={goal.currentAmount}
                        onChange={(e) => setGoal({...goal, currentAmount: e.target.value})}
                        placeholder="Current Amount"
                        required
                        className="w-full p-2 border rounded"
                    />
                </>
            )}

            {(goal.type === GOAL_TYPES.COUNTDOWN || goal.type === GOAL_TYPES.DATE_SPECIFIC) && (
                <input
                    type="date"
                    value={goal.deadline}
                    onChange={(e) => setGoal({...goal, deadline: e.target.value})}
                    required
                    className="w-full p-2 border rounded"
                />
            )}

            <textarea
                value={goal.description}
                onChange={(e) => setGoal({...goal, description: e.target.value})}
                placeholder="Description"
                className="w-full p-2 border rounded"
            />

            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
                Add Goal
            </button>
        </form>
    );
}

function GoalItem({ goal, updateGoal, deleteGoal, isCelebrating }) {
    const renderGoalContent = () => {
        switch(goal.type) {
            case GOAL_TYPES.FINANCIAL:
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                    <>
                        <p>Target: ${goal.targetAmount}</p>
                        <p>Current: ${goal.currentAmount}</p>
                        <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <input
                            type="number"
                            placeholder="Add progress"
                            className="mt-2 p-1 border rounded mr-2"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    updateGoal(goal.id, { currentAmount: parseFloat(goal.currentAmount) + parseFloat(e.target.value) });
                                    e.target.value = '';
                                }
                            }}
                        />
                    </>
                );
            case GOAL_TYPES.COUNTDOWN:
            case GOAL_TYPES.DATE_SPECIFIC:
                const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                    <>
                        <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                        <p>Days left: {daysLeft}</p>
                    </>
                );
            case GOAL_TYPES.GENERAL:
                return <p>{goal.description}</p>;
            default:
                return null;
        }
    };

    return (
        <motion.div
            className="bg-white p-4 rounded-lg shadow relative overflow-hidden"
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
        >
            <h3 className="text-xl font-semibold">{goal.name}</h3>
            {renderGoalContent()}
            <button
                onClick={() => deleteGoal(goal.id)}
                className="mt-2 bg-red-500 text-white p-1 rounded hover:bg-red-600 transition"
            >
                Delete
            </button>
            <AnimatePresence>
                {isCelebrating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-bold">Goal Achieved!</h3>
                            <p>You're crushing it! 🎉</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <Confetti active={isCelebrating} config={confettiConfig} />
        </motion.div>
    );
}

export default GoalTracker;