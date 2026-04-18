"""
Study Analysis Model
Generates personalized study plans based on performance, weak subjects, and stress levels
"""

class StudyAnalysisModel:
    
    def __init__(self, performance_data, stress_level, weak_subjects, strong_subjects):
        """
        Initialize study analysis with performance and stress data
        
        Args:
            performance_data: dict with GPA, percentage, performance_level
            stress_level: str (low, medium, high, critical)
            weak_subjects: list of weak subjects
            strong_subjects: list of strong subjects
        """
        self.performance_data = performance_data
        self.stress_level = stress_level
        self.weak_subjects = weak_subjects or []
        self.strong_subjects = strong_subjects or []
        self.gpa = performance_data.get("gpa", 0)
        self.percentage = performance_data.get("percentage", 0)
        self.performance_level = performance_data.get("performance_level", "Unknown")
    
    def generate_study_plan(self):
        """Generate comprehensive study plan"""
        
        return {
            "overview": self._generate_overview(),
            "study_schedule": self._generate_study_schedule(),
            "subject_strategies": self._generate_subject_strategies(),
            "weak_subject_plan": self._generate_weak_subject_plan(),
            "revision_strategy": self._generate_revision_strategy(),
            "stress_management": self._generate_stress_management(),
            "exam_preparation": self._generate_exam_prep(),
            "motivation_tips": self._generate_motivation_tips(),
            "weekly_goals": self._generate_weekly_goals(),
            "resources": self._generate_resources(),
            "timeline": self._generate_timeline()
        }
    
    def _generate_overview(self):
        """Generate study plan overview"""
        
        if self.percentage >= 85:
            focus = "Maintain Excellence"
            strategy = "Focus on advanced concepts and scoring full marks"
        elif self.percentage >= 70:
            focus = "Improve Consistency"
            strategy = "Balance all subjects and improve weak areas"
        elif self.percentage >= 50:
            focus = "Catch Up & Recovery"
            strategy = "Intensive revision of fundamentals"
        else:
            focus = "Emergency Mode"
            strategy = "Focus on passing criteria and core concepts"
        
        return {
            "current_performance": self.performance_level,
            "gpa": self.gpa,
            "percentage": self.percentage,
            "focus_area": focus,
            "overall_strategy": strategy,
            "estimated_improvement": f"+5-10% in 4 weeks with consistent effort",
            "priority_level": "HIGH" if self.percentage < 60 else "MEDIUM" if self.percentage < 75 else "LOW"
        }
    
    def _generate_study_schedule(self):
        """Generate weekly study schedule"""
        
        if self.stress_level in ["high", "critical"]:
            study_hours_per_day = 3
            break_every_mins = 15
        else:
            study_hours_per_day = 5
            break_every_mins = 25
        
        schedule = {
            "daily_schedule": {
                "morning": {
                    "time": "6:00 AM - 9:00 AM",
                    "focus": "Theory subjects and weak areas",
                    "duration": "3 hours",
                    "break": "5 min after every 50 min"
                },
                "afternoon": {
                    "time": "2:00 PM - 5:00 PM",
                    "focus": "Practical/computational subjects and problem solving",
                    "duration": "3 hours",
                    "break": "5 min after every 50 min"
                },
                "evening": {
                    "time": "7:00 PM - 9:00 PM",
                    "focus": "Revision and practice questions",
                    "duration": "2 hours",
                    "break": "5 min after every 45 min"
                }
            },
            "weekly_breakdown": {
                "Monday": ["Theory Review", "Weak Subject Focus", "Assignment 1"],
                "Tuesday": ["Problem Solving", "Practice Tests", "Assignment 2"],
                "Wednesday": ["Revision Day", "Previous Topics", "Quiz Practice"],
                "Thursday": ["New Concepts", "Weak Subjects", "Assignment 3"],
                "Friday": ["Integration", "Concept Connection", "Doubt Clearing"],
                "Saturday": ["Mock Test", "Full Length Practice", "Performance Review"],
                "Sunday": ["Rest Day", "Light Review", "Plan Next Week"]
            },
            "total_weekly_hours": 35,
            "rest_days": 1,
            "study_session_length": f"{study_hours_per_day} hours daily"
        }
        
        return schedule
    
    def _generate_subject_strategies(self):
        """Generate subject-specific study strategies"""
        
        strategies = {
            "theory_subjects": {
                "approach": "Conceptual Understanding",
                "tips": [
                    "Create mind maps for each concept",
                    "Write notes in your own words",
                    "Relate concepts to real-world examples",
                    "Draw diagrams and flowcharts",
                    "Group similar concepts together",
                    "Review previous notes before each session"
                ],
                "resources": ["Textbooks", "Video lectures", "Online tutorials", "Documentary videos"],
                "daily_time": "2-3 hours"
            },
            "practical_subjects": {
                "approach": "Hands-on Practice",
                "tips": [
                    "Solve problems step by step",
                    "Practice multiple variations",
                    "Understand logic before memorizing",
                    "Use online coding platforms/labs",
                    "Build projects",
                    "Explain solutions to others"
                ],
                "resources": ["Practice problems", "Online judges", "Lab manuals", "GitHub repositories"],
                "daily_time": "2-3 hours"
            },
            "mixed_subjects": {
                "approach": "Balanced Learning",
                "tips": [
                    "Spend 60% on concepts, 40% on practice",
                    "Use flowcharts to connect theory and practice",
                    "Do case studies",
                    "Solve application-based problems",
                    "Create comparison tables",
                    "Link concepts to equations"
                ],
                "resources": ["Both theory and practical resources", "Case studies", "Applications"],
                "daily_time": "2.5-3 hours"
            }
        }
        
        return strategies
    
    def _generate_weak_subject_plan(self):
        """Generate detailed plan for weak subjects"""
        
        if not self.weak_subjects:
            return {
                "status": "No weak subjects identified",
                "congratulations": "Your performance is balanced across all subjects!"
            }
        
        weak_plan = {
            "subjects": self.weak_subjects,
            "focus_intensity": "HIGH" if len(self.weak_subjects) > 2 else "MEDIUM",
            "time_allocation": f"{min(40, 30 + len(self.weak_subjects) * 5)}% of total study time",
            "phases": {
                "phase_1_fundamentals": {
                    "duration": "1 week",
                    "focus": "Re-learn basics",
                    "activities": [
                        "Watch foundational videos",
                        "Read basic concepts from textbook",
                        "Create concept maps",
                        "Do beginner-level problems"
                    ]
                },
                "phase_2_concepts": {
                    "duration": "2 weeks",
                    "focus": "Deep understanding",
                    "activities": [
                        "Solve moderate difficulty problems",
                        "Connect concepts",
                        "Do practice tests",
                        "Clarify doubts with mentor"
                    ]
                },
                "phase_3_application": {
                    "duration": "1 week",
                    "focus": "Apply knowledge",
                    "activities": [
                        "Solve advanced problems",
                        "Take full-length tests",
                        "Review mistakes",
                        "Master all question types"
                    ]
                }
            },
            "expected_improvement": "+15-20% in 3-4 weeks",
            "resources_needed": [
                "Subject tutor or peer mentor",
                "Online tutorials (YouTube)",
                "Practice problem sets",
                "Solution manuals"
            ]
        }
        
        return weak_plan
    
    def _generate_revision_strategy(self):
        """Generate revision and retention strategy"""
        
        return {
            "spaced_repetition": {
                "day_1": "First revision - same day",
                "day_3": "Second revision - 3 days later",
                "day_7": "Third revision - 1 week later",
                "day_14": "Fourth revision - 2 weeks later",
                "day_28": "Fifth revision - 1 month later"
            },
            "active_recall_methods": [
                "Flashcards (physical or Anki app)",
                "Practice tests without notes",
                "Teach concepts to someone else",
                "Write summaries from memory",
                "Make questions while studying"
            ],
            "revision_schedule": {
                "daily": "30 min - Review today's concepts",
                "weekly": "2 hours - Review week's topics",
                "bi_weekly": "3 hours - Full subject revision",
                "monthly": "Full day - Comprehensive review"
            },
            "retention_tips": [
                "Mix study materials",
                "Don't re-read passive",
                "Test yourself frequently",
                "Explain out loud",
                "Use multiple senses (write, speak, visualize)"
            ]
        }
    
    def _generate_stress_management(self):
        """Generate stress management strategies"""
        
        stress_plan = {
            "current_stress_level": self.stress_level.upper(),
            "immediate_actions": [
                "Take 5-minute deep breathing breaks every 50 minutes",
                "Exercise 30 minutes daily (jogging, yoga, sports)",
                "Get 7-8 hours of sleep",
                "Limit screen time 1 hour before bed",
                "Eat balanced meals (avoid junk food)"
            ],
            "relaxation_techniques": [
                "Box Breathing: 4-4-4-4 pattern",
                "Progressive Muscle Relaxation",
                "Meditation (5-10 min daily)",
                "Yoga (20 min daily)",
                "Nature walk (15 min daily)"
            ],
            "study_environment": [
                "Quiet, well-lit room",
                "Minimal distractions",
                "Comfortable seating",
                "Phone on silent/away",
                "Water bottle nearby"
            ],
            "mental_wellness": [
                "Discuss concerns with mentors",
                "Join study groups",
                "Celebrate small wins",
                "Don't compare with others",
                "Maintain hobbies"
            ],
            "daily_routine": {
                "sleep": "10 PM - 6 AM (8 hours)",
                "exercise": "6:30 AM - 7:00 AM",
                "breakfast": "7:00 AM - 7:30 AM",
                "study_1": "8:00 AM - 11:00 AM",
                "break": "11:00 AM - 12:00 PM",
                "lunch": "12:00 PM - 1:00 PM",
                "free_time": "1:00 PM - 2:00 PM",
                "study_2": "2:00 PM - 5:00 PM",
                "exercise": "5:00 PM - 6:00 PM",
                "dinner": "6:30 PM - 7:30 PM",
                "study_3": "7:30 PM - 9:00 PM",
                "free_time": "9:00 PM - 10:00 PM"
            }
        }
        
        if self.stress_level in ["high", "critical"]:
            stress_plan["urgent_recommendations"] = [
                "Reduce study load to 3-4 hours initially",
                "Consult counselor or therapist",
                "Consider medical check-up",
                "Join stress relief groups",
                "Practice mindfulness daily"
            ]
        
        return stress_plan
    
    def _generate_exam_prep(self):
        """Generate exam preparation strategy"""
        
        return {
            "weeks_before_exam": {
                "4_weeks_before": [
                    "Complete all curriculum topics",
                    "Solve at least 50% practice problems",
                    "Identify weak areas",
                    "Create revision notes"
                ],
                "2_weeks_before": [
                    "Solve 100% practice problems",
                    "Take 3-4 mock tests",
                    "Focus on weak subjects",
                    "Improve weak question types"
                ],
                "1_week_before": [
                    "Take 2 full mock tests",
                    "Review solutions",
                    "Practice time management",
                    "Reduce new content, focus on revision"
                ],
                "3_days_before": [
                    "Light revision only",
                    "Don't start new topics",
                    "Get good sleep",
                    "Stay confident"
                ],
                "1_day_before": [
                    "No studying",
                    "Check exam venue and time",
                    "Prepare materials",
                    "Relax and sleep well"
                ]
            },
            "exam_day_tips": [
                "Reach 30 minutes early",
                "Read all questions first (2 minutes)",
                "Attempt easy questions first",
                "Manage time carefully",
                "Don't panic if stuck",
                "Review answers if time permits"
            ],
            "mock_test_analysis": [
                "Calculate percentage for each subject",
                "Identify question types where you lose marks",
                "Note common mistakes",
                "Measure time management",
                "Focus improvement areas"
            ]
        }
    
    def _generate_motivation_tips(self):
        """Generate motivation and mindset tips"""
        
        return {
            "affirmations": [
                "I am capable of achieving my goals",
                "Every study session brings me closer to success",
                "Challenges help me grow stronger",
                "I choose to focus on progress, not perfection",
                "My effort will be rewarded"
            ],
            "progress_tracking": [
                "Keep a study diary",
                "Track daily hours studied",
                "Note topics completed",
                "Record mock test scores",
                "Celebrate milestones every week"
            ],
            "reward_system": {
                "daily_target": "1 hour entertainment",
                "weekly_target": "Half day outing/favorite food",
                "milestone_target": "Full day off + special reward"
            },
            "dealing_with_failures": [
                "Mock test score low? It's for practice, learn from it",
                "Failed in a test? Analyze and improve",
                "Forgot concepts? Review and re-learn",
                "Lost motivation? Take a break and restart",
                "Feeling stuck? Talk to mentor"
            ],
            "building_confidence": [
                "Review your progress weekly",
                "Remember past successes",
                "Positive self-talk",
                "Study with confident people",
                "Celebrate small wins"
            ]
        }
    
    def _generate_weekly_goals(self):
        """Generate specific weekly goals"""
        
        return {
            "week_1": {
                "goal": "Foundation Building",
                "target": "Complete 50% of weak subject basics",
                "study_hours": 25,
                "assessments": "1 diagnostic test",
                "measurable": "Score 40-50% in diagnostic"
            },
            "week_2": {
                "goal": "Concept Mastery",
                "target": "Complete all weak subject topics",
                "study_hours": 28,
                "assessments": "2 practice tests (1 per weak subject)",
                "measurable": "Score 50-60% in practice tests"
            },
            "week_3": {
                "goal": "Integration & Practice",
                "target": "Solve 80% of practice problems",
                "study_hours": 30,
                "assessments": "1 full mock test",
                "measurable": "Score 60-70% in mock test"
            },
            "week_4": {
                "goal": "Mastery & Confidence",
                "target": "Score 70%+ consistently",
                "study_hours": 30,
                "assessments": "2 full mock tests",
                "measurable": "Score 70%+ in 2 consecutive mocks"
            },
            "ongoing": {
                "daily": "4-5 hours focused study",
                "exercises": "Solve 20-30 practice problems",
                "revision": "30 min previous concepts",
                "assessment": "1 daily quiz/test"
            }
        }
    
    def _generate_resources(self):
        """Generate recommended resources"""
        
        return {
            "online_platforms": [
                "Khan Academy - concept videos",
                "Coursera - structured courses",
                "Udemy - subject-specific courses",
                "YouTube - subject tutorials",
                "Brilliant.org - interactive learning",
                "LeetCode/HackerRank - programming practice"
            ],
            "study_materials": [
                "NCERT textbooks",
                "Previous year question papers",
                "Mock test papers",
                "Solution manuals",
                "Subject-specific guides",
                "Reference books"
            ],
            "tools_and_apps": [
                "Anki - Flashcard app",
                "Notion - Study notes",
                "Forest - Focus timer",
                "Todoist - Task management",
                "Wolfram Alpha - Problem solving",
                "Desmos - Math visualization"
            ],
            "community": [
                "Study groups (4-5 students)",
                "Online forums (Reddit, Quora)",
                "Discord study servers",
                "Tutoring platforms",
                "Peer mentoring",
                "YouTube community posts"
            ]
        }
    
    def _generate_timeline(self):
        """Generate overall study timeline to exam"""
        
        return {
            "duration": "4 weeks intensive preparation",
            "phases": [
                {
                    "week": 1,
                    "focus": "Assessment & Planning",
                    "goals": ["Diagnose weaknesses", "Create detailed plan", "Build routine"]
                },
                {
                    "week": 2,
                    "focus": "Intensive Learning",
                    "goals": ["Complete all topics", "Start practice problems", "Initial revisions"]
                },
                {
                    "week": 3,
                    "focus": "Practice & Mastery",
                    "goals": ["Solve all problems", "Take mock tests", "Identify patterns"]
                },
                {
                    "week": 4,
                    "focus": "Final Preparation",
                    "goals": ["Full mock tests", "Confidence building", "Exam day readiness"]
                }
            ],
            "checkpoints": [
                {"checkpoint": "End of Week 1", "target_score": "40-50%"},
                {"checkpoint": "End of Week 2", "target_score": "50-60%"},
                {"checkpoint": "End of Week 3", "target_score": "60-70%"},
                {"checkpoint": "End of Week 4", "target_score": "70%+"}
            ],
            "final_review": {
                "1_day_before": "Light review only",
                "exam_day": "Final confidence check",
                "post_exam": "Performance analysis"
            }
        }
    
    def get_detailed_recommendations(self):
        """Get all recommendations as a single comprehensive object"""
        
        return {
            "student_profile": {
                "current_performance": self.percentage,
                "performance_level": self.performance_level,
                "stress_status": self.stress_level.upper(),
                "weak_subjects_count": len(self.weak_subjects),
                "strong_subjects_count": len(self.strong_subjects)
            },
            "study_plan": self.generate_study_plan(),
            "generated_at": "2026-04-17",
            "next_review": "After 1 week"
        }
